import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DatePicker } from '@/components/date-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { resetPlanPickerSelection, setPlanPickerSelection, usePlanPickerSelection } from '@/store/plan-exercise-picker';
import type { PlanStatus, TrainingPlan, TrainingPlanPayload } from '@/types/plan';

export interface PlanFormProps {
  initialValue?: TrainingPlan;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: TrainingPlanPayload) => void;
  /** Route to push to when the user taps "Add Exercises", to browse the training catalog. */
  pickerHref: string;
}

const STATUS_OPTIONS: { label: string; value: PlanStatus }[] = [
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
];

/** Shared add/edit form used by both the "new plan" and "edit plan" screens. */
export function PlanForm({
  initialValue,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  pickerHref,
}: PlanFormProps) {
  const colors = useTheme();
  const router = useRouter();

  const [name, setName] = useState(initialValue?.name ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValue?.endDate ?? '');
  const [status, setStatus] = useState<PlanStatus>(initialValue?.status ?? 'NOT_STARTED');
  // The picker screens write directly into this shared store (see
  // plan-exercise-picker) since expo-router can't return values from a pushed
  // screen; it's the single source of truth for this form's exercise list.
  const exercises = usePlanPickerSelection();

  // Seed the shared picker store with this plan's current exercises once, on mount,
  // so it starts in sync with the form (and isn't polluted by a previous, unrelated
  // plan's selection still sitting in the module-level store).
  useEffect(() => {
    resetPlanPickerSelection(initialValue?.exercises ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement },
  ];

  function handleAddExercises() {
    router.push(pickerHref as never);
  }

  function removeExercise(id: string) {
    setPlanPickerSelection(exercises.filter((exercise) => exercise.id !== id));
  }

  function handleSubmit() {
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      startDate: startDate.trim() || null,
      endDate: endDate.trim() || null,
      status,
      exerciseIds: exercises.map((exercise) => exercise.id),
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ThemedText type="smallBold">Name</ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. 8-week obedience plan"
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
      />

      <ThemedText type="smallBold">Description</ThemedText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="What does this plan cover?"
        placeholderTextColor={colors.textSecondary}
        multiline
        style={[inputStyle, styles.multiline]}
      />

      <ThemedText type="smallBold">Start date</ThemedText>
      <DatePicker value={startDate || null} onChange={setStartDate} placeholder="Select start date" />

      <ThemedText type="smallBold">End date</ThemedText>
      <DatePicker value={endDate || null} onChange={setEndDate} placeholder="Select end date" />

      <ThemedText type="smallBold">Exercises</ThemedText>
      {exercises.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.noExercises}>
          No exercises added yet.
        </ThemedText>
      ) : (
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <View
              key={exercise.id}
              style={[styles.exerciseRow, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
              <ThemedText style={styles.exerciseName} numberOfLines={1}>
                {exercise.name}
              </ThemedText>
              <Pressable onPress={() => removeExercise(exercise.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <PrimaryButton
        title="Add Exercises"
        variant="secondary"
        onPress={handleAddExercises}
        style={styles.addExercisesButton}
      />

      {initialValue ? (
        <>
          <ThemedText type="smallBold">Status</ThemedText>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((option) => (
              <PrimaryButton
                key={option.value}
                title={option.label}
                variant={status === option.value ? 'primary' : 'secondary'}
                onPress={() => setStatus(option.value)}
                style={styles.statusButton}
              />
            ))}
          </View>
        </>
      ) : null}

      {errorMessage ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {errorMessage}
        </ThemedText>
      ) : null}

      <PrimaryButton
        title={submitLabel}
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!name.trim()}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top', paddingVertical: Spacing.two },
  noExercises: { marginBottom: Spacing.two },
  exerciseList: { gap: Spacing.two, marginBottom: Spacing.two },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  exerciseName: { flex: 1 },
  addExercisesButton: { marginBottom: Spacing.two },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  statusButton: { flexBasis: '47%', flexGrow: 1 },
  error: {
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.three,
  },
});
