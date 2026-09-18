import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api/users';

export function usePublicUser(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id ?? ''],
    queryFn: () => usersApi.get(id as string),
    enabled: !!id,
  });
}

/** Looks up a user by email address. Rejects with a 404 if none is found. */
export function useFindUserByEmail() {
  return useMutation({
    mutationFn: (email: string) => usersApi.getByEmail(email),
  });
}

const blockedUsersKey = ['users', 'me', 'blocked'] as const;

export function useBlockedUsers() {
  return useQuery({
    queryKey: blockedUsersKey,
    queryFn: () => usersApi.getBlockedUsers(),
  });
}

/**
 * Blocking removes any existing follow relationship both ways server-side, so this also
 * invalidates follow/feed data alongside the blocked list.
 */
export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedUsersKey });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedUsersKey });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
