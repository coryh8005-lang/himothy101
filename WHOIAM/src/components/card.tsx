import { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Radii, Spacing } from '@/constants/theme';

type CardProps = PropsWithChildren<{
  title?: string;
  style?: ViewStyle;
}>;

export function Card({ title, style, children }: CardProps) {
  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]}>
      {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
