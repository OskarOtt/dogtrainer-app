import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { t, type TranslationKey } from '@/i18n';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, StatusColors } from '@/constants/theme';
import { usePostPhysicalActivity } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityStatus } from '@/types/activity';
import { formatDateTime, formatDuration } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const STATUS_LABELS: Record<ActivityStatus, TranslationKey> = {
  IN_PROGRESS: 'status.inProgress',
  PAUSED: 'status.paused',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
};

const TYPE_LABELS: Record<string, TranslationKey> = {
  WALK: 'activity.walk',
  RUN: 'activity.run',
  SKI: 'activity.ski',
  STRENGTH_TRAINING: 'activity.strengthTraining',
  SWIM: 'activity.swim',
  HIKE: 'activity.hike',
  PLAY_SESSION: 'activity.playSession',
};

/**
 * Read-only preview of the physical activity shared through a post - reachable by anyone who
 * can see the post (not just its author), unlike the interactive `/activity/[id]` screen which
 * is strictly owner-only.
 */
export default function PostActivityPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: activity, isLoading, isError, error } = usePostPhysicalActivity(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !activity) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title={t('activity.loadActivityError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.back()} />
        </EmptyState>
      </ThemedView>
    );
  }

  const statusColor = StatusColors[activity.status];

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t(TYPE_LABELS[activity.activityType]) }} />
      <View style={styles.list}>
        <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={styles.summaryHeaderRow}>
            <ThemedText type="subtitle">{activity.title}</ThemedText>
            <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
              <ThemedText type="small" style={{ color: statusColor }}>
                {t(STATUS_LABELS[activity.status])}
              </ThemedText>
            </View>
          </View>
          <ThemedText themeColor="textSecondary">
            {[
              formatDateTime(activity.startedAt),
              activity.durationMinutes != null ? formatDuration(activity.durationMinutes) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </ThemedText>
          {activity.notes ? (
            <ThemedText themeColor="textSecondary" type="small">
              {activity.notes}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
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
