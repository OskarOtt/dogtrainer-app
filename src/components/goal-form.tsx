import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DatePicker } from '@/components/date-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Goal, GoalPayload, GoalStatus } from '@/types/goal';

export interface GoalFormProps {
  initialValue?: Goal;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: GoalPayload) => void;
}

const STATUS_OPTIONS: { label: string; value: GoalStatus }[] = [
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
];

/** Shared add/edit form used by both the "new goal" and "edit goal" screens. */
export function GoalForm({ initialValue, submitLabel, isSubmitting, errorMessage, onSubmit }: GoalFormProps) {
  const colors = useTheme();

  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [targetDate, setTargetDate] = useState(initialValue?.targetDate ?? '');
  const [status, setStatus] = useState<GoalStatus>(initialValue?.status ?? 'NOT_STARTED');

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement },
  ];

  function handleSubmit() {
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      targetDate: targetDate.trim() || null,
      status,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ThemedText type="smallBold">Title</ThemedText>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Master recall"
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
      />

      <ThemedText type="smallBold">Description</ThemedText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="What does success look like?"
        placeholderTextColor={colors.textSecondary}
        multiline
        style={[inputStyle, styles.multiline]}
      />

      <ThemedText type="smallBold">Target date</ThemedText>
      <DatePicker value={targetDate || null} onChange={setTargetDate} placeholder="Select target date" />

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
        disabled={!title.trim()}
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
