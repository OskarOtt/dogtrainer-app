import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';

import { postsApi } from '@/api/posts';
import type { CreatePostFromSessionPayload, CreatePostPayload, Post } from '@/types/post';
import { getAssetFileSize, resolveContentType, uploadAssetToPresignedUrl } from '@/utils/upload';

const feedKey = ['feed'] as const;
const postKey = (id: string) => ['posts', id] as const;
const userPostsKey = (userId: string) => ['users', userId, 'posts'] as const;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn: ({ pageParam }: { pageParam?: string }) => postsApi.getFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: userPostsKey(userId ?? ''),
    queryFn: ({ pageParam }: { pageParam?: string }) => postsApi.listUserPosts(userId as string, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: postKey(id ?? ''),
    queryFn: () => postsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsApi.create(payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: userPostsKey(post.authorId) });
    },
  });
}

export function useCreatePostFromSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostFromSessionPayload) => postsApi.createFromSession(sessionId, payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: userPostsKey(post.authorId) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; authorId: string }) => postsApi.remove(id),
    onSuccess: (_data, { id, authorId }) => {
      queryClient.removeQueries({ queryKey: postKey(id) });
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: userPostsKey(authorId) });
    },
  });
}

/**
 * Full presign → upload → confirm flow for a post's photo. Takes `postId` as a mutate-time
 * variable (not a hook argument) since the compose screen only learns it once the post itself
 * has just been created.
 */
export function useUploadPostMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, asset }: { postId: string; asset: ImagePickerAsset }) => {
      const contentType = resolveContentType(asset);
      const fileSizeBytes = getAssetFileSize(asset);
      const { uploadUrl, objectKey } = await postsApi.getMediaUploadUrl(postId, { contentType, fileSizeBytes });
      await uploadAssetToPresignedUrl(asset, uploadUrl, contentType);
      return postsApi.confirmMedia(postId, objectKey);
    },
    onSuccess: (post: Post) => {
      queryClient.setQueryData(postKey(post.id), post);
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: userPostsKey(post.authorId) });
    },
  });
}

export function useRemovePostMedia(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postsApi.removeMedia(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKey(postId) });
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });
}
