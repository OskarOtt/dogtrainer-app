import { apiClient } from '@/api/client';
import type { CreatePostFromSessionPayload, CreatePostPayload, Post, PostPage } from '@/types/post';
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/media';

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

  async get(id: string): Promise<Post> {
    const { data } = await apiClient.get<Post>(`/posts/${id}`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
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
