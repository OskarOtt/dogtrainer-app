import { apiClient } from '@/api/client';
import type {
  NotificationPage,
  NotificationUnreadCount,
  RegisterDevicePayload,
} from '@/types/notification';

/**
 * Thin wrapper around the /devices and /notifications endpoints. UI code and
 * hooks should only ever go through this module, never call apiClient directly.
 */
export const notificationsApi = {
  async registerDevice(payload: RegisterDevicePayload): Promise<void> {
    await apiClient.put('/devices', payload);
  },

  async unregisterDevice(expoPushToken: string): Promise<void> {
    await apiClient.delete('/devices', { data: { expoPushToken } });
  },

  async list(cursor?: string, limit?: number): Promise<NotificationPage> {
    const { data } = await apiClient.get<NotificationPage>('/notifications', {
      params: { cursor, limit },
    });
    return data;
  },

  async getUnreadCount(): Promise<NotificationUnreadCount> {
    const { data } = await apiClient.get<NotificationUnreadCount>('/notifications/unread-count');
    return data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
