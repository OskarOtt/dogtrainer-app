import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { PrimaryButton } from '@/components/primary-button';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingSessionCard } from '@/components/training-session-card';
import { BottomTabInset, Radii, Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useDogGoals } from '@/hooks/use-goals';
import { useDogSessions } from '@/hooks/use-sessions';
import { useDogStatistics } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/utils/date';

export default function HomeScreen() {
  const { data: dogs, isLoading } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState<string | undefined>(undefined);
  const router = useRouter();
  const colors = useTheme();

  // Fall back to the first dog whenever nothing has been explicitly selected yet,
  // instead of syncing this via a useEffect + setState (which would cause an extra render).
  const activeDog = useMemo(
    () => dogs?.find((dog) => dog.id === selectedDogId) ?? dogs?.[0],
    [dogs, selectedDogId],
  );
  const { data: statistics } = useDogStatistics(activeDog?.id);
  const { data: sessions } = useDogSessions(activeDog?.id);
  const { data: goals } = useDogGoals(activeDog?.id);
  const activeGoals = goals?.filter((goal) => goal.status !== 'COMPLETED') ?? [];

  if (isLoading) {
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
          <EmptyState
            icon="paw-outline"
            title="Welcome to Dog Trainer"
            message="Add a dog to see your training overview here.">
            <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title" style={styles.title}>
            Home
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

          {activeDog ? (
            <>
              <PrimaryButton
                title={`Start Training with ${activeDog.name}`}
                onPress={() => router.push(`/train/${activeDog.id}`)}
                style={styles.startButton}
              />

              <View style={styles.statsGrid}>
                <StatCard
                  icon="calendar-outline"
                  label="Sessions this week"
                  value={`${statistics?.sessionsThisWeek ?? 0}`}
                />
                <StatCard
                  icon="flame-outline"
                  label="Training streak"
                  value={`${statistics?.currentStreakWeeks ?? 0} ${(statistics?.currentStreakWeeks ?? 0) === 1 ? 'week' : 'weeks'}`}
                />
                <StatCard
                  icon="time-outline"
                  label="Total training time"
                  value={formatDuration(statistics?.totalTrainingMinutes ?? 0)}
                />
                <StatCard
                  icon="checkmark-circle-outline"
                  label="Avg. success rate"
                  value={`${Math.round((statistics?.averageSuccessRate ?? 0) * 100)}%`}
                />
              </View>

              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Active Goals
              </ThemedText>
              {activeGoals.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  No active goals yet.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {activeGoals.slice(0, 3).map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/dog/${activeDog.id}/goals`)} />
                  ))}
                </View>
              )}

              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Sessions
              </ThemedText>
              {!sessions || sessions.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  No sessions yet. Start training to build history.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {sessions.slice(0, 3).map((session) => (
                    <TrainingSessionCard
                      key={session.id}
                      session={session}
                      onPress={() => router.push(`/session/${session.id}`)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.four + BottomTabInset, gap: Spacing.three },
  title: { fontSize: 28 },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
  dogPicker: { flexGrow: 0, marginBottom: Spacing.one },
  dogChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginRight: Spacing.two,
  },
  startButton: { marginTop: Spacing.one },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  sectionTitle: { fontSize: 18, marginTop: Spacing.two },
  emptyText: { marginBottom: Spacing.one },
  list: { gap: Spacing.two },
});
