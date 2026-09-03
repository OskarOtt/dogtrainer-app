import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { plansApi } from '@/api/plans';
import type { TrainingPlanPayload } from '@/types/plan';

const dogPlansKey = (dogId: string) => ['dogs', dogId, 'training-plans'] as const;
const planKey = (id: string) => ['training-plans', id] as const;
const allPlansKey = ['training-plans'] as const;

export function useDogPlans(dogId: string | undefined) {
  return useQuery({
    queryKey: dogPlansKey(dogId ?? ''),
    queryFn: () => plansApi.listForDog(dogId as string),
    enabled: !!dogId,
  });
}

export function useAllPlans() {
  return useQuery({
    queryKey: allPlansKey,
    queryFn: plansApi.listAll,
  });
}

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: planKey(id ?? ''),
    queryFn: () => plansApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreatePlan(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TrainingPlanPayload) => plansApi.create(dogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogPlansKey(dogId) });
      queryClient.invalidateQueries({ queryKey: allPlansKey });
    },
  });
}

export function useUpdatePlan(id: string, dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TrainingPlanPayload) => plansApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogPlansKey(dogId) });
      queryClient.invalidateQueries({ queryKey: planKey(id) });
      queryClient.invalidateQueries({ queryKey: allPlansKey });
    },
  });
}

export function useDeletePlan(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogPlansKey(dogId) });
      queryClient.invalidateQueries({ queryKey: allPlansKey });
    },
  });
}
