import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { DatePicker } from '@/components/date-picker';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { t } from '@/i18n';
import type { DogTitle, DogTitlePayload } from '@/types/title';

export interface TitleFormProps {
  initialValue?: DogTitle;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: DogTitlePayload) => void;
}

/** Shared add/edit form used by both the "new title" and "edit title" screens. */
export function TitleForm({ initialValue, submitLabel, isSubmitting, errorMessage, onSubmit }: TitleFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [dateEarned, setDateEarned] = useState(initialValue?.dateEarned ?? '');

  function handleSubmit() {
    onSubmit({
      title: title.trim(),
      dateEarned: dateEarned.trim() || null,
    });
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <ThemedText type="smallBold">{t('titles.title')}</ThemedText>
      <FormTextInput defaultValue={title} onChangeText={setTitle} placeholder={t('titles.exampleTitle')} />

      <ThemedText type="smallBold">{t('titles.dateEarned')}</ThemedText>
      <DatePicker value={dateEarned || null} onChange={setDateEarned} placeholder={t('titles.selectDateEarned')} />

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
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  error: {
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.three,
  },
});
