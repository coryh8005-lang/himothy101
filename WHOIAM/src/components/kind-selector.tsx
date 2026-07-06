import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Radii, Spacing } from '@/constants/theme';
import { GOAL_KINDS, type GoalKind } from '@/features/goals';
import { useTheme } from '@/hooks/use-theme';

type KindSelectorProps = {
  value: GoalKind | null;
  onChange: (kind: GoalKind) => void;
};

export function KindSelector({ value, onChange }: KindSelectorProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.row}>
      {GOAL_KINDS.map(({ kind, label, description }) => {
        const selected = value === kind;
        return (
          <Pressable
            key={kind}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(kind)}
            style={styles.pressable}>
            <ThemedView
              type={selected ? 'backgroundSelected' : 'backgroundElement'}
              style={[styles.option, selected && { borderColor: theme.tint }]}>
              <ThemedText type="smallBold" themeColor={selected ? 'tint' : 'text'}>
                {label}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {description}
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
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  pressable: {
    alignSelf: 'stretch',
  },
  option: {
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.half,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
