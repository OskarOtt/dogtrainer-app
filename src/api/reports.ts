import { apiClient } from '@/api/client';
import type { CreateReportPayload } from '@/types/report';

/**
 * Thin wrapper around the /reports endpoint. UI code and hooks should only ever go
 * through this module, never call apiClient directly.
 */
export const reportsApi = {
  async create(payload: CreateReportPayload): Promise<void> {
    await apiClient.post('/reports', payload);
  },
};
