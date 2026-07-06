import DateTimePicker from '@react-native-community/datetimepicker';
import { asc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Switch } from 'react-native';

import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { notificationSchedules } from '@/db/schema';
import {
  applySchedules,
  ensureDefaultSchedules,
  hasNotificationPermission,
  parseTime,
  requestNotificationPermission,
  setScheduleEnabled,
  setScheduleTime,
} from '@/notifications';
import { useTheme } from '@/hooks/use-theme';

function timeToDate(time: string): Date {
  const { hour, minute } = parseTime(time);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(time: string): string {
  return timeToDate(time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [androidPickerFor, setAndroidPickerFor] = useState<number | null>(null);

  const { data: schedules } = useLiveQuery(
    db.select().from(notificationSchedules).orderBy(asc(notificationSchedules.time)),
  );

  useEffect(() => {
    (async () => {
      await ensureDefaultSchedules();
      setPermission(await hasNotificationPermission());
    })();
  }, []);

  const enableReminders = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted);
    if (granted) await applySchedules();
  };

  return (
    <Screen title="Settings">
      <Card title="Check-in times">
        <ThemedText type="small" themeColor="textSecondary">
          Three gentle nudges a day. Adjust them to your rhythm.
        </ThemedText>

        {permission === false ? (
          <Button label="Enable reminders" onPress={enableReminders} />
        ) : null}

        {schedules?.map((row) => (
          <ThemedView key={row.id} style={styles.scheduleRow}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                mode="time"
                display="compact"
                value={timeToDate(row.time)}
                onChange={(_, date) => {
                  if (date) setScheduleTime(row.id, dateToTime(date));
                }}
              />
            ) : (
              <Pressable onPress={() => setAndroidPickerFor(row.id)}>
                <ThemedText type="smallBold">{formatTime(row.time)}</ThemedText>
              </Pressable>
            )}
            {Platform.OS !== 'ios' && androidPickerFor === row.id ? (
              <DateTimePicker
                mode="time"
                value={timeToDate(row.time)}
                onChange={(_, date) => {
                  setAndroidPickerFor(null);
                  if (date) setScheduleTime(row.id, dateToTime(date));
                }}
              />
            ) : null}
            <Switch
              value={row.enabled}
              onValueChange={(enabled) => setScheduleEnabled(row.id, enabled)}
              trackColor={{ true: theme.tint }}
            />
          </ThemedView>
        ))}
      </Card>

      <Card title="If it's heavy right now">
        <ThemedText type="small" themeColor="textSecondary">
          You don’t have to carry it alone. These lines are free, confidential, and always
          open — and calling works even without internet.
        </ThemedText>
        <Button
          label="Call or text 988 — Suicide & Crisis Lifeline"
          variant="secondary"
          onPress={() => Linking.openURL('tel:988')}
        />
        <Button
          label="Call SAMHSA 1-800-662-4357 — substance use help"
          variant="secondary"
          onPress={() => Linking.openURL('tel:18006624357')}
        />
      </Card>

      <Card title="Vault rules">
        <ThemedText type="small" themeColor="textSecondary">
          Manage which apps are locked and your default unlock durations. Available in milestone
          M3.
        </ThemedText>
      </Card>

      <Card title="About">
        <ThemedText type="small" themeColor="textSecondary">
          WHOIAM {Constants.expoConfig?.version ?? ''} — your data stays on this device. No
          account needed.
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.one,
  },
});
