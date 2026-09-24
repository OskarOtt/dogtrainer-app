import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
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
import { formatDecimal, formatPercent } from '@/utils/number';

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
        <EmptyState icon="alert-circle-outline" title={t('progress.loadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: dog ? t('progress.dogTitle', { name: dog.name }) : t('progress.title') }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsGrid}>
          <StatCard icon="time-outline" label={t('progress.totalTime')} value={formatDuration(progress.totalTrainingMinutes)} />
          <StatCard
            icon="calendar-outline"
            label={t('progress.sessionsPerWeek')}
            value={formatDecimal(progress.sessionsPerWeek)}
          />
          <StatCard icon="flame-outline" label={t('progress.currentStreak')} value={t('time.week', { count: progress.currentStreakWeeks })} />
          <StatCard
            icon="checkmark-circle-outline"
            label={t('progress.averageSuccess')}
            value={formatPercent(progress.averageSuccessRate)}
          />
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('progress.exerciseProgress')}
        </ThemedText>
        {progress.exerciseProgress.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            {t('progress.exerciseEmpty')}
          </ThemedText>
        ) : (
          <View style={styles.progressList}>
            {progress.exerciseProgress.map((entry) => (
              <ProgressCard key={entry.exerciseId} entry={entry} />
            ))}
          </View>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('progress.trainingHistory')}
        </ThemedText>
        {progress.history.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            {t('progress.noSessions')}
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
