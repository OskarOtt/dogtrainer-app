import { Stack, useLocalSearchParams } from 'expo-router';

import { PostList } from '@/components/post-list';
import { ThemedView } from '@/components/themed-view';
import { useUserPosts } from '@/hooks/use-posts';

export default function UserPostsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useUserPosts(id);
  const posts = postsData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'My Posts' }} />
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
        emptyMessage="Share a training session or a photo of your dog."
      />
    </ThemedView>
  );
}
