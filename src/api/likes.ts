import { apiClient } from '@/api/client';

/**
 * Thin wrapper around the /posts/{id}/like endpoints. UI code and hooks should only ever go
 * through this module, never call apiClient directly.
 */
export const likesApi = {
  async add(postId: string): Promise<void> {
    await apiClient.post(`/posts/${postId}/like`);
  },

  async remove(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}/like`);
  },
};
