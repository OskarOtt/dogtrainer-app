import type { TrainingSession } from '@/types/session';

export interface DogStatistics {
  totalSessions: number;
  completedSessions: number;
  totalTrainingMinutes: number;
  sessionsThisWeek: number;
  currentStreakDays: number;
  averageSuccessRate: number;
}

export interface ExerciseProgressPoint {
  sessionStartedAt: string;
  repetitions: number;
  successfulRepetitions: number;
  successRate: number;
}

export interface ExerciseProgressEntry {
  exerciseId: string;
  exerciseName: string;
  points: ExerciseProgressPoint[];
}

export interface DogProgress {
  history: TrainingSession[];
  totalTrainingMinutes: number;
  sessionsPerWeek: number;
  currentStreakDays: number;
  averageSuccessRate: number;
  exerciseProgress: ExerciseProgressEntry[];
}
