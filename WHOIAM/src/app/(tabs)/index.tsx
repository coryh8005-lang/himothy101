import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link, Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/db/client';
import { goals, streaks } from '@/db/schema';
import { isFlagSet, ONBOARDING_COMPLETE } from '@/features/flags';
import { GOAL_KINDS, streakLabel } from '@/features/goals';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TodayScreen() {
  const router = useRouter();
  const { data: activeGoals } = useLiveQuery(
    db
      .select()
      .from(goals)
      .leftJoin(streaks, eq(streaks.goalId, goals.id))
      .where(eq(goals.status, 'active')),
  );

  // First launch goes through onboarding (kv flag; synchronous tiny read).
  if (!isFlagSet(ONBOARDING_COMPLETE)) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Screen title={greeting()} subtitle={todayLabel()}>
      <Card>
        <ThemedText themeColor="tint" type="smallBold">
          WHOIAM
        </ThemedText>
        <ThemedText>Every action is a vote for who you're becoming.</ThemedText>
      </Card>

      <ThemedText type="smallBold" style={styles.sectionLabel} themeColor="textSecondary">
        YOUR GOALS
      </ThemedText>
      {activeGoals?.map((row) => {
        const kindMeta = GOAL_KINDS.find((k) => k.kind === row.goals.kind);
        return (
          <Link
            key={row.goals.id}
            href={{ pathname: '/goal/[id]', params: { id: row.goals.id } }}
            asChild>
            <Pressable>
              <Card>
                <ThemedText type="smallBold" themeColor="tint" style={styles.kindTag}>
                  {kindMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText type="default">{row.goals.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {streakLabel(row.streaks?.current)}
                </ThemedText>
              </Card>
            </Pressable>
          </Link>
        );
      })}
      <Button label="+ New goal" variant="secondary" onPress={() => router.push('/goal/new')} />

      <ThemedText type="smallBold" style={styles.sectionLabel} themeColor="textSecondary">
        CHECK-INS
      </ThemedText>
      <Card title="Daily check-ins">
        <ThemedText type="small" themeColor="textSecondary">
          Three gentle check-ins a day — mood, urges, honest wins and slips. Coming in milestone
          M2.
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginTop: 8,
    letterSpacing: 1,
  },
  kindTag: {
    letterSpacing: 1,
    fontSize: 11,
  },
});
