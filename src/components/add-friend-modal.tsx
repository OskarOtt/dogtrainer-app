import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFollowUser } from '@/hooks/use-follows';
import { useFindUserByEmail } from '@/hooks/use-users';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal for adding a friend by looking up their account via email and following
 * them. Email-based lookup only for now — work in progress.
 */
export function AddFriendModal({ visible, onClose }: AddFriendModalProps) {
  const colors = useTheme();
  const { user } = useAuth();
  const findUserByEmail = useFindUserByEmail();
  const followUser = useFollowUser(user?.id);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);

  const isBusy = findUserByEmail.isPending || followUser.isPending;

  function handleClose() {
    setEmail('');
    setError(null);
    setSuccessName(null);
    onClose();
  }

  function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }
    setError(null);
    setSuccessName(null);

    findUserByEmail.mutate(trimmedEmail, {
      onSuccess: (foundUser) => {
        followUser.mutate(foundUser.id, {
          onSuccess: () => setSuccessName(foundUser.name),
          onError: (followError) => setError(getApiErrorMessage(followError, t('social.followError'))),
        });
      },
      onError: (lookupError) => {
        setError(getApiErrorMessage(lookupError, t('social.noUser')));
      },
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t('social.addFriend')}
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <ThemedText style={[styles.wipNote, { color: colors.textSecondary }]}>
            {t('social.addFriendDescription')}
          </ThemedText>
          <ThemedText style={[styles.wipNote, { color: colors.textSecondary }]}>
            {t('social.feedDescription')}
          </ThemedText>

          <FormTextInput
            defaultValue={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
              setSuccessName(null);
            }}
            placeholder={t('social.friendEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {error ? <ThemedText style={[styles.message, { color: colors.danger }]}>{error}</ThemedText> : null}
          {successName ? (
            <ThemedText style={[styles.message, { color: colors.success }]}>
              {t('social.nowFollowing', { name: successName })}
            </ThemedText>
          ) : null}

          <PrimaryButton title={t('social.addFriend')} onPress={handleSubmit} loading={isBusy} disabled={!email.trim()} />
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
  wipNote: {
    fontSize: 13,
    marginBottom: Spacing.three,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.two,
  },
});
