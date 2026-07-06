import { and, eq, gte } from 'drizzle-orm';

import { db } from '@/db/client';
import { checkIns, goals, slipUps, streaks } from '@/db/schema';

/** Local calendar day, stable across timezones for the person holding the phone. */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfLocalDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export const MOOD_LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great'] as const;

export type CheckInInput = {
  mood: number; // 1–5
  urge: number; // 0–10
  hadSlip: boolean;
  note?: string;
  /** When hadSlip: which goal it relates to (optional) and what happened. */
  slipGoalId?: number | null;
  slipWhat?: string;
};

/**
 * Save a check-in, log a slip-up row when reported, and update streaks.
 *
 * Streak rule (v1, honest and simple): the first completed check-in of a
 * local day counts that day for every active goal — unless a slip-up was
 * logged for that goal today, which resets its current streak to 0.
 */
export async function completeCheckIn(input: CheckInInput) {
  const now = new Date();
  const day = localDay(now);

  const [checkIn] = await db
    .insert(checkIns)
    .values({
      scheduledFor: now,
      completedAt: now,
      mood: input.mood,
      urge: input.urge,
      hadSlip: input.hadSlip,
      note: input.note?.trim() || null,
    })
    .returning();

  if (input.hadSlip) {
    await db.insert(slipUps).values({
      goalId: input.slipGoalId ?? null,
      occurredAt: now,
      what: input.slipWhat?.trim() || 'Logged during check-in',
    });
    if (input.slipGoalId) {
      await db
        .update(streaks)
        .set({ current: 0, lastCountedDay: day })
        .where(eq(streaks.goalId, input.slipGoalId));
    }
  }

  await countDayForActiveGoals(day, now);
  return checkIn;
}

async function countDayForActiveGoals(day: string, now: Date) {
  const slipsToday = await db
    .select({ goalId: slipUps.goalId })
    .from(slipUps)
    .where(gte(slipUps.occurredAt, startOfLocalDay(now)));
  const slippedGoalIds = new Set(slipsToday.map((s) => s.goalId).filter((id) => id !== null));

  const rows = await db
    .select({ goalId: goals.id, current: streaks.current, longest: streaks.longest, lastCountedDay: streaks.lastCountedDay })
    .from(goals)
    .innerJoin(streaks, eq(streaks.goalId, goals.id))
    .where(eq(goals.status, 'active'));

  for (const row of rows) {
    if (slippedGoalIds.has(row.goalId)) continue; // reset already applied
    if (row.lastCountedDay === day) continue; // today already counted
    const current = row.current + 1;
    await db
      .update(streaks)
      .set({ current, longest: Math.max(current, row.longest), lastCountedDay: day })
      .where(eq(streaks.goalId, row.goalId));
  }
}

export async function todaysCompletedCheckIns() {
  return db
    .select()
    .from(checkIns)
    .where(and(gte(checkIns.completedAt, startOfLocalDay())));
}
