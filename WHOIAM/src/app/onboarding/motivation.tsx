import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { createGoal, type GoalKind } from '@/features/goals';
import { ONBOARDING_COMPLETE, setFlag } from '@/features/flags';

export default function OnboardingMotivationScreen() {
  const router = useRouter();
  const { kind, title } = useLocalSearchParams<{ kind: GoalKind; title: string }>();
  const [motivation, setMotivation] = useState('');
  const [saving, setSaving] = useState(false);

  const finish = async (motivationText: string) => {
    if (!kind || !title || saving) return;
    setSaving(true);
    try {
      await createGoal({ kind, title, motivationText });
      await setFlag(ONBOARDING_COMPLETE, true);
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.form}>
            <ThemedText type="subtitle">Why does this matter?</ThemedText>
            <ThemedText themeColor="textSecondary">
              Your own words, for the moments that get hard. They'll show up when you need them —
              including on the lock screen of the apps you vault later.
            </ThemedText>
            <TextField
              placeholder="I want my evenings back. I want to be someone who…"
              value={motivation}
              onChangeText={setMotivation}
              multiline
              numberOfLines={4}
              style={styles.motivationInput}
              maxLength={280}
            />
          </ThemedView>
          <ThemedView style={styles.actions}>
            <Button label="Start becoming" disabled={saving} onPress={() => finish(motivation)} />
            <Button
              label="Skip for now"
              variant="ghost"
              disabled={saving}
              onPress={() => finish('')}
            />
          </ThemedView>
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
  actions: {
    gap: Spacing.two,
  },
  motivationInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
