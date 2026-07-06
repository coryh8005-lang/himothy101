import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/db/client';
import { goals } from '@/db/schema';

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
  const { data: activeGoals } = useLiveQuery(
    db.select().from(goals).where(eq(goals.status, 'active')),
  );

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
      {activeGoals && activeGoals.length > 0 ? (
        activeGoals.map((goal) => (
          <Card key={goal.id} title={goal.title}>
            {goal.motivationText ? (
              <ThemedText type="small" themeColor="textSecondary">
                {goal.motivationText}
              </ThemedText>
            ) : null}
          </Card>
        ))
      ) : (
        <Card title="No goals yet">
          <ThemedText type="small" themeColor="textSecondary">
            Goal setting arrives in the next milestone. This is where the person you're becoming
            takes shape — one goal at a time.
          </ThemedText>
        </Card>
      )}

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
});
