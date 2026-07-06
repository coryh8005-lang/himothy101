import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { goals, streaks } from '@/db/schema';
import { archiveGoal, GOAL_KINDS, streakLabel } from '@/features/goals';

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = Number(id);

  const { data } = useLiveQuery(
    db
      .select()
      .from(goals)
      .leftJoin(streaks, eq(streaks.goalId, goals.id))
      .where(eq(goals.id, goalId)),
    [goalId],
  );
  const row = data?.[0];

  const confirmArchive = () => {
    Alert.alert(
      'Archive this goal?',
      'It disappears from Today but nothing is deleted — your history stays in Progress.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archiveGoal(goalId);
            router.back();
          },
        },
      ],
    );
  };

  if (!row) {
    return <ThemedView style={styles.root} />;
  }

  const goal = row.goals;
  const kindMeta = GOAL_KINDS.find((k) => k.kind === goal.kind);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedView style={styles.content}>
          <ThemedText type="smallBold" themeColor="tint" style={styles.kind}>
            {kindMeta?.label.toUpperCase()}
          </ThemedText>
          <ThemedText type="subtitle">{goal.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {streakLabel(row.streaks?.current)}
          </ThemedText>

          {goal.motivationText ? (
            <Card title="Why it matters">
              <ThemedText>{goal.motivationText}</ThemedText>
            </Card>
          ) : null}

          <Card title="Started">
            <ThemedText type="small" themeColor="textSecondary">
              {goal.createdAt.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
          </Card>

          <ThemedView style={styles.spacer} />
          {goal.status === 'active' ? (
            <Button label="Archive goal" variant="secondary" onPress={confirmArchive} />
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.archivedNote}>
              This goal is archived.
            </ThemedText>
          )}
        </ThemedView>
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
    gap: Spacing.three,
  },
  kind: {
    letterSpacing: 1,
  },
  spacer: {
    flex: 1,
  },
  archivedNote: {
    textAlign: 'center',
  },
});
