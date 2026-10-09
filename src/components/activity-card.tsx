import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CardShadow, Radii, Spacing, StatusColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t, type TranslationKey } from '@/i18n';
import type { ActivityStatus, ActivityType, PhysicalActivity } from '@/types/activity';
import { formatDateTime, formatDuration } from '@/utils/date';

export interface ActivityCardProps {
  activity: PhysicalActivity;
  onPress?: () => void;
  /** Optional owning dog's name, shown under the date row (e.g. in cross-dog calendar lists). */
  dogName?: string | null;
}

const STATUS_LABELS: Record<ActivityStatus, TranslationKey> = {
  IN_PROGRESS: 'status.inProgress',
  PAUSED: 'status.paused',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
};

const TYPE_ICONS: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  WALK: 'footsteps-outline',
  RUN: 'walk-outline',
  SKI: 'snow-outline',
  STRENGTH_TRAINING: 'barbell-outline',
  SWIM: 'water-outline',
  HIKE: 'trail-sign-outline',
  PLAY_SESSION: 'tennisball-outline',
};

/** Card summarizing a physical activity for use in history/calendar lists - mirrors `TrainingSessionCard`. */
export function ActivityCard({ activity, onPress, dogName }: ActivityCardProps) {
  const colors = useTheme();
  const statusColor = StatusColors[activity.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.iconWrap}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name={TYPE_ICONS[activity.activityType]} size={22} color={colors.primary} />
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
            {activity.title}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <ThemedText type="small" style={{ color: statusColor }}>
              {t(STATUS_LABELS[activity.status])}
            </ThemedText>
          </View>
        </View>
        {dogName ? (
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={1}>
            {dogName}
          </ThemedText>
        ) : null}
        <ThemedText themeColor="textSecondary" numberOfLines={1}>
          {[
            formatDateTime(activity.startedAt),
            activity.durationMinutes != null ? formatDuration(activity.durationMinutes) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.three,
    ...CardShadow,
  },
  iconWrap: { justifyContent: 'center' },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
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
