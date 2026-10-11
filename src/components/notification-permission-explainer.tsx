import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';

export interface NotificationPermissionExplainerProps {
  visible: boolean;
  loading?: boolean;
  onEnable: () => void;
  onNotNow: () => void;
}

export function NotificationPermissionExplainer({
  visible,
  loading,
  onEnable,
  onNotNow,
}: NotificationPermissionExplainerProps) {
  const colors = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onNotNow}>
      <View style={styles.backdrop}>
        <SafeAreaView
          accessibilityViewIsModal
          edges={['bottom']}
          style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '1a' }]}>
            <Ionicons name="notifications-outline" size={30} color={colors.primary} />
          </View>

          <ThemedText type="subtitle" style={styles.title}>
            {t('notifications.explainerTitle')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {t('notifications.explainerMessage')}
          </ThemedText>

          <View style={styles.actions}>
            <PrimaryButton
              title={t('notifications.explainerNotNow')}
              variant="secondary"
              onPress={onNotNow}
              style={styles.actionButton}
            />
            <PrimaryButton
              title={t('notifications.explainerEnable')}
              onPress={onEnable}
              loading={loading}
              style={styles.actionButton}
            />
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
    padding: Spacing.four,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    borderRadius: Radii.large,
    padding: Spacing.four,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.three,
    fontSize: 28,
    lineHeight: 34,
  },
  message: {
    marginTop: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  actionButton: {
    flex: 1,
  },
});
