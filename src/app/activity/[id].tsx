import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t, type TranslationKey } from '@/i18n';
import { ActivityFooter } from '@/components/activity-footer';
import { EmptyState } from '@/components/empty-state';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radii, Spacing } from '@/constants/theme';
import {
  useActivity,
  useCancelActivity,
  useCompleteActivity,
  usePauseActivity,
  useResumeActivity,
  useUpdateActivity,
} from '@/hooks/use-activities';
import { useDogs } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import type { PhysicalActivity } from '@/types/activity';
import { formatTimer } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const TYPE_LABEL_KEYS: Record<string, TranslationKey> = {
  WALK: 'activity.walk',
  RUN: 'activity.run',
  SKI: 'activity.ski',
  STRENGTH_TRAINING: 'activity.strengthTraining',
  SWIM: 'activity.swim',
  HIKE: 'activity.hike',
  PLAY_SESSION: 'activity.playSession',
};

/**
 * Computes the elapsed seconds of a physical activity from its raw pause bookkeeping fields.
 * Frozen (not ticking) while PAUSED, stopped at the final value once COMPLETED/CANCELLED, live
 * (needs a ticking interval from the caller) while IN_PROGRESS.
 */
function computeElapsedSeconds(
  startedAt: string,
  pausedAt: string | null,
  totalPausedSeconds: number,
  status: string
): number {
  const startedMs = new Date(startedAt).getTime();
  const endMs = status === 'PAUSED' && pausedAt ? new Date(pausedAt).getTime() : Date.now();
  const rawSeconds = Math.floor((endMs - startedMs) / 1000);
  return Math.max(0, rawSeconds - totalPausedSeconds);
}

export default function ActiveActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: activity, isLoading, isError, error } = useActivity(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !activity) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title={t('activity.loadActivityError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  // Keyed by activity id so the local title/notes draft state below initializes fresh whenever
  // the id changes, without needing an effect to re-sync it after `activity` finishes loading.
  return <LoadedActivityScreen key={activity.id} id={id} activity={activity} />;
}

function LoadedActivityScreen({ id, activity }: { id: string; activity: PhysicalActivity }) {
  const router = useRouter();
  const colors = useTheme();

  const updateActivity = useUpdateActivity(id);
  const pauseActivity = usePauseActivity(id);
  const resumeActivity = useResumeActivity(id);
  const completeActivity = useCompleteActivity(id);
  const cancelActivity = useCancelActivity(id);
  const { data: dogs } = useDogs();
  const dogNames = (dogs ?? []).filter((dog) => activity.dogIds.includes(dog.id)).map((dog) => dog.name);

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    computeElapsedSeconds(activity.startedAt, activity.pausedAt, activity.totalPausedSeconds, activity.status)
  );
  const [title, setTitle] = useState(activity.title);
  const [notes, setNotes] = useState(activity.notes ?? '');

  useEffect(() => {
    const tick = () =>
      setElapsedSeconds(computeElapsedSeconds(activity.startedAt, activity.pausedAt, activity.totalPausedSeconds, activity.status));
    tick();
    if (activity.status !== 'IN_PROGRESS') {
      return;
    }
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activity.startedAt, activity.pausedAt, activity.totalPausedSeconds, activity.status]);

  // Prevent leaving an in-progress/paused activity via the Android hardware back button —
  // Finish/Cancel are the only supported exits while it's active, mirrors the session screen.
  useEffect(() => {
    if (Platform.OS !== 'android' || (activity.status !== 'IN_PROGRESS' && activity.status !== 'PAUSED')) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [activity.status]);

  const handleTitleBlur = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === activity.title) {
      return;
    }
    updateActivity.mutate({ title: trimmed, notes: activity.notes ?? null });
  }, [activity.notes, activity.title, title, updateActivity]);

  const handleNotesBlur = useCallback(() => {
    const trimmed = notes.trim();
    if (trimmed === (activity.notes ?? '')) {
      return;
    }
    updateActivity.mutate({ title: activity.title, notes: trimmed || null });
  }, [activity.notes, activity.title, notes, updateActivity]);

  const isActive = activity.status === 'IN_PROGRESS' || activity.status === 'PAUSED';
  const isPaused = activity.status === 'PAUSED';

  function handleCancel() {
    cancelActivity.mutate(undefined, {
      onSuccess: () => router.replace('/(tabs)'),
    });
  }

  function handlePauseResume() {
    if (isPaused) {
      resumeActivity.mutate();
    } else {
      pauseActivity.mutate();
    }
  }

  function handleFinish() {
    completeActivity.mutate(undefined, {
      onSuccess: () => router.replace(`/post/new?activityId=${id}`),
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: !isActive,
          fullScreenGestureEnabled: !isActive,
        }}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} style={styles.keyboardArea}>
        <SafeAreaView style={styles.topSafeArea} edges={['top']}>
          <View style={styles.headerRow}>
            {!isActive ? (
              <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
                <Ionicons name="chevron-back" size={26} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={styles.backButtonPlaceholder} />
            )}
            <ThemedText type="title" style={styles.pageTitle}>
              {isActive ? t(TYPE_LABEL_KEYS[activity.activityType]) : t('activity.summary')}
            </ThemedText>
          </View>
          {dogNames.length > 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.dogNames}>
              {dogNames.join(', ')}
            </ThemedText>
          ) : null}
        </SafeAreaView>

        <View style={[styles.timerBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name={isPaused ? 'pause-circle-outline' : 'time-outline'} size={22} color={colors.primary} />
          <ThemedText type="title" style={styles.timerText}>
            {isActive ? formatTimer(elapsedSeconds) : t('time.shortMinute', { count: activity.durationMinutes ?? 0 })}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {isPaused ? t('status.paused') : isActive ? t('training.elapsed') : t('training.duration')}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">{t('common.title')}</ThemedText>
          <FormTextInput
            defaultValue={title}
            onChangeText={setTitle}
            onBlur={handleTitleBlur}
            editable={isActive}
            placeholder={t('activity.titlePlaceholder')}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">{t('training.notes')}</ThemedText>
          <FormTextInput
            defaultValue={notes}
            onChangeText={setNotes}
            onBlur={handleNotesBlur}
            editable={isActive}
            multiline
            numberOfLines={4}
            placeholder={t('activity.notesPlaceholder')}
            style={styles.notesInput}
          />
        </View>

        {!isActive && activity.status === 'COMPLETED' ? (
          <PrimaryButton
            title={t('training.shareToFeed')}
            onPress={() => router.push(`/post/new?activityId=${activity.id}`)}
            style={styles.shareButton}
          />
        ) : null}
      </KeyboardAwareScrollView>

      {isActive ? (
        <ActivityFooter
          onCancel={handleCancel}
          onPauseResume={handlePauseResume}
          onFinish={handleFinish}
          isPaused={isPaused}
          cancelLoading={cancelActivity.isPending}
          pauseResumeLoading={pauseActivity.isPending || resumeActivity.isPending}
          finishLoading={completeActivity.isPending}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  keyboardArea: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six + Spacing.four },
  topSafeArea: { marginBottom: Spacing.one },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backButton: { padding: Spacing.one, marginLeft: -Spacing.one },
  backButtonPlaceholder: { width: 26 + Spacing.one * 2, marginLeft: -Spacing.one },
  pageTitle: { fontSize: 22 },
  dogNames: { paddingHorizontal: Spacing.two + 26 + Spacing.one, marginTop: -Spacing.one },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.large,
    ...CardShadow,
  },
  timerText: { fontSize: 32, lineHeight: 36 },
  field: { gap: Spacing.one },
  notesInput: { height: 96, textAlignVertical: 'top' },
  shareButton: { marginTop: Spacing.two },
});
