/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#12171F',
    background: '#F7F8FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E4EEFF',
    textSecondary: '#5B6472',
    primary: '#2F6FED',
    onPrimary: '#FFFFFF',
    border: '#E3E6EB',
    card: '#FFFFFF',
    success: '#1EA672',
    warning: '#D98A0B',
    danger: '#DB4444',
  },
  dark: {
    text: '#F2F4F7',
    background: '#0E1116',
    backgroundElement: '#171B22',
    backgroundSelected: '#1F3A63',
    textSecondary: '#9AA4B2',
    primary: '#5B93F5',
    onPrimary: '#0E1116',
    border: '#262B33',
    card: '#171B22',
    success: '#34C98C',
    warning: '#E8A93B',
    danger: '#EF6B6B',
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radii = {
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
} as const;

/** Difficulty badge colors — intentionally theme-independent accent colors. */
export const DifficultyColors = {
  BEGINNER: '#1EA672',
  INTERMEDIATE: '#D98A0B',
  ADVANCED: '#DB4444',
} as const;

/** Status badge colors used across sessions/goals/plans. */
export const StatusColors = {
  IN_PROGRESS: '#2F6FED',
  COMPLETED: '#1EA672',
  CANCELLED: '#8A93A2',
  NOT_STARTED: '#8A93A2',
  PAUSED: '#D98A0B',
} as const;
