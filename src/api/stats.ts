import { apiClient } from '@/api/client';
import type { DogProgress, DogStatistics } from '@/types/stats';

/**
 * Thin wrapper around the /dogs/{dogId}/statistics and /progress endpoints.
 * UI code and hooks should only ever go through this module.
 */
export const statsApi = {
  async getStatistics(dogId: string): Promise<DogStatistics> {
    const { data } = await apiClient.get<DogStatistics>(`/dogs/${dogId}/statistics`);
    return data;
  },

  async getProgress(dogId: string): Promise<DogProgress> {
    const { data } = await apiClient.get<DogProgress>(`/dogs/${dogId}/progress`);
    return data;
  },
};
