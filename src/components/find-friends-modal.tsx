import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareView } from '@/components/keyboard-aware-layout';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFollowing, useFollowUser, useUnfollowUser } from '@/hooks/use-follows';
import { useSearchUsers } from '@/hooks/use-users';
import { useTheme } from '@/hooks/use-theme';
import type { UserSearchResult } from '@/types/user';

export interface FindFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  /** Opens the legacy email-based add-friend flow instead. */
  onUseEmailFallback: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Modal for finding friends via fuzzy name/username search (backed by the
 * `/users/search` endpoint). Replaces the feed's old direct-to-email flow as
 * the main entry point; `AddFriendModal` remains reachable via a small link
 * here for users who still want to add by exact email.
 */
export function FindFriendsModal({ visible, onClose, onUseEmailFallback }: FindFriendsModalProps) {
  const colors = useTheme();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();
  const { data: results, isLoading, isFetching } = useSearchUsers(trimmedQuery);
  const { data: following } = useFollowing(currentUser?.id);
  const followUser = useFollowUser(currentUser?.id);
  const unfollowUser = useUnfollowUser(currentUser?.id);

  const followingIds = useMemo(() => new Set(following?.map((u) => u.id)), [following]);

  function handleClose() {
    setQuery('');
    setDebouncedQuery('');
    onClose();
  }

  function handleOpenProfile(userId: string) {
    handleClose();
    router.push(`/user/${userId}`);
  }

  function handleToggleFollow(resultUser: UserSearchResult) {
    const mutation = followingIds.has(resultUser.id) ? unfollowUser : followUser;
    mutation.mutate(resultUser.id);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAwareView style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t('social.findFriends')}
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <FormTextInput
            defaultValue={query}
            onChangeText={setQuery}
            placeholder={t('social.searchPlaceholder')}
            autoCapitalize="none"
            autoComplete="off"
          />

          <View style={styles.resultsContainer}>
            {trimmedQuery.length < 2 ? (
              <ThemedText themeColor="textSecondary" style={styles.hint}>
                {t('social.searchHint')}
              </ThemedText>
            ) : isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={results ?? []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isFollowing = followingIds.has(item.id);
                  const isPending =
                    (isFollowing ? unfollowUser.isPending : followUser.isPending) &&
                    (followUser.variables === item.id || unfollowUser.variables === item.id);
                  return (
                    <View style={styles.row}>
                      <Pressable style={styles.rowInfo} onPress={() => handleOpenProfile(item.id)}>
                        <Avatar uri={item.avatarUrl} size={44} />
                        <View style={styles.info}>
                          <ThemedText numberOfLines={1}>{item.name}</ThemedText>
                          <ThemedText themeColor="textSecondary" numberOfLines={1} type="small">
                            @{item.username}
                          </ThemedText>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => handleToggleFollow(item)}
                        disabled={isPending}
                        style={[
                          styles.followButton,
                          {
                            backgroundColor: isFollowing ? colors.backgroundElement : colors.primary,
                            borderColor: colors.border,
                            borderWidth: isFollowing ? StyleSheet.hairlineWidth : 0,
                            opacity: isPending ? 0.5 : 1,
                          },
                        ]}>
                        {isPending ? (
                          <ActivityIndicator size="small" color={isFollowing ? colors.primary : colors.onPrimary} />
                        ) : (
                          <ThemedText
                            type="small"
                            style={{ color: isFollowing ? colors.primary : colors.onPrimary }}>
                            {isFollowing ? t('social.unfollow') : t('social.follow')}
                          </ThemedText>
                        )}
                      </Pressable>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  !isFetching ? <EmptyState icon="search-outline" title={t('social.noSearchResults')} /> : null
                }
              />
            )}
          </View>

          <Pressable onPress={onUseEmailFallback} hitSlop={8} style={styles.emailLink}>
            <ThemedText style={[styles.emailLinkText, { color: colors.primary }]}>
              {t('social.useEmailInstead')}
            </ThemedText>
          </Pressable>
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
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  title: { fontSize: 22 },
  hint: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resultsContainer: { flex: 1 },
  list: { paddingVertical: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  info: { flex: 1 },
  followButton: {
    minWidth: 92,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  emailLink: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  emailLinkText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
