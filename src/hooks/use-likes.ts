import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import { likesApi } from '@/api/likes';
import type { Post, PostPage } from '@/types/post';

const postKey = (id: string) => ['posts', id] as const;

/** True for the feed's `['feed']` key and any user's `['users', userId, 'posts']` key. */
function isPostListQueryKey(queryKey: readonly unknown[]): boolean {
  return queryKey[0] === 'feed' || (queryKey[0] === 'users' && queryKey[2] === 'posts');
}

function applyLikeChange(post: Post, likedByMe: boolean): Post {
  if (post.likedByMe === likedByMe) {
    return post;
  }
  return { ...post, likedByMe, likeCount: post.likeCount + (likedByMe ? 1 : -1) };
}

/**
 * Optimistically toggles like state for a single post across the post-detail cache and every
 * feed/user-posts infinite-query page containing it, rolling back on error.
 */
export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likedByMe: boolean) => (likedByMe ? likesApi.add(postId) : likesApi.remove(postId)),
    onMutate: async (likedByMe: boolean) => {
      await queryClient.cancelQueries({ queryKey: postKey(postId) });

      const previousPost = queryClient.getQueryData<Post>(postKey(postId));
      const previousLists = queryClient.getQueriesData<InfiniteData<PostPage>>({ predicate: (query) => isPostListQueryKey(query.queryKey) });

      queryClient.setQueryData<Post>(postKey(postId), (post) => (post ? applyLikeChange(post, likedByMe) : post));
      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { predicate: (query) => isPostListQueryKey(query.queryKey) },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((post) => (post.id === postId ? applyLikeChange(post, likedByMe) : post)),
            })),
          }
      );

      return { previousPost, previousLists };
    },
    onError: (_error, _likedByMe, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKey(postId), context.previousPost);
      }
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
}
