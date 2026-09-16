import { apiClient } from '@/api/client';
import type { User } from '@/types/auth';

/**
 * Thin wrapper around the /users/{userId}/follow(ers|ing) endpoints. UI code and hooks
 * should only ever go through this module, never call apiClient directly.
 */
export const followsApi = {
  async follow(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/follow`);
  },

  async unfollow(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/follow`);
  },

  async listFollowers(userId: string): Promise<User[]> {
    const { data } = await apiClient.get<User[]>(`/users/${userId}/followers`);
    return data;
  },

  async listFollowing(userId: string): Promise<User[]> {
    const { data } = await apiClient.get<User[]>(`/users/${userId}/following`);
    return data;
  },
};
