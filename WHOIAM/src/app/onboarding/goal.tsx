import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { KindSelector } from '@/components/kind-selector';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { GoalKind } from '@/features/goals';

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const [kind, setKind] = useState<GoalKind | null>(null);
  const [title, setTitle] = useState('');

  const placeholder =
    kind === 'build'
      ? 'e.g. Run three mornings a week'
      : kind === 'quit'
        ? 'e.g. Quit vaping'
        : 'e.g. Less doomscrolling at night';

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.form}>
            <ThemedText type="subtitle">What are you here to change?</ThemedText>
            <ThemedText themeColor="textSecondary">
              Start with one thing. You can add more later.
            </ThemedText>
            <KindSelector value={kind} onChange={setKind} />
            <TextField
              label="Name it"
              placeholder={placeholder}
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
              maxLength={80}
            />
          </ThemedView>
          <Button
            label="Continue"
            disabled={!kind || title.trim().length === 0}
            onPress={() => {
              if (!kind) return;
              router.push({
                pathname: '/onboarding/motivation',
                params: { kind, title: title.trim() },
              });
            }}
          />
        </KeyboardAvoidingView>
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
  },
  content: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
    justifyContent: 'space-between',
  },
  form: {
    gap: Spacing.three,
  },
});
