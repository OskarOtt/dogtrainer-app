import { apiClient } from '@/api/client';
import type {
  AddSessionExercisePayload,
  CreateTrainingSessionPayload,
  TrainingSession,
  UpdateSessionExercisePayload,
  UpdateTrainingSessionPayload,
} from '@/types/session';

/**
 * Thin wrapper around the /training-sessions endpoints. UI code and hooks should
 * only ever go through this module, never call apiClient directly.
 */
export const sessionsApi = {
  async listForDog(dogId: string): Promise<TrainingSession[]> {
    const { data } = await apiClient.get<TrainingSession[]>(`/dogs/${dogId}/training-sessions`);
    return data;
  },

  async create(dogId: string, payload: CreateTrainingSessionPayload): Promise<TrainingSession> {
    const { data } = await apiClient.post<TrainingSession>(`/dogs/${dogId}/training-sessions`, payload);
    return data;
  },

  async get(id: string): Promise<TrainingSession> {
    const { data } = await apiClient.get<TrainingSession>(`/training-sessions/${id}`);
    return data;
  },

  async update(id: string, payload: UpdateTrainingSessionPayload): Promise<TrainingSession> {
    const { data } = await apiClient.put<TrainingSession>(`/training-sessions/${id}`, payload);
    return data;
  },

  async complete(id: string): Promise<TrainingSession> {
    const { data } = await apiClient.post<TrainingSession>(`/training-sessions/${id}/complete`);
    return data;
  },

  async cancel(id: string): Promise<TrainingSession> {
    const { data } = await apiClient.post<TrainingSession>(`/training-sessions/${id}/cancel`);
    return data;
  },

  async addExercise(sessionId: string, payload: AddSessionExercisePayload): Promise<TrainingSession> {
    const { data } = await apiClient.post<TrainingSession>(`/training-sessions/${sessionId}/exercises`, payload);
    return data;
  },

  async updateExercise(
    sessionId: string,
    exerciseId: string,
    payload: UpdateSessionExercisePayload
  ): Promise<TrainingSession> {
    const { data } = await apiClient.put<TrainingSession>(
      `/training-sessions/${sessionId}/exercises/${exerciseId}`,
      payload
    );
    return data;
  },

  async removeExercise(sessionId: string, exerciseId: string): Promise<TrainingSession> {
    const { data } = await apiClient.delete<TrainingSession>(`/training-sessions/${sessionId}/exercises/${exerciseId}`);
    return data;
  },
};
