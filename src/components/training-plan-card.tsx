import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, StatusColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrainingPlan } from '@/types/plan';
import { formatIsoDateDMY } from '@/utils/date';
import { stripRichTextMarkup } from '@/utils/richText';

export interface TrainingPlanCardProps {
  plan: TrainingPlan;
  onPress?: () => void;
  /** Shows the owning dog's name (e.g. in the cross-dog "Start Training" plan list). */
  showDogName?: boolean;
}

const STATUS_LABELS: Record<TrainingPlan['status'], string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
};

/** Card summarizing a training plan for use in the Plan/Start Training screens. */
export function TrainingPlanCard({ plan, onPress, showDogName }: TrainingPlanCardProps) {
  const colors = useTheme();
  const statusColor = StatusColors[plan.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
          {plan.name}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
          <ThemedText type="small" style={{ color: statusColor }}>
            {STATUS_LABELS[plan.status]}
          </ThemedText>
        </View>
      </View>
      {showDogName && plan.dogName ? (
        <ThemedText themeColor="textSecondary" type="small">
          {plan.dogName}
        </ThemedText>
      ) : null}
      {plan.description ? (
        <ThemedText themeColor="textSecondary" numberOfLines={2}>
          {stripRichTextMarkup(plan.description)}
        </ThemedText>
      ) : null}
      <ThemedText themeColor="textSecondary" type="small">
        {(plan.exercises ?? []).length} {(plan.exercises ?? []).length === 1 ? 'exercise' : 'exercises'}
      </ThemedText>
      {plan.startDate || plan.endDate ? (
        <ThemedText themeColor="textSecondary" type="small">
          {[formatIsoDateDMY(plan.startDate), formatIsoDateDMY(plan.endDate)].filter(Boolean).join(' → ')}
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
  name: { fontSize: 16, flex: 1 },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
});
