import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { usePublicUser } from '@/hooks/use-users';
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

  const isFollowing = useMemo(() => myFollowing?.some((u) => u.id === id) ?? false, [myFollowing, id]);
  const followMutation = isFollowing ? unfollowUser : followUser;

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
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !profile) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this profile" message={getApiErrorMessage(error)}>
          <PrimaryButton title="Exit" variant="secondary" onPress={() => router.replace('/(tabs)')} />
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
          {currentUser?.id !== id ? (
            <PrimaryButton
              title={isFollowing ? 'Unfollow' : 'Follow'}
              variant={isFollowing ? 'secondary' : 'primary'}
              loading={followMutation.isPending}
              onPress={() => followMutation.mutate(id)}
              style={styles.followButton}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.followRow}>
        <Pressable style={styles.followStat} onPress={() => router.push(`/user/${id}/followers`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {followers?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Followers</ThemedText>
        </Pressable>
        <Pressable style={styles.followStat} onPress={() => router.push(`/user/${id}/following`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {following?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Following</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Posts
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
          emptyTitle="No posts yet"
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
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  profileInfo: { flex: 1, gap: Spacing.two },
  name: { fontSize: 22 },
  followButton: { alignSelf: 'flex-start', minWidth: 120 },
  followRow: { flexDirection: 'row', gap: Spacing.four },
  followStat: { alignItems: 'center', flex: 1 },
  followCount: { fontSize: 20 },
  sectionTitle: { fontSize: 18 },
});
