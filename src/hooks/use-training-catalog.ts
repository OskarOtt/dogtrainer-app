import { useQuery } from '@tanstack/react-query';

import { trainingCatalogApi } from '@/api/training';

export function useTrainingCategories() {
  return useQuery({
    queryKey: ['training', 'categories'],
    queryFn: trainingCatalogApi.listCategories,
    staleTime: 60 * 60 * 1000, // catalog data rarely changes
  });
}

export function useActivities(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['training', 'categories', categoryId, 'activities'],
    queryFn: () => trainingCatalogApi.listActivities(categoryId as string),
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useExercises(activityId: string | undefined) {
  return useQuery({
    queryKey: ['training', 'activities', activityId, 'exercises'],
    queryFn: () => trainingCatalogApi.listExercises(activityId as string),
    enabled: !!activityId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useExercise(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ['training', 'exercises', exerciseId],
    queryFn: () => trainingCatalogApi.getExercise(exerciseId as string),
    enabled: !!exerciseId,
    staleTime: 60 * 60 * 1000,
  });
}
