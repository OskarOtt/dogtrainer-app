import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
            title="Cancel"
            variant="danger"
            loading={cancelLoading}
            style={styles.footerButtonFill}
            dialogTitle="Cancel session"
            dialogMessage="Discard this training session? This cannot be undone."
            confirmLabel="Discard"
            cancelLabel="Keep Training"
            destructive
            onConfirm={onCancel}
          />
        </View>
        <View style={styles.footerButtonFinish}>
          <ConfirmDialog
            title="Finish"
            variant="success"
            loading={finishLoading}
            style={styles.footerButtonFill}
            dialogTitle="Finish session"
            dialogMessage="Mark this training session as complete?"
            confirmLabel="Finish"
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
