import { apiClient } from '@/api/client';
import type { Dog, DogPayload } from '@/types/dog';

/**
 * Thin wrapper around the /dogs endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const dogsApi = {
  async list(): Promise<Dog[]> {
    const { data } = await apiClient.get<Dog[]>('/dogs');
    return data;
  },

  async get(id: string): Promise<Dog> {
    const { data } = await apiClient.get<Dog>(`/dogs/${id}`);
    return data;
  },

  async create(payload: DogPayload): Promise<Dog> {
    const { data } = await apiClient.post<Dog>('/dogs', payload);
    return data;
  },

  async update(id: string, payload: DogPayload): Promise<Dog> {
    const { data } = await apiClient.put<Dog>(`/dogs/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/dogs/${id}`);
  },
};
