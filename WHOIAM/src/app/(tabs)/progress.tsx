import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/db/client';
import { checkIns, goals, slipUps } from '@/db/schema';
import { MOOD_LABELS } from '@/features/checkins';

type ActivityEvent =
  | {
      type: 'checkin';
      at: Date;
      mood: number | null;
      urge: number | null;
      hadSlip: boolean | null;
      note: string | null;
    }
  | { type: 'slip'; at: Date; what: string; goalTitle: string | null };

function formatWhen(at: Date) {
  return at.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ProgressScreen() {
  const { data: recentCheckIns } = useLiveQuery(
    db.select().from(checkIns).orderBy(desc(checkIns.scheduledFor)).limit(50),
  );
  const { data: recentSlips } = useLiveQuery(
    db
      .select({ slip: slipUps, goalTitle: goals.title })
      .from(slipUps)
      .leftJoin(goals, eq(goals.id, slipUps.goalId))
      .orderBy(desc(slipUps.occurredAt))
      .limit(50),
  );

  const events: ActivityEvent[] = [
    ...(recentCheckIns ?? []).map(
      (c): ActivityEvent => ({
        type: 'checkin',
        at: c.completedAt ?? c.scheduledFor,
        mood: c.mood,
        urge: c.urge,
        hadSlip: c.hadSlip,
        note: c.note,
      }),
    ),
    ...(recentSlips ?? []).map(
      (row): ActivityEvent => ({
        type: 'slip',
        at: row.slip.occurredAt,
        what: row.slip.what,
        goalTitle: row.goalTitle,
      }),
    ),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <Screen title="Progress" subtitle="The honest record — wins, slips, and everything between.">
      {events.length === 0 ? (
        <Card title="Nothing logged yet">
          <ThemedText type="small" themeColor="textSecondary">
            Check-ins, slip-ups, and vault unlocks will all show up here as one activity log.
            Slips get logged too — this is a record you can trust, not a highlight reel.
          </ThemedText>
        </Card>
      ) : (
        events.map((event, i) =>
          event.type === 'checkin' ? (
            <Card key={`c-${i}`} title={`Check-in · ${formatWhen(event.at)}`}>
              <ThemedText type="small">
                Mood: {event.mood ? MOOD_LABELS[event.mood - 1] : '—'} · Urge: {event.urge ?? '—'}
                /10{event.hadSlip ? ' · slip reported' : ''}
              </ThemedText>
              {event.note ? (
                <ThemedText type="small" themeColor="textSecondary">
                  “{event.note}”
                </ThemedText>
              ) : null}
            </Card>
          ) : (
            <Card key={`s-${i}`} title={`Slip-up · ${formatWhen(event.at)}`}>
              <ThemedText type="small" themeColor="danger">
                {event.goalTitle ?? 'General'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {event.what}
              </ThemedText>
            </Card>
          ),
        )
      )}
    </Screen>
  );
}
