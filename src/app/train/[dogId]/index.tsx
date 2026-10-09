import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { t } from '@/i18n';
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
  const { dogId, sessionId } = useLocalSearchParams<{ dogId: string; sessionId?: string; planId?: string }>();
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
        // Pop back to the session screen that pushed this picker (rather than replacing it)
        // so its already-mounted instance — and any local state like an active edit mode —
        // survives the round trip instead of being torn down and rebuilt from scratch.
        router.back();
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
      <Stack.Screen options={{ title: t('training.selectExercises') }} />
      <ExerciseCatalogPicker
        headerMessage={t('training.selectForSession')}
        selectedIds={selectedIds}
        onToggle={toggle}
        actionButton={
          <PrimaryButton
            title={sessionId ? t('training.addToSession') : t('dog.startTraining')}
            onPress={handleStart}
            disabled={selectedIds.length === 0}
            loading={isAdding}
          />
        }
      />
    </ThemedView>
  );
}
