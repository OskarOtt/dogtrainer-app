import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DatePicker } from '@/components/date-picker';
import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [targetDate, setTargetDate] = useState(initialValue?.targetDate ?? '');
  const [status, setStatus] = useState<GoalStatus>(initialValue?.status ?? 'NOT_STARTED');

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
      <FormTextInput defaultValue={title} onChangeText={setTitle} placeholder="e.g. Master recall" />

      <ThemedText type="smallBold">Description</ThemedText>
      <FormTextInput
        defaultValue={description}
        onChangeText={setDescription}
        placeholder="What does success look like?"
        multiline
        numberOfLines={4}
        style={styles.multilineHost}
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
  multilineHost: { height: 88, marginBottom: Spacing.two },
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
