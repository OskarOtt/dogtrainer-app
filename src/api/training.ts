import { apiClient } from '@/api/client';
import type { Activity, Exercise, TrainingCategory } from '@/types/training';

/**
 * Thin wrapper around the read-only /training catalog endpoints (categories, activities,
 * exercises). UI code and hooks should only ever go through this module.
 */
export const trainingCatalogApi = {
  async listCategories(): Promise<TrainingCategory[]> {
    const { data } = await apiClient.get<TrainingCategory[]>('/training/categories');
    return data;
  },

  async listActivities(categoryId: string): Promise<Activity[]> {
    const { data } = await apiClient.get<Activity[]>(`/training/categories/${categoryId}/activities`);
    return data;
  },

  async listExercises(activityId: string): Promise<Exercise[]> {
    const { data } = await apiClient.get<Exercise[]>(`/training/activities/${activityId}/exercises`);
    return data;
  },

  async getExercise(exerciseId: string): Promise<Exercise> {
    const { data } = await apiClient.get<Exercise>(`/training/exercises/${exerciseId}`);
    return data;
  },
};
