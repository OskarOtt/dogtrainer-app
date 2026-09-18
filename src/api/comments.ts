import { apiClient } from '@/api/client';
import type { Comment, CreateCommentPayload } from '@/types/comment';

/**
 * Thin wrapper around the /posts/{id}/comments and /comments/{id} endpoints. UI code and hooks
 * should only ever go through this module, never call apiClient directly.
 */
export const commentsApi = {
  async list(postId: string): Promise<Comment[]> {
    const { data } = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
    return data;
  },

  async create(postId: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await apiClient.post<Comment>(`/posts/${postId}/comments`, payload);
    return data;
  },

  async remove(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
