import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { RichTextToolbarProps } from '@/components/rich-text/rich-text-toolbar.types';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 20;

/**
 * Default (Android/web) formatting toolbar: a plain row of themed icon buttons.
 * See `rich-text-toolbar.ios.tsx` for the native `ControlGroup` variant.
 */
export function RichTextToolbar({ onInsertInline, onToggleLinePrefix, disabled }: RichTextToolbarProps) {
  const colors = useTheme();

  const buttons: { icon: keyof typeof MaterialCommunityIcons.glyphMap; onPress: () => void; label: string }[] = [
    { icon: 'format-header-1', onPress: () => onToggleLinePrefix('heading1'), label: 'Title' },
    { icon: 'format-header-2', onPress: () => onToggleLinePrefix('heading2'), label: 'Subtitle' },
    { icon: 'format-bold', onPress: () => onInsertInline('**bold**'), label: 'Bold' },
    { icon: 'format-italic', onPress: () => onInsertInline('*italic*'), label: 'Italic' },
    { icon: 'format-list-bulleted', onPress: () => onToggleLinePrefix('bullet'), label: 'Bullet list' },
    { icon: 'format-list-checks', onPress: () => onToggleLinePrefix('checklist'), label: 'Checklist' },
  ];

  return (
    <View style={[styles.bar, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
      {buttons.map((button) => (
        <Pressable
          key={button.label}
          onPress={button.onPress}
          disabled={disabled}
          accessibilityLabel={button.label}
          hitSlop={6}
          style={({ pressed }) => [styles.button, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }]}>
          <MaterialCommunityIcons name={button.icon} size={ICON_SIZE} color={colors.text} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.one,
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radii.small,
  },
});
