import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DifficultyColors, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CatalogExercise } from '@/types/training';

export interface CatalogExerciseCardProps {
  exercise: CatalogExercise;
  onPress?: () => void;
  selected?: boolean;
}

const DIFFICULTY_LABELS: Record<CatalogExercise['difficulty'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

/**
 * Like `ExerciseCard`, but also shows which category/activity the exercise
 * belongs to — used by the flat, searchable exercise picker (see
 * `ExerciseCatalogPicker`) that replaced the old category → activity →
 * exercise drill-down.
 */
export function CatalogExerciseCard({ exercise, onPress, selected }: CatalogExerciseCardProps) {
  const colors = useTheme();
  const difficultyColor = DifficultyColors[exercise.difficulty];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
          {exercise.name}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: difficultyColor + '22' }]}>
          <ThemedText type="small" style={{ color: difficultyColor }}>
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </ThemedText>
        </View>
      </View>
      <ThemedText themeColor="textSecondary" type="small" numberOfLines={1}>
        {exercise.categoryName} · {exercise.activityName}
      </ThemedText>
      {exercise.description ? (
        <ThemedText themeColor="textSecondary" numberOfLines={2}>
          {exercise.description}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
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
