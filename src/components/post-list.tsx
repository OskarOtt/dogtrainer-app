import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, type ListRenderItemInfo } from 'react-native';

import { t } from '@/i18n';
import { EmptyState } from '@/components/empty-state';
import { PostCard } from '@/components/post-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Post } from '@/types/post';

export interface PostListProps {
  posts: Post[];
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
  /** Rendered after the built-in "loading more" spinner, e.g. Profile's Log Out button. */
  ListFooterComponent?: React.ReactElement;
}

/** Paginated, pull-to-refreshable list of posts, shared by the Feed tab, a user's posts, and Profile's "My Posts". */
export function PostList({
  posts,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
  emptyTitle = t('posts.noPosts'),
  emptyMessage,
  ListHeaderComponent,
  ListFooterComponent,
}: PostListProps) {
  const colors = useTheme();

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }: ListRenderItemInfo<Post>) => <PostCard post={item} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title={emptyTitle} message={emptyMessage} />}
      ListFooterComponent={
        <>
          {isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
          {ListFooterComponent}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.four, paddingBottom: Spacing.four + BottomTabInset, gap: Spacing.three, flexGrow: 1 },
  footer: { marginVertical: Spacing.three },
});
