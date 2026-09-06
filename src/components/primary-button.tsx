import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, type ViewStyle } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

/**
 * Large, high-contrast touch target used for the app's primary actions
 * (Start Training, Save, Finish Session, etc.). Styled to match the iOS
 * system button look (filled/tinted rounded-rect, system font weight, subtle
 * press-state dimming) using plain `Pressable`/`Text` so its appearance is
 * consistent and reliable across iOS, Android and web.
 */
export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDisabled = disabled || loading;

  const isFilled = variant !== 'secondary';
  const backgroundColor =
    variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.backgroundElement : colors.primary;
  const textColor = variant === 'secondary' ? colors.primary : colors.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
        },
        isFilled ? styles.shadow : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
