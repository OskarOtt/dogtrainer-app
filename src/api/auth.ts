import { apiClient } from '@/api/client';
import type { AuthTokensResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';

/**
 * Thin wrapper around the /auth endpoints. UI code and hooks should only ever
 * go through this module, never call apiClient directly.
 */
export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthTokensResponse> {
    const { data } = await apiClient.post<AuthTokensResponse>('/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokensResponse> {
    const { data } = await apiClient.post<AuthTokensResponse>('/auth/login', payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const { data } = await apiClient.post<AuthTokensResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
