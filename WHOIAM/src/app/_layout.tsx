import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { success, error } = useMigrations(db, migrations);
  const notificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (success || error) {
      SplashScreen.hideAsync();
    }
  }, [success, error]);

  // Tapping a check-in reminder opens the check-in flow.
  useEffect(() => {
    const url = notificationResponse?.notification.request.content.data?.url;
    if (success && typeof url === 'string') {
      router.push(url as '/checkin/new');
    }
  }, [notificationResponse, success, router]);

  if (error) {
    return (
      <ThemedView style={styles.migrationError}>
        <ThemedText type="subtitle">Something went wrong</ThemedText>
        <ThemedText themeColor="textSecondary">
          The local database could not be prepared. Please close and reopen the app.
        </ThemedText>
        <ThemedText type="code" themeColor="danger">
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!success) {
    // Migrations run in milliseconds; the splash screen covers this frame.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="goal/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goal/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin/new" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  migrationError: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
