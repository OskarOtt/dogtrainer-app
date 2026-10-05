import { apiClient } from '@/api/client';
import type { DeleteAccountPayload, User } from '@/types/auth';
import type { PublicDogSummary } from '@/types/dog';
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/media';
import type { PublicUser, UserSearchResult } from '@/types/user';

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

  /** Fuzzy name/username search, used by the "find friends" UI. `query` must be >= 2 chars. */
  async search(query: string, limit = 20): Promise<UserSearchResult[]> {
    const { data } = await apiClient.get<UserSearchResult[]>('/users/search', { params: { q: query, limit } });
    return data;
  },

  /** The user's dogs, for display on their public profile. */
  async listDogs(userId: string): Promise<PublicDogSummary[]> {
    const { data } = await apiClient.get<PublicDogSummary[]>(`/users/${userId}/dogs`);
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

  async updateUsername(name: string): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me/username', { name });
    return data;
  },

  async deleteAccount(payload: DeleteAccountPayload): Promise<void> {
    await apiClient.delete('/users/me', { data: payload });
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
