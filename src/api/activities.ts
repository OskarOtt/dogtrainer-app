import { apiClient } from '@/api/client';
import type {
  CreateManualPhysicalActivityPayload,
  CreatePhysicalActivityPayload,
  PhysicalActivity,
  UpdatePhysicalActivityPayload,
} from '@/types/activity';

/**
 * Thin wrapper around the /physical-activities endpoints. UI code and hooks should
 * only ever go through this module, never call apiClient directly.
 */
export const activitiesApi = {
  async listForDog(dogId: string): Promise<PhysicalActivity[]> {
    const { data } = await apiClient.get<PhysicalActivity[]>(`/dogs/${dogId}/physical-activities`);
    return data;
  },

  async create(dogId: string, payload: CreatePhysicalActivityPayload): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/dogs/${dogId}/physical-activities`, payload);
    return data;
  },

  async createManual(dogId: string, payload: CreateManualPhysicalActivityPayload): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/dogs/${dogId}/physical-activities/manual`, payload);
    return data;
  },

  async get(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.get<PhysicalActivity>(`/physical-activities/${id}`);
    return data;
  },

  async update(id: string, payload: UpdatePhysicalActivityPayload): Promise<PhysicalActivity> {
    const { data } = await apiClient.put<PhysicalActivity>(`/physical-activities/${id}`, payload);
    return data;
  },

  async pause(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/physical-activities/${id}/pause`);
    return data;
  },

  async resume(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/physical-activities/${id}/resume`);
    return data;
  },

  async complete(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/physical-activities/${id}/complete`);
    return data;
  },

  async cancel(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.post<PhysicalActivity>(`/physical-activities/${id}/cancel`);
    return data;
  },
};
