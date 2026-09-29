import { apiClient } from '@/api/client';
import type { CreatePostFromActivityPayload, CreatePostFromSessionPayload, CreatePostPayload, Post, PostPage } from '@/types/post';
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/media';
import type { PhysicalActivity } from '@/types/activity';
import type { TrainingSession } from '@/types/session';

/**
 * Thin wrapper around the /posts, /users/{userId}/posts and /feed endpoints. UI code and
 * hooks should only ever go through this module, never call apiClient directly.
 */
export const postsApi = {
  async create(payload: CreatePostPayload): Promise<Post> {
    const { data } = await apiClient.post<Post>('/posts', payload);
    return data;
  },

  async createFromSession(sessionId: string, payload: CreatePostFromSessionPayload): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/posts/from-session/${sessionId}`, payload);
    return data;
  },

  async createFromActivity(activityId: string, payload: CreatePostFromActivityPayload): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/posts/from-activity/${activityId}`, payload);
    return data;
  },

  async get(id: string): Promise<Post> {
    const { data } = await apiClient.get<Post>(`/posts/${id}`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  /** Preview of the training session shared through this post - readable by anyone who can see the post. */
  async getTrainingSession(id: string): Promise<TrainingSession> {
    const { data } = await apiClient.get<TrainingSession>(`/posts/${id}/training-session`);
    return data;
  },

  /** Preview of the physical activity shared through this post - readable by anyone who can see the post. */
  async getPhysicalActivity(id: string): Promise<PhysicalActivity> {
    const { data } = await apiClient.get<PhysicalActivity>(`/posts/${id}/physical-activity`);
    return data;
  },

  async getMediaUploadUrl(id: string, payload: UploadUrlRequest): Promise<UploadUrlResponse> {
    const { data } = await apiClient.post<UploadUrlResponse>(`/posts/${id}/media/upload-url`, payload);
    return data;
  },

  async confirmMedia(id: string, objectKey: string): Promise<Post> {
    const { data } = await apiClient.put<Post>(`/posts/${id}/media`, { objectKey });
    return data;
  },

  async removeMedia(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}/media`);
  },

  async listUserPosts(userId: string, cursor?: string, limit?: number): Promise<PostPage> {
    const { data } = await apiClient.get<PostPage>(`/users/${userId}/posts`, { params: { cursor, limit } });
    return data;
  },

  async getFeed(cursor?: string, limit?: number): Promise<PostPage> {
    const { data } = await apiClient.get<PostPage>('/feed', { params: { cursor, limit } });
    return data;
  },
};
