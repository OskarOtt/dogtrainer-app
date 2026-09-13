import { useQuery } from '@tanstack/react-query';

import { usersApi } from '@/api/users';

export function usePublicUser(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id ?? ''],
    queryFn: () => usersApi.get(id as string),
    enabled: !!id,
  });
}
