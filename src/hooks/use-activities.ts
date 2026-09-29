import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { activitiesApi } from '@/api/activities';
import { dogsApi } from '@/api/dogs';
import type { CreatePhysicalActivityPayload, UpdatePhysicalActivityPayload } from '@/types/activity';
import { isVisiblePhysicalActivity } from '@/utils/activity';

const dogActivitiesKey = (dogId: string) => ['dogs', dogId, 'physical-activities'] as const;
const activityKey = (id: string) => ['physical-activities', id] as const;

export function useDogActivities(dogId: string | undefined) {
  return useQuery({
    queryKey: dogActivitiesKey(dogId ?? ''),
    queryFn: () => activitiesApi.listForDog(dogId as string),
    enabled: !!dogId,
    select: (activities) => activities.filter(isVisiblePhysicalActivity),
  });
}

/**
 * Finds activities the user may have navigated away from mid-activity (IN_PROGRESS or
 * PAUSED). Mirrors {@code useInProgressSessions} - there's no backend endpoint to list these
 * across all dogs, so this fetches each dog's activity list client-side; fine for the small
 * number of dogs a user typically has. Used by the Train tab to offer a resume shortcut.
 */
export function useInProgressActivities() {
  const { data: dogs, isLoading: isLoadingDogs } = useQuery({
    queryKey: ['dogs'] as const,
    queryFn: dogsApi.list,
  });

  const activityQueries = useQueries({
    queries: (dogs ?? []).map((dog) => ({
      queryKey: dogActivitiesKey(dog.id),
      queryFn: () => activitiesApi.listForDog(dog.id),
      enabled: !!dogs,
    })),
  });

  const isLoading = isLoadingDogs || activityQueries.some((query) => query.isLoading);
  const inProgressActivities = (dogs ?? []).flatMap((dog, index) => {
    const activities = activityQueries[index]?.data ?? [];
    return activities
      .filter((activity) => activity.status === 'IN_PROGRESS' || activity.status === 'PAUSED')
      .map((activity) => ({ activity, dog }));
  });

  return { data: inProgressActivities, isLoading };
}

/**
 * Fetches every dog's activities client-side and flattens them into a single list, each
 * paired with its owning dog. Mirrors {@code useAllSessions}, used by the Calendar tab/day
 * view to aggregate completed physical activities.
 */
export function useAllActivities() {
  const { data: dogs, isLoading: isLoadingDogs } = useQuery({
    queryKey: ['dogs'] as const,
    queryFn: dogsApi.list,
  });

  const activityQueries = useQueries({
    queries: (dogs ?? []).map((dog) => ({
      queryKey: dogActivitiesKey(dog.id),
      queryFn: () => activitiesApi.listForDog(dog.id),
      enabled: !!dogs,
    })),
  });

  const isLoading = isLoadingDogs || activityQueries.some((query) => query.isLoading);
  const isError = activityQueries.some((query) => query.isError);
  const activities = (dogs ?? []).flatMap((dog, index) => {
    const dogActivities = activityQueries[index]?.data ?? [];
    return dogActivities.filter(isVisiblePhysicalActivity).map((activity) => ({ activity, dog }));
  });

  return { data: activities, isLoading, isError };
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: activityKey(id ?? ''),
    queryFn: () => activitiesApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateActivity(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePhysicalActivityPayload) => activitiesApi.create(dogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogActivitiesKey(dogId) });
    },
  });
}

export function useUpdateActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePhysicalActivityPayload) => activitiesApi.update(id, payload),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKey(id), activity);
      queryClient.invalidateQueries({ queryKey: dogActivitiesKey(activity.dogId) });
    },
  });
}

export function usePauseActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activitiesApi.pause(id),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKey(id), activity);
    },
  });
}

export function useResumeActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activitiesApi.resume(id),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKey(id), activity);
    },
  });
}

export function useCompleteActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activitiesApi.complete(id),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKey(id), activity);
      queryClient.invalidateQueries({ queryKey: dogActivitiesKey(activity.dogId) });
    },
  });
}

export function useCancelActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activitiesApi.cancel(id),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKey(id), activity);
      queryClient.invalidateQueries({ queryKey: dogActivitiesKey(activity.dogId) });
    },
  });
}
