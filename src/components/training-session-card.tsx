import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, StatusColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrainingSession } from '@/types/session';
import { formatDateTime, formatDuration } from '@/utils/date';

export interface TrainingSessionCardProps {
  session: TrainingSession;
  onPress?: () => void;
  /** Optional owning dog's name, shown under the date row (e.g. in cross-dog calendar lists). */
  dogName?: string | null;
}

const STATUS_LABELS: Record<TrainingSession['status'], string> = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Card summarizing a training session for use in history/progress lists. */
export function TrainingSessionCard({ session, onPress, dogName }: TrainingSessionCardProps) {
  const colors = useTheme();
  const statusColor = StatusColors[session.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.iconWrap}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="paw" size={22} color={colors.primary} />
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.date} numberOfLines={1}>
            {formatDateTime(session.startedAt)}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <ThemedText type="small" style={{ color: statusColor }}>
              {STATUS_LABELS[session.status]}
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
            session.location,
            session.durationMinutes != null ? formatDuration(session.durationMinutes) : null,
            `${session.exercises.length} exercise${session.exercises.length === 1 ? '' : 's'}`,
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
  date: { fontSize: 16, flex: 1 },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
});
