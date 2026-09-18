import { apiClient } from '@/api/client';
import type { User } from '@/types/auth';
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/media';
import type { PublicUser } from '@/types/user';

/**
 * Thin wrapper around the /users endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const usersApi = {
  async get(id: string): Promise<PublicUser> {
    const { data } = await apiClient.get<PublicUser>(`/users/${id}`);
    return data;
  },

  /** 404s (via ResourceNotFoundException) when no user has this email. */
  async getByEmail(email: string): Promise<PublicUser> {
    const { data } = await apiClient.get<PublicUser>('/users', { params: { email } });
    return data;
  },

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

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/users/me', { data: { password } });
  },

  async blockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/block`);
  },

  async unblockUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/block`);
  },

  async getBlockedUsers(): Promise<PublicUser[]> {
    const { data } = await apiClient.get<PublicUser[]>('/users/me/blocked');
    return data;
  },
};
