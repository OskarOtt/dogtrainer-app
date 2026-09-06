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

/**
 * An `Exercise` flattened together with its parent activity/category names,
 * used to power the single searchable exercise list that replaced the old
 * category → activity → exercise drill-down (see `useTrainingCatalogFlat`).
 */
export interface CatalogExercise extends Exercise {
  activityName: string;
  categoryId: string;
  categoryName: string;
}
