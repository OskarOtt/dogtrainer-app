import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ConfirmDialog } from './confirm-dialog';
import type { SessionFooterProps } from './session-footer.types';

/**
 * Pill-shaped footer bar with Cancel/Finish confirm-dialog triggers, used on
 * Android and web where the native SwiftUI `ControlGroup` (iOS-only) isn't
 * available — see `session-footer.ios.tsx` for the iOS variant.
 */
export function SessionFooter({ onCancel, onFinish, cancelLoading, finishLoading }: SessionFooterProps) {
  const colors = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={styles.footer}>
      <View style={[styles.footerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.footerButtonCancel}>
          <ConfirmDialog
            title={t('training.cancel')}
            variant="danger"
            loading={cancelLoading}
            style={styles.footerButtonFill}
            dialogTitle={t('training.cancelTitle')}
            dialogMessage={t('training.cancelMessage')}
            confirmLabel={t('common.discard')}
            cancelLabel={t('common.keepTraining')}
            destructive
            onConfirm={onCancel}
          />
        </View>
        <View style={styles.footerButtonFinish}>
          <ConfirmDialog
            title={t('training.finish')}
            variant="success"
            loading={finishLoading}
            style={styles.footerButtonFill}
            dialogTitle={t('training.finishTitle')}
            dialogMessage={t('training.finishMessage')}
            confirmLabel={t('common.finish')}
            onConfirm={onFinish}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.one,
  },
  footerBox: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 50,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.one,
    gap: Spacing.one,
    overflow: 'hidden',
  },
  footerButtonCancel: { flex: 1 },
  footerButtonFinish: { flex: 1 },
  footerButtonFill: { width: '100%' },
});
