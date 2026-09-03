import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingPlanCard } from '@/components/training-plan-card';
import { Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useDogPlans } from '@/hooks/use-plans';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * "Plan Training" entry point: choose a dog (auto-selected if there's only one),
 * then manage that dog's training plans (view/edit/delete existing ones, add new).
 */
export default function PlanTrainingScreen() {
  const { data: dogs, isLoading: isLoadingDogs } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState<string | undefined>(undefined);
  const router = useRouter();
  const colors = useTheme();

  const activeDog = useMemo(
    () => dogs?.find((dog) => dog.id === selectedDogId) ?? dogs?.[0],
    [dogs, selectedDogId],
  );

  const {
    data: plans,
    isLoading: isLoadingPlans,
    isError,
    error,
  } = useDogPlans(activeDog?.id);

  if (isLoadingDogs) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center} edges={['top']}>
          <ActivityIndicator color={colors.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!dogs || dogs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState icon="paw-outline" title="No dogs yet" message="Add a dog before creating a training plan.">
            <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Plan Training
        </ThemedText>

        {dogs.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogPicker}>
            {dogs.map((dog) => {
              const selected = dog.id === activeDog?.id;
              return (
                <Pressable
                  key={dog.id}
                  onPress={() => setSelectedDogId(dog.id)}
                  style={[
                    styles.dogChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}>
                  <ThemedText style={{ color: selected ? colors.onPrimary : colors.text }}>{dog.name}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {isLoadingPlans ? (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load training plans" message={getApiErrorMessage(error)} />
        ) : (
          <FlatList
            data={plans ?? []}
            keyExtractor={(plan) => plan.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No training plans yet"
                message={`Create a plan to structure ${activeDog?.name}'s upcoming sessions.`}
              />
            }
            renderItem={({ item }) => (
              <TrainingPlanCard
                plan={item}
                onPress={() => router.push(`/train/plan/${activeDog?.id}/${item.id}/edit`)}
              />
            )}
          />
        )}

        <PrimaryButton
          title="Add Plan"
          onPress={() => router.push(`/train/plan/${activeDog?.id}/new`)}
          style={styles.addButton}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
  dogPicker: { flexGrow: 0, marginHorizontal: Spacing.four, marginTop: Spacing.two },
  dogChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginRight: Spacing.two,
  },
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  addButton: { margin: Spacing.four, marginTop: 0 },
});
