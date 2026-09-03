import { apiClient } from '@/api/client';
import type { TrainingPlan, TrainingPlanPayload } from '@/types/plan';

/**
 * Thin wrapper around the /training-plans endpoints. UI code and hooks should
 * only ever go through this module, never call apiClient directly.
 */
export const plansApi = {
  async listForDog(dogId: string): Promise<TrainingPlan[]> {
    const { data } = await apiClient.get<TrainingPlan[]>(`/dogs/${dogId}/training-plans`);
    return data;
  },

  async listAll(): Promise<TrainingPlan[]> {
    const { data } = await apiClient.get<TrainingPlan[]>('/training-plans');
    return data;
  },

  async create(dogId: string, payload: TrainingPlanPayload): Promise<TrainingPlan> {
    const { data } = await apiClient.post<TrainingPlan>(`/dogs/${dogId}/training-plans`, payload);
    return data;
  },

  async get(id: string): Promise<TrainingPlan> {
    const { data } = await apiClient.get<TrainingPlan>(`/training-plans/${id}`);
    return data;
  },

  async update(id: string, payload: TrainingPlanPayload): Promise<TrainingPlan> {
    const { data } = await apiClient.put<TrainingPlan>(`/training-plans/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/training-plans/${id}`);
  },
};
