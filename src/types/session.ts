import type { Difficulty } from '@/types/training';

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  repetitions: number;
  successfulRepetitions: number;
  difficulty: Difficulty | null;
  notes: string | null;
  successRate: number;
}

export interface TrainingSession {
  id: string;
  dogId: string;
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
  location: string | null;
  notes: string | null;
  status: SessionStatus;
  exercises: SessionExercise[];
}

export interface CreateTrainingSessionPayload {
  location?: string | null;
  notes?: string | null;
}

export interface UpdateTrainingSessionPayload {
  location?: string | null;
  notes?: string | null;
}

export interface AddSessionExercisePayload {
  exerciseId: string;
  repetitions?: number;
  successfulRepetitions?: number;
  difficulty?: Difficulty | null;
  notes?: string | null;
}

export interface UpdateSessionExercisePayload {
  repetitions?: number;
  successfulRepetitions?: number;
  difficulty?: Difficulty | null;
  notes?: string | null;
}
