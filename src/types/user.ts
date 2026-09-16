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
