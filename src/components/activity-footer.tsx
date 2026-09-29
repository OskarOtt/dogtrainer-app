import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ConfirmDialog } from './confirm-dialog';
import { PrimaryButton } from './primary-button';

export interface ActivityFooterProps {
  /** Called after the user confirms the "Discard" action in the cancel dialog. */
  onCancel: () => void;
  /** Called when the pause/resume button is pressed - no confirmation needed. */
  onPauseResume: () => void;
  /** Called after the user confirms the "Finish" action in the finish dialog. */
  onFinish: () => void;
  isPaused: boolean;
  cancelLoading?: boolean;
  pauseResumeLoading?: boolean;
  finishLoading?: boolean;
}

/**
 * Cancel / Pause-or-Resume / Complete footer for an active physical activity, styled to match
 * `SessionFooter`'s pill-shaped bar (deliberately kept as a single cross-platform
 * implementation, unlike `SessionFooter`'s iOS-native variant, to keep this simple for now).
 */
export function ActivityFooter({
  onCancel,
  onPauseResume,
  onFinish,
  isPaused,
  cancelLoading,
  pauseResumeLoading,
  finishLoading,
}: ActivityFooterProps) {
  const colors = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={styles.footer}>
      <View style={[styles.footerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.footerButton}>
          <ConfirmDialog
            title={t('activity.cancel')}
            variant="danger"
            loading={cancelLoading}
            style={styles.footerButtonFill}
            dialogTitle={t('activity.cancelTitle')}
            dialogMessage={t('activity.cancelMessage')}
            confirmLabel={t('common.discard')}
            cancelLabel={t('common.keepTraining')}
            destructive
            onConfirm={onCancel}
          />
        </View>
        <View style={styles.footerButton}>
          <PrimaryButton
            title={isPaused ? t('activity.resume') : t('activity.pause')}
            variant="secondary"
            loading={pauseResumeLoading}
            onPress={onPauseResume}
            style={styles.pauseResumeButton}
          />
        </View>
        <View style={styles.footerButton}>
          <ConfirmDialog
            title={t('activity.finish')}
            variant="success"
            loading={finishLoading}
            style={styles.footerButtonFill}
            dialogTitle={t('activity.finishTitle')}
            dialogMessage={t('activity.finishMessage')}
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
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.one,
    gap: Spacing.one,
    overflow: 'hidden',
  },
  footerButton: { flex: 1 },
  footerButtonFill: { width: '100%' },
  pauseResumeButton: { width: '100%' },
});
