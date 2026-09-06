import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { PrimaryButton } from '@/components/primary-button';
import { ExerciseCatalogPicker } from '@/components/exercise-catalog-picker';
import { ThemedView } from '@/components/themed-view';
import { useAddSessionExercise } from '@/hooks/use-sessions';
import type { CatalogExercise } from '@/types/training';

/**
 * "Start Empty Training" / "Add to Session" entry point: a single searchable
 * list of every exercise in the catalog (tagged with its category/activity),
 * letting the user pick exercises from any mix of activities in one go
 * instead of drilling into category → activity → exercise.
 */
export default function TrainScreen() {
  const { dogId, sessionId } = useLocalSearchParams<{ dogId: string; sessionId?: string }>();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const addSessionExercise = useAddSessionExercise(sessionId ?? '');
  const [isAdding, setIsAdding] = useState(false);

  function toggle(exercise: CatalogExercise) {
    setSelectedIds((prev) =>
      prev.includes(exercise.id) ? prev.filter((id) => id !== exercise.id) : [...prev, exercise.id],
    );
  }

  async function handleStart() {
    if (sessionId) {
      setIsAdding(true);
      try {
        for (const exerciseId of selectedIds) {
          await addSessionExercise.mutateAsync({ exerciseId, repetitions: 0, successfulRepetitions: 0 });
        }
        router.replace(`/session/${sessionId}`);
      } finally {
        setIsAdding(false);
      }
      return;
    }
    router.push({
      pathname: '/session/new',
      params: { dogId, exerciseIds: selectedIds.join(',') },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Select Exercises' }} />
      <ExerciseCatalogPicker
        headerMessage="Tap exercises to add them to this session."
        selectedIds={selectedIds}
        onToggle={toggle}
        actionButton={
          <PrimaryButton
            title={sessionId ? 'Add to Session' : 'Start Training'}
            onPress={handleStart}
            disabled={selectedIds.length === 0}
            loading={isAdding}
          />
        }
      />
    </ThemedView>
  );
}
