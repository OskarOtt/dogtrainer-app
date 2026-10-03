import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useUpdateUsername } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { USERNAME_MAX_LENGTH, validateUsername } from '@/utils/username';

export interface EditUsernameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
}

const VALIDATION_MESSAGE_KEY = {
  required: 'profile.usernameRequired',
  tooLong: 'profile.usernameTooLong',
  invalidChars: 'profile.usernameInvalidChars',
} as const;

/** Modal for editing the current user's display name, with inline client-side validation. */
export function EditUsernameModal({ visible, currentName, onClose }: EditUsernameModalProps) {
  const colors = useTheme();
  const updateUsername = useUpdateUsername();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setName(currentName);
    setError(null);
    updateUsername.reset();
    onClose();
  }

  function handleSubmit() {
    const validationError = validateUsername(name);
    if (validationError) {
      setError(t(VALIDATION_MESSAGE_KEY[validationError]));
      return;
    }
    setError(null);

    updateUsername.mutate(name.trim(), {
      onSuccess: handleClose,
      onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAwareView style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t('profile.editUsername')}
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <FormTextInput
            defaultValue={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder={t('profile.usernamePlaceholder')}
            autoCapitalize="words"
            maxLength={USERNAME_MAX_LENGTH}
          />

          {error ? <ThemedText style={[styles.message, { color: colors.danger }]}>{error}</ThemedText> : null}

          <PrimaryButton
            title={t('common.saveChanges')}
            onPress={handleSubmit}
            loading={updateUsername.isPending}
            disabled={!name.trim()}
          />
        </SafeAreaView>
      </KeyboardAwareView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  title: { fontSize: 22 },
  message: {
    fontSize: 14,
    marginBottom: Spacing.two,
  },
});
