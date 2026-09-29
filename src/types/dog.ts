import type { DogTitle } from '@/types/title';

export type DogSex = 'MALE' | 'FEMALE';

export type DogMediaType = 'IMAGE' | 'VIDEO';

export interface Dog {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex | null;
  weight: number | null;
  mediaUrl: string | null;
  mediaType: DogMediaType | null;
  createdAt: string;
}

export interface DogPayload {
  name: string;
  breed?: string | null;
  birthDate?: string | null;
  sex?: DogSex | null;
  weight?: number | null;
}

/** Trimmed view of a session on a dog's public profile — no location/notes/exercises. */
export interface PublicDogSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

/**
 * A dog's profile as seen by other users. Mirrors the backend's dog.dto.PublicDogResponse —
 * deliberately omits weight, and only carries a trimmed session summary (no notes/location).
 */
export interface PublicDogProfile {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex | null;
  mediaUrl: string | null;
  mediaType: DogMediaType | null;
  createdAt: string;
  completedSessionCount: number;
  titles: DogTitle[];
  recentSessions: PublicDogSession[];
}

/** A dog as it appears in a listing of another user's dogs (e.g. their public profile). */
export interface PublicDogSummary {
  id: string;
  name: string;
  breed: string | null;
  mediaUrl: string | null;
  mediaType: DogMediaType | null;
}
