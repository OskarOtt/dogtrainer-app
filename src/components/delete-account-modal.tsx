import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDeleteAccount } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called once the account has actually been deleted server-side. */
  onDeleted: () => void;
}

/**
 * Confirms permanent account deletion. Requires the current password (re-entered as a safety
 * check) — the destructive button enables as soon as a password is typed.
 */
export function DeleteAccountModal({ visible, onClose, onDeleted }: DeleteAccountModalProps) {
  const colors = useTheme();
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState('');

  function handleClose() {
    setPassword('');
    deleteAccount.reset();
    onClose();
  }

  function handleConfirm() {
    if (!password) {
      return;
    }
    deleteAccount.mutate(password, { onSuccess: onDeleted });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Delete account
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <ThemedText style={[styles.note, { color: colors.textSecondary }]}>
            This permanently deletes your dogs, goals and training history, and removes you from
            others&apos; followers/following. This can&apos;t be undone.
          </ThemedText>

          <FormTextInput
            defaultValue={password}
            onChangeText={(text) => {
              setPassword(text);
              deleteAccount.reset();
            }}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
          />

          {deleteAccount.isError ? (
            <ThemedText style={[styles.message, { color: colors.danger }]}>
              {getApiErrorMessage(deleteAccount.error, 'Incorrect password.')}
            </ThemedText>
          ) : null}

          <PrimaryButton
            title="Delete my account"
            variant="danger"
            onPress={handleConfirm}
            loading={deleteAccount.isPending}
            disabled={!password}
          />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  title: { fontSize: 22 },
  note: {
    fontSize: 13,
    marginBottom: Spacing.three,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.two,
  },
});
