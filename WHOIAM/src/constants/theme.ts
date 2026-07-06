/**
 * WHOIAM design tokens.
 *
 * The aesthetic is calm, supportive, and identity-focused — "every action is
 * a vote for who you're becoming". Warm neutrals, a deep sage-teal primary,
 * and soft contrast in both light and dark mode (dark mode is first-class).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1B1A',
    textSecondary: '#6B6862',
    background: '#F7F6F3',
    backgroundElement: '#EDEBE6',
    backgroundSelected: '#E2DFD8',
    tint: '#2F6E62',
    onTint: '#F7F6F3',
    success: '#3D7A46',
    warning: '#9A6B2F',
    danger: '#A34432',
  },
  dark: {
    text: '#ECEAE6',
    textSecondary: '#A7A49D',
    background: '#111413',
    backgroundElement: '#1B201E',
    backgroundSelected: '#262C2A',
    tint: '#7FBFAF',
    onTint: '#111413',
    success: '#7FB98A',
    warning: '#CBA46A',
    danger: '#CC7A66',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
