import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { count } from 'drizzle-orm';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/db/client';
import { checkIns, slipUps, unlockEvents } from '@/db/schema';

export default function ProgressScreen() {
  const { data: checkInCount } = useLiveQuery(db.select({ n: count() }).from(checkIns));
  const { data: slipCount } = useLiveQuery(db.select({ n: count() }).from(slipUps));
  const { data: unlockCount } = useLiveQuery(db.select({ n: count() }).from(unlockEvents));

  const total =
    (checkInCount?.[0]?.n ?? 0) + (slipCount?.[0]?.n ?? 0) + (unlockCount?.[0]?.n ?? 0);

  return (
    <Screen title="Progress" subtitle="The honest record — wins, slips, and everything between.">
      {total === 0 ? (
        <Card title="Nothing logged yet">
          <ThemedText type="small" themeColor="textSecondary">
            Check-ins, slip-ups, and vault unlocks will all show up here as one activity log.
            Slips get logged too — this is a record you can trust, not a highlight reel.
          </ThemedText>
        </Card>
      ) : (
        <Card title="Activity">
          <ThemedText type="small" themeColor="textSecondary">
            {checkInCount?.[0]?.n ?? 0} check-ins · {slipCount?.[0]?.n ?? 0} slip-ups ·{' '}
            {unlockCount?.[0]?.n ?? 0} unlocks
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}
