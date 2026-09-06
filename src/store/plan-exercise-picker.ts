import { useSyncExternalStore } from 'react';

import type { PlanExercise } from '@/types/plan';

/**
 * Tiny pub/sub store used only to carry the exercises a user picks from the flat,
 * searchable exercise catalog screen (`/train/plan-picker`) back to the Plan
 * Training form, since expo-router has no built-in way to return a value from a
 * pushed screen. The Plan form subscribes to this while it's focused and copies
 * the selection into its own local state; the store itself holds no long-term state.
 */
let selection: PlanExercise[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getPlanPickerSelection(): PlanExercise[] {
  return selection;
}

export function setPlanPickerSelection(next: PlanExercise[]) {
  selection = next;
  emit();
}

export function resetPlanPickerSelection(initial: PlanExercise[] = []) {
  setPlanPickerSelection(initial);
}

export function togglePlanPickerExercise(exercise: PlanExercise) {
  const exists = selection.some((item) => item.id === exercise.id);
  setPlanPickerSelection(
    exists ? selection.filter((item) => item.id !== exercise.id) : [...selection, exercise],
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlanPickerSelection(): PlanExercise[] {
  return useSyncExternalStore(subscribe, getPlanPickerSelection, getPlanPickerSelection);
}
