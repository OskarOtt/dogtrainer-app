import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ExerciseCatalogPicker } from '@/components/exercise-catalog-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { togglePlanPickerExercise, usePlanPickerSelection } from '@/store/plan-exercise-picker';
import type { CatalogExercise } from '@/types/training';

/**
 * Entry point for picking exercises to attach to a training plan. A single
 * searchable list of every exercise in the catalog (tagged with its
 * category/activity) lets the user mix exercises from any activities; the
 * picked exercises are written to the shared plan-exercise-picker store and
 * read back by the Plan form (see src/store/plan-exercise-picker.ts).
 */
export default function PlanPickerScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();
  const router = useRouter();
  const selection = usePlanPickerSelection();
  const selectedIds = selection.map((exercise) => exercise.id);

  function toggle(exercise: CatalogExercise) {
    togglePlanPickerExercise({ id: exercise.id, activityId: exercise.activityId, name: exercise.name });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Select Exercises' }} />
      <ExerciseCatalogPicker
        headerMessage="Tap exercises to add or remove them from this plan."
        selectedIds={selectedIds}
        onToggle={toggle}
        actionButton={<PrimaryButton title="Done" onPress={() => router.dismissTo(returnTo as never)} />}
      />
    </ThemedView>
  );
}
