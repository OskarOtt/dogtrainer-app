import { apiClient } from '@/api/client';
import type { Goal, GoalPayload } from '@/types/goal';

/**
 * Thin wrapper around the /goals endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const goalsApi = {
  async listForDog(dogId: string): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>(`/dogs/${dogId}/goals`);
    return data;
  },

  async create(dogId: string, payload: GoalPayload): Promise<Goal> {
    const { data } = await apiClient.post<Goal>(`/dogs/${dogId}/goals`, payload);
    return data;
  },

  async get(id: string): Promise<Goal> {
    const { data } = await apiClient.get<Goal>(`/goals/${id}`);
    return data;
  },

  async update(id: string, payload: GoalPayload): Promise<Goal> {
    const { data } = await apiClient.put<Goal>(`/goals/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },
};
