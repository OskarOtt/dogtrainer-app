import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { titlesApi } from '@/api/titles';
import type { DogTitlePayload } from '@/types/title';

const dogTitlesKey = (dogId: string) => ['dogs', dogId, 'titles'] as const;

export function useDogTitles(dogId: string | undefined) {
  return useQuery({
    queryKey: dogTitlesKey(dogId ?? ''),
    queryFn: () => titlesApi.listForDog(dogId as string),
    enabled: !!dogId,
  });
}

export function useCreateTitle(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DogTitlePayload) => titlesApi.create(dogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogTitlesKey(dogId) });
    },
  });
}

export function useUpdateTitle(id: string, dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DogTitlePayload) => titlesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogTitlesKey(dogId) });
    },
  });
}

export function useDeleteTitle(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => titlesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogTitlesKey(dogId) });
    },
  });
}
