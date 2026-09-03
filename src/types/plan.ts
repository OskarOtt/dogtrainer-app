export type PlanStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export interface PlanExercise {
  id: string;
  activityId: string;
  name: string;
}

export interface TrainingPlan {
  id: string;
  dogId: string;
  dogName: string | null;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: PlanStatus;
  exercises: PlanExercise[];
}

export interface TrainingPlanPayload {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: PlanStatus;
  exerciseIds?: string[];
}
