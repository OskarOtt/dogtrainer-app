import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDeleteAccount } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import type { AuthMethod, SocialAuthPayload, SocialProvider } from '@/types/auth';
import { getApiErrorMessage } from '@/utils/apiError';

export interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
  authMethods: AuthMethod[];
}

export function DeleteAccountModal({ visible, onClose, onDeleted, authMethods }: DeleteAccountModalProps) {
  const colors = useTheme();
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [providerError, setProviderError] = useState<unknown>(null);
  const socialMethods = authMethods.filter((method): method is SocialProvider => method !== 'PASSWORD');
  const hasPassword = authMethods.includes('PASSWORD');

  function handleClose() {
    setPassword('');
    setProviderError(null);
    deleteAccount.reset();
    onClose();
  }

  function handleConfirm() {
    if (!password) {
      return;
    }
    deleteAccount.mutate({ method: 'PASSWORD', password }, { onSuccess: onDeleted });
  }

  async function handleSocialConfirm(credential: SocialAuthPayload) {
    setProviderError(null);
    await deleteAccount.mutateAsync({
      method: credential.provider,
      idToken: credential.idToken,
      authorizationCode: credential.authorizationCode,
    });
    onDeleted();
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

          {hasPassword ? (
            <>
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
              <PrimaryButton
                title="Delete my account"
                variant="danger"
                onPress={handleConfirm}
                loading={deleteAccount.isPending}
                disabled={!password}
              />
            </>
          ) : null}

          {socialMethods.length > 0 ? (
            <>
              <ThemedText style={[styles.reauthenticate, { color: colors.textSecondary }]}>
                Confirm with a linked provider to delete your account.
              </ThemedText>
              <SocialAuthButtons
                providers={socialMethods}
                disabled={deleteAccount.isPending}
                onCredential={handleSocialConfirm}
                onError={setProviderError}
              />
            </>
          ) : null}

          {deleteAccount.isError || providerError ? (
            <ThemedText style={[styles.message, { color: colors.danger }]}>
              {getApiErrorMessage(providerError ?? deleteAccount.error, 'Could not confirm account deletion.')}
            </ThemedText>
          ) : null}
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
  reauthenticate: {
    fontSize: 13,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
});
