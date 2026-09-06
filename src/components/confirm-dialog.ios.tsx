import { Button, ConfirmationDialog, Host, Text } from '@expo/ui/swift-ui';
import { buttonStyle, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import type { ConfirmDialogProps } from './confirm-dialog.types';

/**
 * Trigger button that presents a native SwiftUI `confirmationDialog` action
 * sheet before running `onConfirm` — replaces the RN `Alert.alert` pattern
 * with a real native prompt on iOS.
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
  const [isPresented, setIsPresented] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Host style={[styles.host, style]}>
      <ConfirmationDialog
        title={dialogTitle}
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="visible">
        <ConfirmationDialog.Trigger>
          <Button
            label={loading ? '…' : title}
            role={variant === 'danger' ? 'destructive' : 'default'}
            modifiers={[
              buttonStyle(variant === 'secondary' ? 'bordered' : 'borderedProminent'),
              disabledModifier(!!isDisabled),
            ]}
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          <Button
            label={confirmLabel}
            role={destructive ? 'destructive' : 'default'}
            onPress={() => {
              setIsPresented(false);
              onConfirm();
            }}
          />
          <Button label={cancelLabel} role="cancel" onPress={() => setIsPresented(false)} />
        </ConfirmationDialog.Actions>
        {dialogMessage ? (
          <ConfirmationDialog.Message>
            <Text>{dialogMessage}</Text>
          </ConfirmationDialog.Message>
        ) : null}
      </ConfirmationDialog>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 56,
  },
});
