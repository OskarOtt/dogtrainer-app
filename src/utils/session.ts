import type { TrainingSession } from '@/types/session';

export function isVisibleTrainingSession(session: TrainingSession): boolean {
  return session.status !== 'CANCELLED';
}
