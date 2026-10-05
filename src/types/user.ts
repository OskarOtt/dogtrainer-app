/**
 * A user's profile as seen by other users. Mirrors the backend's
 * user.dto.PublicUserResponse — deliberately omits email, unlike `User` in `types/auth.ts`.
 */
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

/**
 * A single result from `GET /users/search`. Mirrors the backend's
 * user.dto.UserSearchResult — distinct from `PublicUser` since it also carries
 * the immutable `username` handle used for search matching/display.
 */
export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}
