import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import { commentsApi } from '@/api/comments';
import type { CreateCommentPayload } from '@/types/comment';
import type { Post, PostPage } from '@/types/post';

const commentsKey = (postId: string) => ['posts', postId, 'comments'] as const;
const postKey = (id: string) => ['posts', id] as const;

/** True for the feed's `['feed']` key and any user's `['users', userId, 'posts']` key. */
function isPostListQueryKey(queryKey: readonly unknown[]): boolean {
  return queryKey[0] === 'feed' || (queryKey[0] === 'users' && queryKey[2] === 'posts');
}

function adjustCommentCount(postId: string, delta: number) {
  return (post: Post | undefined) => (post && post.id === postId ? { ...post, commentCount: post.commentCount + delta } : post);
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: commentsKey(postId ?? ''),
    queryFn: () => commentsApi.list(postId as string),
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentsApi.create(postId, payload),
    onSuccess: (comment) => {
      queryClient.setQueryData(commentsKey(postId), (comments: Awaited<ReturnType<typeof commentsApi.list>> | undefined) => [
        ...(comments ?? []),
        comment,
      ]);
      bumpCommentCount(queryClient, postId, 1);
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(commentId),
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData(commentsKey(postId), (comments: Awaited<ReturnType<typeof commentsApi.list>> | undefined) =>
        comments?.filter((comment) => comment.id !== commentId)
      );
      bumpCommentCount(queryClient, postId, -1);
    },
  });
}

function bumpCommentCount(queryClient: ReturnType<typeof useQueryClient>, postId: string, delta: number) {
  queryClient.setQueryData<Post>(postKey(postId), adjustCommentCount(postId, delta));
  queryClient.setQueriesData<InfiniteData<PostPage>>(
    { predicate: (query) => isPostListQueryKey(query.queryKey) },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + delta } : post)),
        })),
      }
  );
}
