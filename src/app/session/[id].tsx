import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { TenTapNotesEditor } from '@/components/rich-text/tentap-notes-editor';
import { SessionExerciseCard } from '@/components/session-exercise-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useExercise } from '@/hooks/use-training-catalog';
import {
  useCancelSession,
  useCompleteSession,
  useRemoveSessionExercise,
  useSession,
  useUpdateSession,
  useUpdateSessionExercise,
} from '@/hooks/use-sessions';
import { useTheme } from '@/hooks/use-theme';
import type { SessionExercise } from '@/types/session';
import { formatTimer } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

/** Resolves and displays a single session exercise; owns its own exercise-name lookup. */
function SessionExerciseRow({
  sessionExercise,
  disabled,
  onRemove,
  onIncrementSuccess,
  onDecrementSuccess,
  onIncrementFail,
  onDecrementFail,
  onNotesBlur,
}: {
  sessionExercise: SessionExercise;
  disabled: boolean;
  onRemove: () => void;
  onIncrementSuccess: () => void;
  onDecrementSuccess: () => void;
  onIncrementFail: () => void;
  onDecrementFail: () => void;
  onNotesBlur?: (notes: string | null) => void;
}) {
  const { data: exercise } = useExercise(sessionExercise.exerciseId);
  return (
    <SessionExerciseCard
      sessionExercise={sessionExercise}
      exerciseName={exercise?.name ?? 'Exercise'}
      disabled={disabled}
      onRemove={onRemove}
      onIncrementSuccess={onIncrementSuccess}
      onDecrementSuccess={onDecrementSuccess}
      onIncrementFail={onIncrementFail}
      onDecrementFail={onDecrementFail}
      onNotesBlur={onNotesBlur}
    />
  );
}

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: session, isLoading, isError, error } = useSession(id);

  const updateSession = useUpdateSession(id ?? '');
  const completeSession = useCompleteSession(id ?? '');
  const cancelSession = useCancelSession(id ?? '');
  const updateSessionExercise = useUpdateSessionExercise(id ?? '');
  const removeSessionExercise = useRemoveSessionExercise(id ?? '');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<'exercises' | 'notes'>('exercises');

  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS') {
      return;
    }
    const startedAt = new Date(session.startedAt).getTime();
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt, session?.status]);

  // Prevent leaving an in-progress session via the Android hardware back button —
  // Finish/Cancel are the only supported exits while training is active.
  useEffect(() => {
    if (Platform.OS !== 'android' || !session || session.status !== 'IN_PROGRESS') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [session?.status]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !session) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this session" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  const isActive = session.status === 'IN_PROGRESS';
  const sessionNotes = session.notes;

  function handleFinish() {
    completeSession.mutate(undefined, {
      onSuccess: () => router.replace('/(tabs)'),
    });
  }

  function handleCancel() {
    cancelSession.mutate(undefined, {
      onSuccess: () => router.replace('/(tabs)'),
    });
  }

  function handleRemoveExercise(sessionExerciseId: string) {
    removeSessionExercise.mutate(sessionExerciseId);
  }

  function handleIncrementSuccess(sessionExercise: SessionExercise) {
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: {
        repetitions: sessionExercise.repetitions + 1,
        successfulRepetitions: sessionExercise.successfulRepetitions + 1,
      },
    });
  }

  function handleDecrementSuccess(sessionExercise: SessionExercise) {
    if (sessionExercise.successfulRepetitions <= 0) {
      return;
    }
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: {
        repetitions: sessionExercise.repetitions - 1,
        successfulRepetitions: sessionExercise.successfulRepetitions - 1,
      },
    });
  }

  function handleIncrementFail(sessionExercise: SessionExercise) {
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: { repetitions: sessionExercise.repetitions + 1 },
    });
  }

  function handleDecrementFail(sessionExercise: SessionExercise) {
    const fail = sessionExercise.repetitions - sessionExercise.successfulRepetitions;
    if (fail <= 0) {
      return;
    }
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: { repetitions: sessionExercise.repetitions - 1 },
    });
  }

  function handleUpdateExerciseNotes(sessionExercise: SessionExercise, notes: string | null) {
    if (notes === (sessionExercise.notes ?? null)) {
      return;
    }
    updateSessionExercise.mutate({ exerciseId: sessionExercise.id, payload: { notes } });
  }

  function handleNotesBlur(html: string) {
    if (html !== (sessionNotes ?? '')) {
      updateSession.mutate({ notes: html.trim() || null });
    }
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
            {isActive ? 'Training Session' : 'Session Summary'}
          </ThemedText>
        </View>
      </SafeAreaView>

      <View style={[styles.timerBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Ionicons name="time-outline" size={22} color={colors.primary} />
        <ThemedText type="title" style={styles.timerText}>
          {isActive ? formatTimer(elapsedSeconds) : `${session.durationMinutes ?? 0}m`}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{isActive ? 'Elapsed' : 'Duration'}</ThemedText>
      </View>

      <View style={styles.tabsHost}>
        <SegmentedControl
          values={['Exercises', 'Notes']}
          selectedIndex={activeTab === 'exercises' ? 0 : 1}
          onValueChange={(value) => setActiveTab(value === 'Notes' ? 'notes' : 'exercises')}
          style={styles.tabs}
        />
      </View>

      <View style={activeTab === 'exercises' ? styles.tabPane : styles.tabPaneHidden}>
        <FlatList
          data={session.exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            isActive ? (
              <PrimaryButton
                title="Add Exercise"
                variant="secondary"
                onPress={() => router.push(`/train/${session.dogId}?sessionId=${session.id}`)}
                style={styles.addButton}
              />
            ) : undefined
          }
          renderItem={({ item }) => (
            <SessionExerciseRow
              sessionExercise={item}
              disabled={!isActive}
              onRemove={() => handleRemoveExercise(item.id)}
              onIncrementSuccess={() => handleIncrementSuccess(item)}
              onDecrementSuccess={() => handleDecrementSuccess(item)}
              onIncrementFail={() => handleIncrementFail(item)}
              onDecrementFail={() => handleDecrementFail(item)}
              onNotesBlur={isActive ? (notes) => handleUpdateExerciseNotes(item, notes) : undefined}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="barbell-outline"
              title="No exercises yet"
              message={isActive ? 'Add an exercise to start recording reps.' : 'No exercises were recorded.'}
            />
          }
        />
      </View>

      <View style={[activeTab === 'notes' ? styles.tabPane : styles.tabPaneHidden, styles.list, styles.notesTab]}>
        <TenTapNotesEditor
          key={session.id}
          initialContent={session.notes}
          editable={isActive}
          onChangeHtml={isActive ? handleNotesBlur : undefined}
          onBlurHtml={isActive ? handleNotesBlur : undefined}
          style={styles.notesEditor}
        />
      </View>

      {isActive ? (
        <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <ConfirmDialog
            title="Finish"
            loading={completeSession.isPending}
            style={styles.footerButton}
            dialogTitle="Finish session"
            dialogMessage="Mark this training session as complete?"
            confirmLabel="Finish"
            onConfirm={handleFinish}
          />
          <ConfirmDialog
            title="Cancel"
            variant="danger"
            loading={cancelSession.isPending}
            style={styles.footerButton}
            dialogTitle="Cancel session"
            dialogMessage="Discard this training session? This cannot be undone."
            confirmLabel="Discard"
            cancelLabel="Keep Training"
            destructive
            onConfirm={handleCancel}
          />
        </SafeAreaView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topSafeArea: { paddingHorizontal: Spacing.four },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.two, gap: Spacing.two },
  backButton: { padding: Spacing.one, marginLeft: -Spacing.one },
  backButtonPlaceholder: { width: 26 + Spacing.one * 2, marginLeft: -Spacing.one },
  pageTitle: { fontSize: 22 },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  timerText: { fontSize: 32, lineHeight: 36 },
  tabsHost: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  tabs: { height: 36 },
  tabPane: { flex: 1 },
  tabPaneHidden: { display: 'none' },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  notesTab: { flex: 1 },
  notesEditor: { flex: 1 },
  addButton: { marginBottom: Spacing.one },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 20,
    borderTopWidth: 1,
    height: 80,
  },
  footerButton: { flex: 1, width: 100, marginHorizontal: 5 },
});
