import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { PostList } from '@/components/post-list';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '@/hooks/use-follows';
import { useUserPosts } from '@/hooks/use-posts';
import { useBlockedUsers, useBlockUser, usePublicUser, useUnblockUser, useUserDogs } from '@/hooks/use-users';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading, isError, error } = usePublicUser(id);
  const { data: followers } = useFollowers(id);
  const { data: following } = useFollowing(id);
  const { data: myFollowing } = useFollowing(currentUser?.id);
  const followUser = useFollowUser(currentUser?.id);
  const unfollowUser = useUnfollowUser(currentUser?.id);
  const { data: blockedUsers } = useBlockedUsers();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const { data: dogs } = useUserDogs(id);

  const isFollowing = useMemo(() => myFollowing?.some((u) => u.id === id) ?? false, [myFollowing, id]);
  const followMutation = isFollowing ? unfollowUser : followUser;
  const isBlocked = useMemo(() => blockedUsers?.some((u) => u.id === id) ?? false, [blockedUsers, id]);

  function handleToggleBlock() {
    if (isBlocked) {
      unblockUser.mutate(id);
      return;
    }
    Alert.alert(t('social.blockUserTitle', { name: profile?.name ?? t('social.blockUserFallback') }), t('social.blockMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.block'), style: 'destructive', onPress: () => blockUser.mutate(id) },
    ]);
  }

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useUserPosts(id);
  const posts = postsData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !profile) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <EmptyState icon="alert-circle-outline" title={t('social.profileLoadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  const header = (
    <View style={styles.headerContent}>
      <View style={styles.profileRow}>
        <Avatar uri={profile.avatarUrl} size={80} />
        <View style={styles.profileInfo}>
          <ThemedText type="subtitle" style={styles.name}>
            {profile.name}
          </ThemedText>
        </View>
      </View>

      <View style={styles.followRow}>
        <Pressable style={styles.followStat} onPress={() => router.push(`/user/${id}/followers`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {followers?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{t('social.followers')}</ThemedText>
        </Pressable>
        <Pressable style={styles.followStat} onPress={() => router.push(`/user/${id}/following`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {following?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{t('social.following')}</ThemedText>
        </Pressable>
      </View>

      {currentUser?.id !== id || (dogs && dogs.length > 0) ? (
        <View style={styles.dogsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('social.dogs')}
          </ThemedText>

          {dogs && dogs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dogsRow}>
              {dogs.map((dog) => (
                <Pressable key={dog.id} style={styles.dogCard} onPress={() => router.push(`/dog/${dog.id}/public`)}>
                  <Avatar uri={dog.mediaUrl} mediaType={dog.mediaType} size={56} placeholderIcon="paw" />
                  <ThemedText type="small" numberOfLines={1} style={styles.dogName}>
                    {dog.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {currentUser?.id !== id ? (
            <View style={styles.actionRow}>
              <PrimaryButton
                title={isFollowing ? t('social.unfollow') : t('social.follow')}
                variant={isFollowing ? 'secondary' : 'primary'}
                loading={followMutation.isPending}
                disabled={isBlocked}
                onPress={() => followMutation.mutate(id)}
                style={styles.wideButton}
              />
              <PrimaryButton
                title={isBlocked ? t('common.unblock') : t('common.block')}
                variant={isBlocked ? 'secondary' : 'danger'}
                loading={isBlocked ? unblockUser.isPending : blockUser.isPending}
                onPress={handleToggleBlock}
                style={styles.wideButton}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {t('social.posts')}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: profile.name }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <PostList
          posts={posts}
          ListHeaderComponent={header}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          isFetchingNextPage={isFetchingNextPage}
          refreshing={isRefetching}
          onRefresh={refetch}
          emptyTitle={t('posts.noPosts')}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: { flex: 1 },
  headerContent: { padding: Spacing.four, paddingBottom: 0, gap: Spacing.three },
  profileRow: { alignItems: 'center', gap: Spacing.three },
  profileInfo: { alignItems: 'center', gap: Spacing.two },
  name: { fontSize: 22, textAlign: 'center' },
  actionRow: { gap: Spacing.two, marginTop: Spacing.two + 10 },
  wideButton: { width: '100%' },
  followRow: { flexDirection: 'row', gap: Spacing.four },
  followStat: { alignItems: 'center', flex: 1 },
  followCount: { fontSize: 20 },
  sectionTitle: { fontSize: 18 },
  dogsSection: { gap: Spacing.two },
  dogsRow: { gap: Spacing.three, paddingRight: Spacing.two },
  dogCard: { alignItems: 'center', width: 72, gap: Spacing.one },
  dogName: { textAlign: 'center' },
});
