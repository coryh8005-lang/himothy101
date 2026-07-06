import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Choice<T> = { value: T; label: string };

type ChoiceChipsProps<T> = {
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function ChoiceChips<T extends string | number>({
  choices,
  value,
  onChange,
}: ChoiceChipsProps<T>) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.row}>
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <Pressable
            key={String(choice.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(choice.value)}>
            <ThemedView
              type={selected ? 'backgroundSelected' : 'backgroundElement'}
              style={[styles.chip, selected && { borderColor: theme.tint }]}>
              <ThemedText type="small" themeColor={selected ? 'tint' : 'textSecondary'}>
                {choice.label}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  chip: {
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
