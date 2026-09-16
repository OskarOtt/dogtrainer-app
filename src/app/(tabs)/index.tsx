import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddFriendModal } from '@/components/add-friend-modal';
import { EmptyState } from '@/components/empty-state';
import { PostList } from '@/components/post-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFeed } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function FeedScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [isAddFriendVisible, setIsAddFriendVisible] = useState(false);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFeed();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Feed
          </ThemedText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setIsAddFriendVisible(true)}
              hitSlop={8}
              style={[styles.composeButton, { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }]}>
              <Ionicons name="person-add-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/post/new')}
              hitSlop={8}
              style={[styles.composeButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={26} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        <AddFriendModal visible={isAddFriendVisible} onClose={() => setIsAddFriendVisible(false)} />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load your feed" message={getApiErrorMessage(error)} />
        ) : (
          <PostList
            posts={posts}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            isFetchingNextPage={isFetchingNextPage}
            refreshing={isRefetching}
            onRefresh={refetch}
            emptyTitle="No posts yet"
            emptyMessage="Follow other trainers or share your own training moments."
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: { fontSize: 28 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
