import { apiClient } from '@/api/client';
import type { User } from '@/types/auth';
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/media';

/**
 * Thin wrapper around the /users/me endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const usersApi = {
  async getAvatarUploadUrl(payload: UploadUrlRequest): Promise<UploadUrlResponse> {
    const { data } = await apiClient.post<UploadUrlResponse>('/users/me/avatar/upload-url', payload);
    return data;
  },

  async confirmAvatar(objectKey: string): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me/avatar', { objectKey });
    return data;
  },

  async removeAvatar(): Promise<void> {
    await apiClient.delete('/users/me/avatar');
  },
};
