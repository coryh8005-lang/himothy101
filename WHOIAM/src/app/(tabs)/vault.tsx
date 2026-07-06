import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/db/client';
import { vaultRules } from '@/db/schema';

export default function VaultScreen() {
  const { data: rules } = useLiveQuery(db.select().from(vaultRules));

  return (
    <Screen
      title="Vault"
      subtitle="Lock distracting apps behind a moment of intention.">
      {rules && rules.length > 0 ? (
        rules.map((rule) => (
          <Card key={rule.id} title={rule.shieldTitle ?? 'Locked apps'}>
            <ThemedText type="small" themeColor="textSecondary">
              Default unlock: {rule.defaultUnlockMinutes} min
            </ThemedText>
          </Card>
        ))
      ) : (
        <Card title="The vault opens in milestone M3">
          <ThemedText type="small" themeColor="textSecondary">
            You’ll pick the apps that pull you off course. Opening one shows your own words back
            to you — and unlocking it takes a stated intention and a time limit. When time’s up,
            it locks again.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Requires a real iPhone and Apple’s Screen Time permissions, so it lands right after
            the Apple Developer enrollment step.
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}
