import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import type { LanguagePreference } from '@/i18n/language-preference';

interface LanguageSelectorModalProps {
  visible: boolean;
  preference: LanguagePreference;
  onSelect: (preference: LanguagePreference) => void;
  onClose: () => void;
}

const languageOptions: { value: LanguagePreference; label: Parameters<typeof t>[0] }[] = [
  { value: 'system', label: 'language.followSystem' },
  { value: 'en', label: 'language.english' },
  { value: 'nb', label: 'language.norwegianBokmal' },
];

export function LanguageSelectorModal({
  visible,
  preference,
  onSelect,
  onClose,
}: LanguageSelectorModalProps) {
  const colors = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView
          accessibilityViewIsModal
          edges={['bottom']}
          style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t('language.choose')}
            </ThemedText>
            <Pressable accessibilityLabel={t('common.close')} accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <ThemedText themeColor="textSecondary" style={styles.description}>
            {t('language.description')}
          </ThemedText>

          <View accessibilityRole="radiogroup" style={styles.options}>
            {languageOptions.map((option) => {
              const selected = option.value === preference;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => onSelect(option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? colors.backgroundSelected : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}>
                  <View style={styles.optionText}>
                    <ThemedText style={styles.optionLabel}>{t(option.label)}</ThemedText>
                    {option.value === 'system' ? (
                      <ThemedText themeColor="textSecondary" style={styles.optionDescription}>
                        {t('language.followSystemDescription')}
                      </ThemedText>
                    ) : null}
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderTopLeftRadius: Radii.large,
    borderTopRightRadius: Radii.large,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: { flex: 1, fontSize: 22 },
  description: { marginTop: Spacing.one },
  options: { gap: Spacing.two, marginTop: Spacing.three },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  optionText: { flex: 1 },
  optionLabel: { fontWeight: 700 },
  optionDescription: { fontSize: 13, marginTop: Spacing.half },
});
