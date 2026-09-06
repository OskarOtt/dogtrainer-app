import { Alert } from 'react-native';

import { PrimaryButton } from './primary-button';
import type { ConfirmDialogProps } from './confirm-dialog.types';

/**
 * Web fallback for {@link ConfirmDialog}: `@expo/ui`'s native confirmation
 * prompts (SwiftUI `ConfirmationDialog` / Jetpack Compose `AlertDialog`) are
 * mobile-only, so web keeps the existing `PrimaryButton` + `Alert.alert` flow.
 */
export function ConfirmDialog({
  title,
  variant,
  loading,
  disabled,
  style,
  dialogTitle,
  dialogMessage,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  function handlePress() {
    Alert.alert(dialogTitle, dialogMessage, [
      { text: cancelLabel, style: 'cancel' },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
  }

  return (
    <PrimaryButton title={title} variant={variant} loading={loading} disabled={disabled} style={style} onPress={handlePress} />
  );
}
