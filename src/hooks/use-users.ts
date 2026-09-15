import { useMutation, useQuery } from '@tanstack/react-query';

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
