import { useQuery } from '@tanstack/react-query';

import { trainingCatalogApi } from '@/api/training';
import type { CatalogExercise } from '@/types/training';

/**
 * Fetches the entire training catalog (categories → activities → exercises)
 * and flattens it into a single list of exercises tagged with their parent
 * activity/category names, so the UI can offer one searchable/filterable
 * exercise list instead of a category → activity drill-down.
 */
export function useTrainingCatalogFlat() {
  return useQuery({
    queryKey: ['training', 'catalog', 'flat'],
    queryFn: async (): Promise<CatalogExercise[]> => {
      const categories = await trainingCatalogApi.listCategories();

      const perCategory = await Promise.all(
        categories.map(async (category) => {
          const activities = await trainingCatalogApi.listActivities(category.id);

          const perActivity = await Promise.all(
            activities.map(async (activity) => {
              const exercises = await trainingCatalogApi.listExercises(activity.id);
              return exercises.map(
                (exercise): CatalogExercise => ({
                  ...exercise,
                  activityName: activity.name,
                  categoryId: category.id,
                  categoryName: category.name,
                }),
              );
            }),
          );

          return perActivity.flat();
        }),
      );

      return perCategory.flat();
    },
    staleTime: 60 * 60 * 1000, // catalog data rarely changes
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
