import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
