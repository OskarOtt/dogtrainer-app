import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ProgressCard } from '@/components/progress-card';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingSessionCard } from '@/components/training-session-card';
import { Spacing } from '@/constants/theme';
import { useDog } from '@/hooks/use-dogs';
import { useDogProgress } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDuration } from '@/utils/date';

export default function DogProgressScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog } = useDog(dogId);
  const { data: progress, isLoading, isError, error } = useDogProgress(dogId);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !progress) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load progress" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: dog ? `${dog.name}'s Progress` : 'Progress' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsGrid}>
          <StatCard icon="time-outline" label="Total training time" value={formatDuration(progress.totalTrainingMinutes)} />
          <StatCard icon="calendar-outline" label="Sessions / week" value={progress.sessionsPerWeek.toFixed(1)} />
          <StatCard icon="flame-outline" label="Current streak" value={`${progress.currentStreakDays} days`} />
          <StatCard
            icon="checkmark-circle-outline"
            label="Avg. success rate"
            value={`${Math.round(progress.averageSuccessRate * 100)}%`}
          />
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Exercise Progress
        </ThemedText>
        {progress.exerciseProgress.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            Complete some exercises to see progress over time.
          </ThemedText>
        ) : (
          <View style={styles.progressList}>
            {progress.exerciseProgress.map((entry) => (
              <ProgressCard key={entry.exerciseId} entry={entry} />
            ))}
          </View>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Training History
        </ThemedText>
        {progress.history.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            No training sessions yet.
          </ThemedText>
        ) : (
          <View style={styles.progressList}>
            {progress.history.map((session) => (
              <TrainingSessionCard
                key={session.id}
                session={session}
                onPress={() => router.push(`/session/${session.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: Spacing.four, gap: Spacing.three },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionTitle: { fontSize: 18 },
  emptyText: { marginBottom: Spacing.two },
  progressList: { gap: Spacing.two, marginBottom: Spacing.two },
});
