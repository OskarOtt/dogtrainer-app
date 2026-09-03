export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface TrainingCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
}

export interface Exercise {
  id: string;
  activityId: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  instructions: string | null;
}
