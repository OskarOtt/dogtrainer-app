import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { dogsApi } from '@/api/dogs';
import { goalsApi } from '@/api/goals';
import type { GoalPayload } from '@/types/goal';

const dogGoalsKey = (dogId: string) => ['dogs', dogId, 'goals'] as const;
const goalKey = (id: string) => ['goals', id] as const;

export function useDogGoals(dogId: string | undefined) {
  return useQuery({
    queryKey: dogGoalsKey(dogId ?? ''),
    queryFn: () => goalsApi.listForDog(dogId as string),
    enabled: !!dogId,
  });
}

/**
 * Fetches every dog's goals client-side and flattens them into a single list, each
 * paired with its owning dog. There's no backend endpoint to list goals across all
 * dogs, so this mirrors useAllSessions — fine for the small number of dogs a user
 * typically has. Used by the Calendar tab/day view to show goal target dates.
 */
export function useAllGoals() {
  const { data: dogs, isLoading: isLoadingDogs } = useQuery({
    queryKey: ['dogs'] as const,
    queryFn: dogsApi.list,
  });

  const goalQueries = useQueries({
    queries: (dogs ?? []).map((dog) => ({
      queryKey: dogGoalsKey(dog.id),
      queryFn: () => goalsApi.listForDog(dog.id),
      enabled: !!dogs,
    })),
  });

  const isLoading = isLoadingDogs || goalQueries.some((query) => query.isLoading);
  const isError = goalQueries.some((query) => query.isError);
  const goals = (dogs ?? []).flatMap((dog, index) => {
    const dogGoals = goalQueries[index]?.data ?? [];
    return dogGoals.map((goal) => ({ goal, dog }));
  });

  return { data: goals, isLoading, isError };
}

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: goalKey(id ?? ''),
    queryFn: () => goalsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateGoal(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalPayload) => goalsApi.create(dogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogGoalsKey(dogId) });
    },
  });
}

export function useUpdateGoal(id: string, dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalPayload) => goalsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogGoalsKey(dogId) });
      queryClient.invalidateQueries({ queryKey: goalKey(id) });
    },
  });
}

export function useDeleteGoal(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogGoalsKey(dogId) });
    },
  });
}
