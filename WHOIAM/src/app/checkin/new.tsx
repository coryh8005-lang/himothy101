import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ChoiceChips } from '@/components/choice-chips';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { goals } from '@/db/schema';
import { completeCheckIn, MOOD_LABELS } from '@/features/checkins';
import { useTheme } from '@/hooks/use-theme';

const MOOD_CHOICES = MOOD_LABELS.map((label, i) => ({ value: i + 1, label }));
const URGE_CHOICES = Array.from({ length: 11 }, (_, i) => ({ value: i, label: String(i) }));

export default function NewCheckInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [mood, setMood] = useState<number | null>(null);
  const [urge, setUrge] = useState<number | null>(null);
  const [hadSlip, setHadSlip] = useState(false);
  const [slipGoalId, setSlipGoalId] = useState<number | null>(null);
  const [slipWhat, setSlipWhat] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: activeGoals } = useLiveQuery(
    db.select().from(goals).where(eq(goals.status, 'active')),
  );

  const save = async () => {
    if (mood === null || urge === null || saving) return;
    setSaving(true);
    try {
      await completeCheckIn({ mood, urge, hadSlip, note, slipGoalId, slipWhat });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle">Check in</ThemedText>
            <ThemedText themeColor="textSecondary">
              30 seconds of honesty. There are no wrong answers.
            </ThemedText>

            <ThemedText type="smallBold" themeColor="textSecondary">
              How are you feeling?
            </ThemedText>
            <ChoiceChips choices={MOOD_CHOICES} value={mood} onChange={setMood} />

            <ThemedText type="smallBold" themeColor="textSecondary">
              How strong is the urge right now? (0 = none, 10 = overwhelming)
            </ThemedText>
            <ChoiceChips choices={URGE_CHOICES} value={urge} onChange={setUrge} />

            <ThemedView style={styles.slipRow}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.slipLabel}>
                Did you slip since your last check-in?
              </ThemedText>
              <Switch
                value={hadSlip}
                onValueChange={setHadSlip}
                trackColor={{ true: theme.tint }}
              />
            </ThemedView>

            {hadSlip ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Naming it is the strong move — this is data, not a verdict.
                </ThemedText>
                {activeGoals && activeGoals.length > 0 ? (
                  <ChoiceChips
                    choices={activeGoals.map((g) => ({ value: g.id, label: g.title }))}
                    value={slipGoalId}
                    onChange={setSlipGoalId}
                  />
                ) : null}
                <TextField
                  placeholder="What happened? (optional)"
                  value={slipWhat}
                  onChangeText={setSlipWhat}
                  maxLength={200}
                />
              </>
            ) : null}

            <TextField
              label="Anything else? (optional)"
              placeholder="A sentence for future you"
              value={note}
              onChangeText={setNote}
              multiline
              style={styles.noteInput}
              maxLength={280}
            />
          </ScrollView>
          <ThemedView style={styles.actions}>
            <Button
              label="Save check-in"
              disabled={mood === null || urge === null || saving}
              onPress={save}
            />
            <Button label="Not now" variant="ghost" disabled={saving} onPress={() => router.back()} />
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
    padding: Spacing.four,
  },
  form: {
    gap: Spacing.three,
  },
  slipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  slipLabel: {
    flexShrink: 1,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
