import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { KindSelector } from '@/components/kind-selector';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { createGoal, type GoalKind } from '@/features/goals';

export default function NewGoalScreen() {
  const router = useRouter();
  const [kind, setKind] = useState<GoalKind | null>(null);
  const [title, setTitle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!kind || title.trim().length === 0 || saving) return;
    setSaving(true);
    try {
      await createGoal({ kind, title, motivationText: motivation });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle" style={styles.heading}>
              New goal
            </ThemedText>
            <KindSelector value={kind} onChange={setKind} />
            <TextField
              label="Name it"
              placeholder="e.g. Less doomscrolling at night"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
            <TextField
              label="Why it matters (optional)"
              placeholder="Your own words, for the hard moments"
              value={motivation}
              onChangeText={setMotivation}
              multiline
              style={styles.motivationInput}
              maxLength={280}
            />
          </ScrollView>
          <ThemedView style={styles.actions}>
            <Button
              label="Create goal"
              disabled={!kind || title.trim().length === 0 || saving}
              onPress={save}
            />
            <Button label="Cancel" variant="ghost" disabled={saving} onPress={() => router.back()} />
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
    gap: Spacing.three,
  },
  heading: {
    marginBottom: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  motivationInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
