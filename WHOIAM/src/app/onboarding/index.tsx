import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedText type="smallBold" themeColor="tint" style={styles.brand}>
            WHOIAM
          </ThemedText>
          <ThemedText type="title" style={styles.headline}>
            Every action is a vote for who you're becoming.
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            WHOIAM helps you break what's breaking you and build what builds you — one goal, one
            check-in, one unlocked moment of intention at a time.
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            Everything stays on your phone. No account, no feed, no judgment.
          </ThemedText>
        </ThemedView>
        <Button label="Get started" onPress={() => router.push('/onboarding/goal')} />
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
    padding: Spacing.four,
    gap: Spacing.four,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  brand: {
    letterSpacing: 2,
  },
  headline: {
    fontSize: 36,
    lineHeight: 42,
  },
  body: {
    maxWidth: 480,
  },
});
