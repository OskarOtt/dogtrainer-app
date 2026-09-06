import { AlertDialog, Button, Host, OutlinedButton, Text, TextButton } from '@expo/ui/jetpack-compose';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

import type { ConfirmDialogProps } from './confirm-dialog.types';

/**
 * Trigger button that presents a native Jetpack Compose `AlertDialog` before
 * running `onConfirm` — replaces the RN `Alert.alert` pattern with a real
 * Material 3 prompt on Android.
 */
export function ConfirmDialog({
  title,
  variant = 'primary',
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
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [visible, setVisible] = useState(false);
  const isDisabled = disabled || loading;

  const TriggerButton = variant === 'secondary' ? OutlinedButton : Button;
  const triggerColors =
    variant === 'danger'
      ? { containerColor: colors.danger, contentColor: colors.onPrimary }
      : variant === 'primary'
        ? { containerColor: colors.primary, contentColor: colors.onPrimary }
        : undefined;

  return (
    <Host style={[styles.host, { opacity: isDisabled ? 0.6 : 1 }, style]}>
      <TriggerButton onClick={() => !isDisabled && setVisible(true)} colors={triggerColors}>
        <Text>{loading ? '…' : title}</Text>
      </TriggerButton>
      {visible ? (
        <AlertDialog onDismissRequest={() => setVisible(false)}>
          <AlertDialog.Title>
            <Text>{dialogTitle}</Text>
          </AlertDialog.Title>
          {dialogMessage ? (
            <AlertDialog.Text>
              <Text>{dialogMessage}</Text>
            </AlertDialog.Text>
          ) : null}
          <AlertDialog.ConfirmButton>
            <TextButton
              onClick={() => {
                setVisible(false);
                onConfirm();
              }}
              colors={destructive ? { contentColor: colors.danger } : undefined}>
              <Text>{confirmLabel}</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>
          <AlertDialog.DismissButton>
            <TextButton onClick={() => setVisible(false)}>
              <Text>{cancelLabel}</Text>
            </TextButton>
          </AlertDialog.DismissButton>
        </AlertDialog>
      ) : null}
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 56,
  },
});
