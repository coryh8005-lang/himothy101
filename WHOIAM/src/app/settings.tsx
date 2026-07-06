import Constants from 'expo-constants';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function SettingsScreen() {
  return (
    <Screen title="Settings">
      <Card title="Check-in times">
        <ThemedText type="small" themeColor="textSecondary">
          Choose the three times a day WHOIAM checks in with you. Available in milestone M2.
        </ThemedText>
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
