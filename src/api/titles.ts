import { apiClient } from '@/api/client';
import type { DogTitle, DogTitlePayload } from '@/types/title';

/**
 * Thin wrapper around the /titles endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const titlesApi = {
  async listForDog(dogId: string): Promise<DogTitle[]> {
    const { data } = await apiClient.get<DogTitle[]>(`/dogs/${dogId}/titles`);
    return data;
  },

  async create(dogId: string, payload: DogTitlePayload): Promise<DogTitle> {
    const { data } = await apiClient.post<DogTitle>(`/dogs/${dogId}/titles`, payload);
    return data;
  },

  async update(id: string, payload: DogTitlePayload): Promise<DogTitle> {
    const { data } = await apiClient.put<DogTitle>(`/titles/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/titles/${id}`);
  },
};
