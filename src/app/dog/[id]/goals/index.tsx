import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDogGoals } from '@/hooks/use-goals';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function DogGoalsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: goals, isLoading, isError, error } = useDogGoals(id);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Goals' }} />
      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : isError ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load goals" message={getApiErrorMessage(error)} />
      ) : (
        <FlatList
          data={goals ?? []}
          keyExtractor={(goal) => goal.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState icon="flag-outline" title="No goals yet" message="Set a training goal to track progress." />
          }
          renderItem={({ item }) => (
            <GoalCard goal={item} onPress={() => router.push(`/dog/${id}/goals/${item.id}/edit`)} />
          )}
        />
      )}
      <PrimaryButton title="Add Goal" onPress={() => router.push(`/dog/${id}/goals/new`)} style={styles.addButton} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  addButton: { margin: Spacing.four, marginTop: 0 },
});
