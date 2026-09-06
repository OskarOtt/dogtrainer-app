import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingPlanCard } from '@/components/training-plan-card';
import { Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useAllPlans } from '@/hooks/use-plans';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * "Start Training" entry point: either start a blank session (regular dog →
 * searchable exercise catalog flow), or pick one of the user's existing
 * training plans (across all dogs) to instantly start a session pre-filled with
 * that plan's dog and exercises.
 */
export default function StartTrainingScreen() {
  const { data: dogs, isLoading: isLoadingDogs } = useDogs();
  const { data: plans, isLoading: isLoadingPlans, isError, error } = useAllPlans();
  const router = useRouter();
  const colors = useTheme();

  if (isLoadingDogs) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Start Training' }} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ThemedView>
    );
  }

  if (!dogs || dogs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Start Training' }} />
        <EmptyState icon="paw-outline" title="No dogs yet" message="Add a dog before starting a training session.">
          <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Start Training' }} />
      <FlatList
        data={plans ?? []}
        keyExtractor={(plan) => plan.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.emptyStartSection}>
            <PrimaryButton
              title="Start Empty Training"
              onPress={() => router.push('/train/pick-dog')}
              style={styles.emptyStartButton}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Or start from a training plan
            </ThemedText>
            {isLoadingPlans ? <ActivityIndicator style={styles.loading} color={colors.primary} /> : null}
            {isError ? <ThemedText themeColor="danger">{getApiErrorMessage(error)}</ThemedText> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoadingPlans && !isError ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyPlansText}>
              No training plans yet. Create one from the Plan Training screen.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => (
          <TrainingPlanCard
            plan={item}
            showDogName
            onPress={() => router.push(`/session/new?planId=${item.id}`)}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
  list: { padding: Spacing.four, gap: Spacing.three, paddingTop: 0 },
  emptyStartSection: { gap: Spacing.two, marginBottom: Spacing.one },
  emptyStartButton: { marginTop: 20 },
  sectionTitle: { fontSize: 18, marginTop: Spacing.two },
  loading: { marginTop: Spacing.three },
  emptyPlansText: { marginTop: Spacing.one },
});
