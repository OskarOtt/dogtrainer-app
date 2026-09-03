import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DifficultyColors, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/types/training';

export interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  selected?: boolean;
}

const DIFFICULTY_LABELS: Record<Exercise['difficulty'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export function ExerciseCard({ exercise, onPress, selected }: ExerciseCardProps) {
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
      {exercise.description ? (
        <ThemedText themeColor="textSecondary" numberOfLines={3}>
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
