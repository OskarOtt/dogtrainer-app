import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseProgressEntry } from '@/types/stats';

export interface ProgressCardProps {
  entry: ExerciseProgressEntry;
}

/** Shows an exercise's success rate trend over time as a simple bar chart. */
export function ProgressCard({ entry }: ProgressCardProps) {
  const colors = useTheme();
  const points = entry.points.slice(-8);
  const latest = points[points.length - 1];
  const first = points[0];
  const trend = latest && first ? latest.successRate - first.successRate : 0;
  const trendIcon = trend > 0.01 ? 'trending-up' : trend < -0.01 ? 'trending-down' : 'remove';
  const trendColor = trend > 0.01 ? colors.success : trend < -0.01 ? colors.danger : colors.textSecondary;

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
          {entry.exerciseName}
        </ThemedText>
        <Ionicons name={trendIcon} size={20} color={trendColor} />
      </View>

      <View style={styles.barsRow}>
        {points.map((point, index) => (
          <View key={index} style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { height: `${Math.max(4, point.successRate * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        ))}
      </View>

      <ThemedText themeColor="textSecondary" type="small">
        Latest: {latest ? Math.round(latest.successRate * 100) : 0}% success rate
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: { fontSize: 16, flex: 1 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
    height: 48,
  },
  barTrack: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
});
