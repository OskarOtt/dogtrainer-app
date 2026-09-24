import { Ionicons } from '@expo/vector-icons';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { InputAccessoryView, Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';

export interface KeyboardDismissAccessoryProps {
  nativeID: string;
}

export function KeyboardDismissAccessory({ nativeID }: KeyboardDismissAccessoryProps) {
  const colors = useTheme();
  const buttonContent = (
    <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.buttonContent}>
      <ThemedText type="smallBold" style={{ color: colors.onPrimary }}>
        {t('common.done')}
      </ThemedText>
      <Ionicons name="checkmark" size={18} color={colors.onPrimary} />
    </Pressable>
  );

  return (
    <InputAccessoryView nativeID={nativeID} backgroundColor="transparent">
      <View style={styles.toolbar}>
        {isGlassEffectAPIAvailable() ? (
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            tintColor={colors.primary}
            style={styles.button}
          >
            {buttonContent}
          </GlassView>
        ) : (
          <View style={[styles.button, { backgroundColor: colors.primary }]}>
            {buttonContent}
          </View>
        )}
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    width: '100%',
    height: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  button: {
    width: 112,
    height: 40,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
