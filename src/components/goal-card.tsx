import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, StatusColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t, type TranslationKey } from '@/i18n';
import type { Goal } from '@/types/goal';
import { formatIsoDateDMY } from '@/utils/date';

export interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

const STATUS_LABELS: Record<Goal['status'], TranslationKey> = {
  NOT_STARTED: 'status.notStarted',
  IN_PROGRESS: 'status.inProgress',
  COMPLETED: 'status.completed',
  PAUSED: 'status.paused',
};

/** Card summarizing a training goal for use in dog details and Home's active-goals list. */
export function GoalCard({ goal, onPress }: GoalCardProps) {
  const colors = useTheme();
  const statusColor = StatusColors[goal.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
          {goal.title}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
          <ThemedText type="small" style={{ color: statusColor }}>
            {t(STATUS_LABELS[goal.status])}
          </ThemedText>
        </View>
      </View>
      {goal.description ? (
        <ThemedText themeColor="textSecondary" numberOfLines={2}>
          {goal.description}
        </ThemedText>
      ) : null}
      {goal.targetDate ? (
        <ThemedText themeColor="textSecondary" type="small">
          {t('goals.targetPrefix', { date: formatIsoDateDMY(goal.targetDate) })}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: { fontSize: 16, flex: 1 },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
});
