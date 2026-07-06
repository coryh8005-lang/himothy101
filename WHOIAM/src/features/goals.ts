import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { goals, streaks } from '@/db/schema';

export type GoalKind = 'build' | 'break' | 'quit';

export const GOAL_KINDS: { kind: GoalKind; label: string; description: string }[] = [
  { kind: 'build', label: 'Build', description: 'Start something good — exercise, reading, sleep.' },
  { kind: 'break', label: 'Break', description: 'Cut back on something that pulls you off course.' },
  { kind: 'quit', label: 'Quit', description: 'Leave something behind for good.' },
];

export async function createGoal(input: {
  kind: GoalKind;
  title: string;
  motivationText?: string;
}) {
  const [goal] = await db
    .insert(goals)
    .values({
      kind: input.kind,
      title: input.title.trim(),
      motivationText: input.motivationText?.trim() || null,
      createdAt: new Date(),
    })
    .returning();
  // Every goal gets a streak row; counting starts with check-ins (M2).
  await db.insert(streaks).values({ goalId: goal.id });
  return goal;
}

export async function archiveGoal(goalId: number) {
  await db
    .update(goals)
    .set({ status: 'archived', archivedAt: new Date() })
    .where(eq(goals.id, goalId));
}

/** How a streak reads on the dashboard before/after counting begins. */
export function streakLabel(current: number | undefined) {
  if (!current || current <= 0) return 'Day 1 starts today';
  return current === 1 ? '1 day strong' : `${current} days strong`;
}
