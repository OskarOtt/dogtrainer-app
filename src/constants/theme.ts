/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C2922',
    background: '#F6F8F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E3EEE7',
    textSecondary: '#65736B',
    primary: '#3E8760',
    primaryDark: '#286044',
    primaryLight: '#6EAD8A',
    onPrimary: '#FFFFFF',
    border: '#DCE5DF',
    card: '#FFFFFF',
    accent: '#D99A5B',
    success: '#3E8760',
    warning: '#D99A5B',
    danger: '#C1473C',
  },
  dark: {
    text: '#ECF2EE',
    background: '#111A14',
    backgroundElement: '#1B2620',
    backgroundSelected: '#24392E',
    textSecondary: '#93A39A',
    primary: '#6EAD8A',
    primaryDark: '#286044',
    primaryLight: '#8FC3A5',
    onPrimary: '#0E1612',
    border: '#2A3730',
    card: '#1B2620',
    accent: '#E3AD74',
    success: '#6EAD8A',
    warning: '#E3AD74',
    danger: '#E07A6F',
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
  small: 10,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

/**
 * Shared soft-elevation shadow for cards/surfaces, giving the flat palette a bit of
 * modern depth. Use via spread: `style={[styles.card, CardShadow]}`.
 */
export const CardShadow = {
  shadowColor: '#1C2922',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

/**
 * Brand accents for the (auth) login/register screens — light mode only.
 * Dark mode intentionally keeps the standard `Colors.dark` palette untouched.
 */
export const AuthBrandColors = {
  green: Colors.light.primary,
  lightBlue: Colors.light.backgroundSelected,
} as const;

/** Difficulty badge colors — intentionally theme-independent accent colors. */
export const DifficultyColors = {
  BEGINNER: Colors.light.primary,
  INTERMEDIATE: Colors.light.accent,
  ADVANCED: Colors.light.danger,
} as const;

/** Status badge colors used across sessions/goals/plans. */
export const StatusColors = {
  IN_PROGRESS: Colors.light.primary,
  COMPLETED: Colors.light.primaryDark,
  CANCELLED: '#8A93A2',
  NOT_STARTED: '#8A93A2',
  PAUSED: Colors.light.accent,
} as const;

