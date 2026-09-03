import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SessionExercise } from '@/types/session';

export interface SessionExerciseCardProps {
  sessionExercise: SessionExercise;
  exerciseName: string;
  onIncrementRepetitions: () => void;
  onIncrementSuccessful: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

/**
 * Large-touch-target card used during an active training session to record
 * repetitions and successful repetitions with a single tap each — optimized
 * for quick use while actively training a dog (no typing required).
 */
export function SessionExerciseCard({
  sessionExercise,
  exerciseName,
  onIncrementRepetitions,
  onIncrementSuccessful,
  onRemove,
  disabled,
}: SessionExerciseCardProps) {
  const colors = useTheme();
  const successRatePercent = Math.round(sessionExercise.successRate * 100);

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
          {exerciseName}
        </ThemedText>
        <Pressable onPress={onRemove} disabled={disabled} hitSlop={12}>
          <Ionicons name="close-circle-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.countersRow}>
        <Pressable
          onPress={onIncrementRepetitions}
          disabled={disabled}
          style={({ pressed }) => [
            styles.counterButton,
            { backgroundColor: colors.backgroundSelected, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
          ]}>
          <ThemedText type="title" style={styles.counterValue}>
            {sessionExercise.repetitions}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">
            Reps (+1)
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onIncrementSuccessful}
          disabled={disabled}
          style={({ pressed }) => [
            styles.counterButton,
            { backgroundColor: colors.success + '22', opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
          ]}>
          <ThemedText type="title" style={[styles.counterValue, { color: colors.success }]}>
            {sessionExercise.successfulRepetitions}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">
            Success (+1)
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText themeColor="textSecondary" type="small">
        Success rate: {successRatePercent}%
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
  name: { fontSize: 18, flex: 1 },
  countersRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  counterButton: {
    flex: 1,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    gap: Spacing.one,
  },
  counterValue: { fontSize: 36, lineHeight: 40 },
});
