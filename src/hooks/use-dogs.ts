import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';

import { dogsApi } from '@/api/dogs';
import type { Dog, DogPayload } from '@/types/dog';
import { getAssetFileSize, resolveContentType, uploadAssetToPresignedUrl } from '@/utils/upload';

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

/** Full presign → upload → confirm flow for a dog's photo/video. */
export function useUploadDogMedia(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const contentType = resolveContentType(asset);
      const fileSizeBytes = getAssetFileSize(asset);
      const { uploadUrl, objectKey } = await dogsApi.getMediaUploadUrl(dogId, { contentType, fileSizeBytes });
      await uploadAssetToPresignedUrl(asset, uploadUrl, contentType);
      return dogsApi.confirmMedia(dogId, objectKey);
    },
    onSuccess: (dog) => {
      queryClient.setQueryData(dogKey(dogId), dog);
      queryClient.invalidateQueries({ queryKey: dogsKey });
    },
  });
}

export function useRemoveDogMedia(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => dogsApi.removeMedia(dogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogsKey });
      queryClient.invalidateQueries({ queryKey: dogKey(dogId) });
    },
  });
}

/**
 * Reorders dogs (drag-and-drop on the Dogs tab). Optimistically applies the new order to the
 * cache so the list doesn't snap back while the request is in flight, and reconciles with the
 * server's canonical order on success. Every other screen reads dogs from this same cache
 * entry, so the new order takes effect app-wide as soon as this resolves.
 */
export function useReorderDogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dogIds: string[]) => dogsApi.reorder(dogIds),
    onMutate: async (dogIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: dogsKey });
      const previousDogs = queryClient.getQueryData<Dog[]>(dogsKey);
      if (previousDogs) {
        const dogsById = new Map(previousDogs.map((dog) => [dog.id, dog]));
        const reordered = dogIds.map((id) => dogsById.get(id)).filter((dog): dog is Dog => !!dog);
        queryClient.setQueryData<Dog[]>(dogsKey, reordered);
      }
      return { previousDogs };
    },
    onError: (_err, _dogIds, context) => {
      if (context?.previousDogs) {
        queryClient.setQueryData<Dog[]>(dogsKey, context.previousDogs);
      }
    },
    onSuccess: (dogs) => {
      queryClient.setQueryData<Dog[]>(dogsKey, dogs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dogsKey });
    },
  });
}
