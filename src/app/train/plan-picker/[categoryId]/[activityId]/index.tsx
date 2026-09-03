import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ExerciseCard } from '@/components/exercise-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useExercises } from '@/hooks/use-training-catalog';
import { useTheme } from '@/hooks/use-theme';
import { togglePlanPickerExercise, usePlanPickerSelection } from '@/store/plan-exercise-picker';
import { getApiErrorMessage } from '@/utils/apiError';

export default function PlanPickerExercisesScreen() {
  const { activityId, returnTo } = useLocalSearchParams<{ activityId: string; returnTo: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: exercises, isLoading, isError, error } = useExercises(activityId);
  const selection = usePlanPickerSelection();
  const selectedIds = selection.map((exercise) => exercise.id);

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
        <FlatList
          data={exercises}
          keyExtractor={(exercise) => exercise.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <ThemedText themeColor="textSecondary" style={styles.header}>
              Tap exercises to add or remove them from this plan.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              selected={selectedIds.includes(item.id)}
              onPress={() => togglePlanPickerExercise({ id: item.id, activityId: item.activityId, name: item.name })}
            />
          )}
        />
      )}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton
          title={selection.length > 0 ? `Done (${selection.length})` : 'Done'}
          onPress={() => router.dismissTo(returnTo as never)}
        />
      </View>
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
