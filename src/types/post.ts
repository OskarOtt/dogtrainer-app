/** Mirrors the backend's post.dto.PostResponse shape. */
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  dogId: string | null;
  dogName: string | null;
  trainingSessionId: string | null;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreatePostPayload {
  content: string;
  dogId?: string | null;
}

export interface CreatePostFromSessionPayload {
  content?: string | null;
}

/** Mirrors the backend's post.dto.PostPageResponse shape (cursor pagination). */
export interface PostPage {
  items: Post[];
  nextCursor: string | null;
}
