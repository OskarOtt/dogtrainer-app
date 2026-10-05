import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { DatePicker } from '@/components/date-picker';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCreateManualSession } from '@/hooks/use-sessions';
import { deriveManualStartedAt, isFutureDate, toIsoDateLocal } from '@/utils/date';
import { getApiErrorMessage, isFutureEntryError } from '@/utils/apiError';

/**
 * Manual "log a past training session" form - the Train tab's low-key shortcut for a session
 * the user forgot to track live. Collects only a date (not an exact time) plus hours/minutes
 * spent; the session is created directly as COMPLETED (see useCreateManualSession).
 */
export default function LogPastSessionScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const createManualSession = useCreateManualSession(dogId);

  const [date, setDate] = useState(() => toIsoDateLocal(new Date()));
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const durationMinutes = Math.max(0, Number(hoursText) || 0) * 60 + Math.max(0, Number(minutesText) || 0);
  const futureDate = isFutureDate(date);
  const canSubmit = !!date && durationMinutes >= 1 && !futureDate;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    createManualSession.mutate(
      {
        startedAt: deriveManualStartedAt(date, durationMinutes),
        durationMinutes,
        // The "title" the user enters is stored in the session's existing `location` field -
        // the backend has no separate title column for training sessions.
        location: title.trim() || null,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => router.replace('/(tabs)/train'),
      }
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: t('training.session') }} />

      <ThemedText type="smallBold">{t('manualEntry.date')}</ThemedText>
      <DatePicker value={date} onChange={setDate} maxYear={new Date().getFullYear()} />
      {futureDate ? (
        <ThemedText themeColor="danger" style={styles.fieldError}>
          {t('manualEntry.futureError')}
        </ThemedText>
      ) : null}

      <ThemedText type="smallBold">{t('manualEntry.timeSpent')}</ThemedText>
      <View style={styles.durationRow}>
        <View style={styles.durationField}>
          <FormTextInput
            defaultValue={hoursText}
            onChangeText={setHoursText}
            placeholder={t('manualEntry.hours')}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.durationField}>
          <FormTextInput
            defaultValue={minutesText}
            onChangeText={setMinutesText}
            placeholder={t('manualEntry.minutes')}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <ThemedText type="smallBold">{t('common.title')}</ThemedText>
      <FormTextInput defaultValue={title} onChangeText={setTitle} placeholder={t('manualEntry.titlePlaceholder')} />

      <ThemedText type="smallBold">{t('manualEntry.notes')}</ThemedText>
      <FormTextInput
        defaultValue={notes}
        onChangeText={setNotes}
        placeholder={t('training.notesPlaceholder')}
        multiline
        numberOfLines={5}
        style={styles.notesInput}
      />

      {createManualSession.isError ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {isFutureEntryError(createManualSession.error)
            ? t('manualEntry.futureError')
            : getApiErrorMessage(createManualSession.error, t('manualEntry.saveSessionError'))}
        </ThemedText>
      ) : null}

      <PrimaryButton
        title={t('manualEntry.save')}
        onPress={handleSubmit}
        loading={createManualSession.isPending}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.two },
  durationRow: { flexDirection: 'row', gap: Spacing.two },
  durationField: { flex: 1 },
  notesInput: { height: 96 },
  error: { textAlign: 'center' },
  fieldError: { marginTop: -Spacing.one, marginBottom: Spacing.two },
  submitButton: { marginTop: Spacing.three },
});
