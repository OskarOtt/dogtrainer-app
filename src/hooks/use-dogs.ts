import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dogsApi } from '@/api/dogs';
import type { DogPayload } from '@/types/dog';

const dogsKey = ['dogs'] as const;
const dogKey = (id: string) => ['dogs', id] as const;

export function useDogs() {
  return useQuery({
    queryKey: dogsKey,
    queryFn: dogsApi.list,
  });
}

export function useDog(id: string | undefined) {
  return useQuery({
    queryKey: dogKey(id ?? ''),
    queryFn: () => dogsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DogPayload) => dogsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogsKey });
    },
  });
}

export function useUpdateDog(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DogPayload) => dogsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogsKey });
      queryClient.invalidateQueries({ queryKey: dogKey(id) });
    },
  });
}

export function useDeleteDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dogsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogsKey });
    },
  });
}
