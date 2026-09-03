import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ExerciseCard } from '@/components/exercise-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAddSessionExercise } from '@/hooks/use-sessions';
import { useExercises } from '@/hooks/use-training-catalog';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function ExercisesScreen() {
  const { dogId, activityId, sessionId } = useLocalSearchParams<{ dogId: string; activityId: string; sessionId?: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: exercises, isLoading, isError, error } = useExercises(activityId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const addSessionExercise = useAddSessionExercise(sessionId ?? '');
  const [isAdding, setIsAdding] = useState(false);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
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
      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : isError ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load exercises" message={getApiErrorMessage(error)} />
      ) : !exercises || exercises.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="No exercises available" />
      ) : (
        <>
          <FlatList
            data={exercises}
            keyExtractor={(exercise) => exercise.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <ThemedText themeColor="textSecondary" style={styles.header}>
                Tap exercises to add them to this session.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <ExerciseCard exercise={item} selected={selectedIds.includes(item.id)} onPress={() => toggle(item.id)} />
            )}
          />
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <PrimaryButton
              title={
                sessionId
                  ? selectedIds.length > 0
                    ? `Add to Session (${selectedIds.length})`
                    : 'Add to Session'
                  : selectedIds.length > 0
                    ? `Start Training (${selectedIds.length})`
                    : 'Start Training'
              }
              onPress={handleStart}
              disabled={selectedIds.length === 0}
              loading={isAdding}
            />
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { marginBottom: Spacing.one },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
  },
});
