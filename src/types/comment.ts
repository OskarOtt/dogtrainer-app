/** Mirrors the backend's comment.dto.CommentResponse shape. */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
}
