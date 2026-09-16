import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { followsApi } from '@/api/follows';

const followersKey = (userId: string) => ['users', userId, 'followers'] as const;
const followingKey = (userId: string) => ['users', userId, 'following'] as const;

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: followersKey(userId ?? ''),
    queryFn: () => followsApi.listFollowers(userId as string),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: followingKey(userId ?? ''),
    queryFn: () => followsApi.listFollowing(userId as string),
    enabled: !!userId,
  });
}

export function useFollowUser(currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => followsApi.follow(userId),
    onSuccess: (_data, userId) => {
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: followingKey(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: followersKey(userId) });
    },
  });
}

export function useUnfollowUser(currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => followsApi.unfollow(userId),
    onSuccess: (_data, userId) => {
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: followingKey(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: followersKey(userId) });
    },
  });
}
