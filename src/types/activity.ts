export type ActivityType = 'WALK' | 'RUN' | 'SKI' | 'STRENGTH_TRAINING' | 'SWIM' | 'HIKE' | 'PLAY_SESSION';

export type ActivityStatus = 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

/** Mirrors the backend's activity.dto.PhysicalActivityResponse shape. */
export interface PhysicalActivity {
  id: string;
  dogIds: string[];
  activityType: ActivityType;
  title: string;
  notes: string | null;
  startedAt: string;
  pausedAt: string | null;
  totalPausedSeconds: number;
  completedAt: string | null;
  durationMinutes: number | null;
  status: ActivityStatus;
}

export interface CreatePhysicalActivityPayload {
  dogIds: string[];
  activityType: ActivityType;
  title?: string | null;
}

export interface UpdatePhysicalActivityPayload {
  title: string;
  notes?: string | null;
}

/** Logs an activity that already happened (Train tab's "log a past entry" shortcut). */
export interface CreateManualPhysicalActivityPayload {
  dogIds: string[];
  activityType: ActivityType;
  title?: string | null;
  notes?: string | null;
  startedAt: string;
  durationMinutes: number;
}
