export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export interface Goal {
  id: string;
  dogId: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
}

export interface GoalPayload {
  title: string;
  description?: string | null;
  targetDate?: string | null;
  status?: GoalStatus;
}
