import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingPlanCard } from '@/components/training-plan-card';
import { TrainingSessionCard } from '@/components/training-session-card';
import { Spacing } from '@/constants/theme';
import { useAllGoals } from '@/hooks/use-goals';
import { useAllPlans } from '@/hooks/use-plans';
import { useAllSessions } from '@/hooks/use-sessions';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { goalsForDate, plansForDate, sessionsForDate } from '@/utils/calendar-events';
import { parseIsoDateLocal } from '@/utils/date';

/**
 * Day View for a single calendar date: lists training plans overlapping that day, completed
 * sessions on that day, and goals targeting that day (across all dogs), and lets the user
 * start a planned training or create a new plan pre-filled with this date.
 */
export default function CalendarDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const colors = useTheme();

  const { data: plans, isLoading: isLoadingPlans, isError: isPlansError, error: plansError } = useAllPlans();
  const { data: sessionsWithDog, isLoading: isLoadingSessions, isError: isSessionsError } = useAllSessions();
  const { data: goalsWithDog, isLoading: isLoadingGoals, isError: isGoalsError } = useAllGoals();

  const dayPlans = useMemo(() => plansForDate(plans ?? [], date ?? ''), [plans, date]);
  const daySessions = useMemo(() => sessionsForDate(sessionsWithDog ?? [], date ?? ''), [sessionsWithDog, date]);
  const dayGoals = useMemo(() => goalsForDate(goalsWithDog ?? [], date ?? ''), [goalsWithDog, date]);

  const isLoading = isLoadingPlans || isLoadingSessions || isLoadingGoals;
  const isError = isPlansError || isSessionsError || isGoalsError;

  const parsedDate = parseIsoDateLocal(date);
  const heading = parsedDate
    ? parsedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : (date ?? '');

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this day" message={getApiErrorMessage(plansError)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: heading }} />
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="subtitle" style={styles.heading}>
          {heading}
        </ThemedText>

        <PrimaryButton
          title="New Plan"
          onPress={() => router.push(`/calendar/${date}/new-plan`)}
          style={styles.newPlanButton}
        />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Training Plans
        </ThemedText>
        {dayPlans.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            No training plans scheduled for this day.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {dayPlans.map((plan) => (
              <View key={plan.id} style={styles.itemGroup}>
                <TrainingPlanCard
                  plan={plan}
                  showDogName
                  onPress={() => router.push(`/train/plan/${plan.dogId}/${plan.id}/edit`)}
                />
                <View style={styles.itemActions}>
                  <PrimaryButton
                    title="Start Training"
                    variant="secondary"
                    onPress={() => router.push(`/session/new?planId=${plan.id}`)}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Completed Trainings
        </ThemedText>
        {daySessions.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            No completed trainings on this day.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {daySessions.map(({ session, dog }) => (
              <View key={session.id} style={styles.itemGroup}>
                <TrainingSessionCard
                  session={session}
                  dogName={dog.name}
                  onPress={() => router.push(`/session/${session.id}`)}
                />
              </View>
            ))}
          </View>
        )}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Goals
        </ThemedText>
        {dayGoals.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            No goals targeted for this day.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {dayGoals.map(({ goal, dog }) => (
              <View key={goal.id} style={styles.itemGroup}>
                <GoalCard goal={goal} onPress={() => router.push(`/dog/${dog.id}/goals/${goal.id}/edit`)} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: Spacing.four, gap: Spacing.two },
  heading: { fontSize: 22 },
  newPlanButton: { marginTop: Spacing.one, marginBottom: Spacing.two },
  sectionTitle: { fontSize: 16, marginTop: Spacing.two },
  emptyText: { marginBottom: Spacing.two },
  list: { gap: Spacing.three, marginBottom: Spacing.two },
  itemGroup: { gap: Spacing.one },
  itemActions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1 },
});
