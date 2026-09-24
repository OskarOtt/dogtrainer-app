import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { t } from '@/i18n';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SessionExercise } from '@/types/session';
import { formatPercent } from '@/utils/number';

export interface SessionExerciseCardProps {
  sessionExercise: SessionExercise;
  exerciseName: string;
  onIncrementSuccess: () => void;
  onDecrementSuccess: () => void;
  onIncrementFail: () => void;
  onDecrementFail: () => void;
  onRemove: () => void;
  /** Commits an edited per-exercise note once the notes field loses focus. Omit while read-only. */
  onNotesBlur?: (notes: string | null) => void;
  disabled?: boolean;
}

/**
 * Large-touch-target card used during an active training session to record
 * successful and failed repetitions with dedicated +1/-1 controls (the -1
 * controls let the trainer correct an accidental tap) — optimized for quick
 * use while actively training a dog (no typing required). `repetitions` is
 * always `successfulRepetitions + fail`, so fail is derived rather than
 * stored separately.
 */
export function SessionExerciseCard({
  sessionExercise,
  exerciseName,
  onIncrementSuccess,
  onDecrementSuccess,
  onIncrementFail,
  onDecrementFail,
  onRemove,
  onNotesBlur,
  disabled,
}: SessionExerciseCardProps) {
  const colors = useTheme();
  const fail = sessionExercise.repetitions - sessionExercise.successfulRepetitions;
  const [notes, setNotes] = useState(sessionExercise.notes ?? '');
  // Debounced auto-save as a safety net: tapping straight from this field to the "Finish"
  // button (or another exercise's card) may not reliably fire onBlur before the session is
  // completed, which was silently dropping the last-typed notes. Blur still saves immediately too.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!onNotesBlur || disabled) {
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onNotesBlur(notes.trim() || null);
    }, 600);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the typed text changes
  }, [notes]);

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
        <View style={[styles.counterGroup, { backgroundColor: colors.danger + '22' }]}>
          <ThemedText type="title" style={[styles.counterValue, { color: colors.danger }]}>
            {fail}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">
            {t('sessionExercise.fail')}
          </ThemedText>
          <View style={styles.counterButtonsRow}>
            <Pressable
                onPress={onDecrementFail}
                disabled={disabled || fail <= 0}
                style={({ pressed }) => [
                  styles.counterButton,
                  { backgroundColor: colors.background, opacity: disabled || fail <= 0 ? 0.4 : pressed ? 0.7 : 1 },
                ]}>
              <ThemedText type="subtitle">-1</ThemedText>
            </Pressable>
            <Pressable
                onPress={onIncrementFail}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.counterButton,
                  { backgroundColor: colors.background, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
                ]}>
              <ThemedText type="subtitle">+1</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={[styles.counterGroup, { backgroundColor: colors.success + '22' }]}>
          <ThemedText type="title" style={[styles.counterValue, { color: colors.success }]}>
            {sessionExercise.successfulRepetitions}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">
            {t('sessionExercise.success')}
          </ThemedText>
          <View style={styles.counterButtonsRow}>
            <Pressable
              onPress={onDecrementSuccess}
              disabled={disabled || sessionExercise.successfulRepetitions <= 0}
              style={({ pressed }) => [
                styles.counterButton,
                {
                  backgroundColor: colors.background,
                  opacity: disabled || sessionExercise.successfulRepetitions <= 0 ? 0.4 : pressed ? 0.7 : 1,
                },
              ]}>
              <ThemedText type="subtitle">-1</ThemedText>
            </Pressable>
            <Pressable
              onPress={onIncrementSuccess}
              disabled={disabled}
              style={({ pressed }) => [
                styles.counterButton,
                { backgroundColor: colors.background, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="subtitle">+1</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.summaryRow, { borderTopColor: colors.border }]}>
        <ThemedText themeColor="textSecondary" type="small">
          {t('sessionExercise.successRate', { rate: formatPercent(sessionExercise.successRate) })}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {t('sessionExercise.totalReps', { count: sessionExercise.repetitions })}
        </ThemedText>
      </View>

      {onNotesBlur && !disabled ? (
        <TextInput
          key={sessionExercise.id}
          value={notes}
          onChangeText={setNotes}
          onBlur={() => onNotesBlur(notes.trim() || null)}
          placeholder={t('training.exerciseNotes')}
          placeholderTextColor={colors.textSecondary}
          multiline
          style={[styles.notesInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
        />
      ) : sessionExercise.notes ? (
        <ThemedText themeColor="textSecondary" type="small">
          {sessionExercise.notes}
        </ThemedText>
      ) : null}
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
  counterGroup: {
    flex: 1,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  counterValue: { fontSize: 32, lineHeight: 36 },
  counterButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.one,
    width: '100%',
  },
  counterButton: {
    flex: 1,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  notesInput: {
    minHeight: 65,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.two,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
