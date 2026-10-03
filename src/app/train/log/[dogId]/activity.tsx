import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { DatePicker } from '@/components/date-picker';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABEL_KEYS } from '@/constants/activity-types';
import { Radii, Spacing } from '@/constants/theme';
import { useCreateManualActivity } from '@/hooks/use-activities';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityType } from '@/types/activity';
import { deriveManualStartedAt, isFutureDate, toIsoDateLocal } from '@/utils/date';
import { getApiErrorMessage, isFutureEntryError } from '@/utils/apiError';

/**
 * Manual "log a past physical activity" form - the Train tab's low-key shortcut for an
 * activity (walk/run/etc) the user forgot to track live. Collects only a date (not an exact
 * time) plus hours/minutes spent; the activity is created directly as COMPLETED (see
 * useCreateManualActivity).
 */
export default function LogPastActivityScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const createManualActivity = useCreateManualActivity(dogId);

  const [activityType, setActivityType] = useState<ActivityType>('WALK');
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
    createManualActivity.mutate(
      {
        activityType,
        title: title.trim() || null,
        notes: notes.trim() || null,
        startedAt: deriveManualStartedAt(date, durationMinutes),
        durationMinutes,
      },
      {
        onSuccess: () => router.replace('/(tabs)/train'),
      }
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: t('activity.activity') }} />

      <ThemedText type="smallBold">{t('manualEntry.activityType')}</ThemedText>
      <View style={styles.typeGrid}>
        {ACTIVITY_TYPES.map((option) => {
          const selected = option.type === activityType;
          return (
            <Pressable
              key={option.type}
              onPress={() => setActivityType(option.type)}
              style={[
                styles.typeChip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.backgroundSelected : colors.backgroundElement,
                },
              ]}>
              <Ionicons name={option.icon} size={18} color={selected ? colors.primary : colors.textSecondary} />
              <ThemedText type="small" style={selected ? { color: colors.primary } : undefined}>
                {t(ACTIVITY_TYPE_LABEL_KEYS[option.type])}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="smallBold">{t('common.title')}</ThemedText>
      <FormTextInput defaultValue={title} onChangeText={setTitle} placeholder={t('activity.titlePlaceholder')} />

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

      <ThemedText type="smallBold">{t('manualEntry.notes')}</ThemedText>
      <FormTextInput
        defaultValue={notes}
        onChangeText={setNotes}
        placeholder={t('activity.notesPlaceholder')}
        multiline
        numberOfLines={5}
        style={styles.notesInput}
      />

      {createManualActivity.isError ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {isFutureEntryError(createManualActivity.error)
            ? t('manualEntry.futureError')
            : getApiErrorMessage(createManualActivity.error, t('manualEntry.saveActivityError'))}
        </ThemedText>
      ) : null}

      <PrimaryButton
        title={t('manualEntry.save')}
        onPress={handleSubmit}
        loading={createManualActivity.isPending}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.two },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  durationRow: { flexDirection: 'row', gap: Spacing.two },
  durationField: { flex: 1 },
  notesInput: { height: 96 },
  error: { textAlign: 'center' },
  fieldError: { marginTop: -Spacing.one, marginBottom: Spacing.two },
  submitButton: { marginTop: Spacing.three },
});
