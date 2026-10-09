import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { t, type TranslationKey } from '@/i18n';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SessionExerciseCard } from '@/components/session-exercise-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radii, Spacing, StatusColors } from '@/constants/theme';
import { usePostTrainingSession } from '@/hooks/use-posts';
import { useExercise } from '@/hooks/use-training-catalog';
import { useTheme } from '@/hooks/use-theme';
import type { SessionExercise, TrainingSession } from '@/types/session';
import { formatDateTime, formatDuration } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const STATUS_LABELS: Record<TrainingSession['status'], TranslationKey> = {
  IN_PROGRESS: 'status.inProgress',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
};

/** Resolves and displays a single, read-only session exercise; owns its own exercise-name lookup. */
function ReadOnlySessionExerciseRow({ sessionExercise }: { sessionExercise: SessionExercise }) {
  const { data: exercise } = useExercise(sessionExercise.exerciseId);
  return (
    <SessionExerciseCard
      sessionExercise={sessionExercise}
      exerciseName={exercise?.name ?? t('common.exercise')}
      disabled
      onRemove={() => {}}
      onIncrementSuccess={() => {}}
      onDecrementSuccess={() => {}}
      onIncrementFail={() => {}}
      onDecrementFail={() => {}}
    />
  );
}

/**
 * Read-only preview of the training session shared through a post - reachable by anyone who can
 * see the post (not just its author), unlike the interactive `/session/[id]` screen which is
 * strictly owner-only. No edit/complete/cancel/add-exercise affordances here.
 */
export default function PostTrainingSessionPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: session, isLoading, isError, error } = usePostTrainingSession(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: t('posts.sessionPreviewTitle') }} />
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !session) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t('posts.sessionPreviewTitle') }} />
        <EmptyState icon="alert-circle-outline" title={t('posts.sessionPreviewLoadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.back()} />
        </EmptyState>
      </ThemedView>
    );
  }

  const statusColor = StatusColors[session.status];

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('posts.sessionPreviewTitle') }} />
      <FlatList
        data={session.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={styles.summaryHeaderRow}>
              <ThemedText type="subtitle">{formatDateTime(session.startedAt)}</ThemedText>
              <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                <ThemedText type="small" style={{ color: statusColor }}>
                  {t(STATUS_LABELS[session.status])}
                </ThemedText>
              </View>
            </View>
            <ThemedText themeColor="textSecondary">
              {[
                session.location,
                session.durationMinutes != null ? formatDuration(session.durationMinutes) : null,
                t('common.exercises', { count: session.exercises.length }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </ThemedText>
            {session.notes ? (
              <ThemedText themeColor="textSecondary" type="small">
                {session.notes}
              </ThemedText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ReadOnlySessionExerciseRow sessionExercise={item} />}
        ListEmptyComponent={
          <EmptyState icon="barbell-outline" title={t('training.noExercises')} message={t('training.noExercisesRecorded')} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.one,
    marginBottom: Spacing.three,
    ...CardShadow,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
