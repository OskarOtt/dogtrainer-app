import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import LexicalNotesEditor from '@/components/rich-text/lexical-notes-editor.dom';
import { SessionExerciseCard } from '@/components/session-exercise-card';
import { SessionFooter } from '@/components/session-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePlan, useUpdatePlan } from '@/hooks/use-plans';
import { useExercise } from '@/hooks/use-training-catalog';
import {
  useCancelSession,
  useCompleteSession,
  useRemoveSessionExercise,
  useSession,
  useUpdateSession,
  useUpdateSessionExercise,
} from '@/hooks/use-sessions';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const { id, planId } = useLocalSearchParams<{ id: string; planId?: string }>();
  const router = useRouter();
  const colors = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { data: session, isLoading, isError, error } = useSession(id);

  const updateSession = useUpdateSession(id ?? '');
  const completeSession = useCompleteSession(id ?? '');
  const cancelSession = useCancelSession(id ?? '');
  const updateSessionExercise = useUpdateSessionExercise(id ?? '');
  const removeSessionExercise = useRemoveSessionExercise(id ?? '');

  // If this session was started from a training plan, finishing it marks that
  // plan COMPLETED. The plan's dogId is needed for the update hook's cache keys.
  const { data: plan } = usePlan(planId);
  const updatePlan = useUpdatePlan(planId ?? '', plan?.dogId ?? '');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<'exercises' | 'notes'>('exercises');
  // Bumped to force-remount the notes editor after its WebView's render/content process dies
  // (see handleNotesEditorProcessGone below) — otherwise the same crashed WebView instance stays mounted.
  const [notesEditorGeneration, setNotesEditorGeneration] = useState(0);

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

  // Memoized so the DOM notes editor (which sends function props over an async bridge and
  // re-renders its whole WebView tree whenever a top-level function prop reference changes)
  // doesn't get a fresh callback identity on every unrelated parent re-render.
  const handleUpdateExerciseNotes = useCallback(
    (sessionExercise: SessionExercise, notes: string | null) => {
      if (notes === (sessionExercise.notes ?? null)) {
        return;
      }
      updateSessionExercise.mutate(
        { exerciseId: sessionExercise.id, payload: { notes } },
        { onError: (err) => console.error('Failed to save exercise notes', err) }
      );
    },
    [updateSessionExercise]
  );

  // Only called on blur (not on every debounced keystroke) to avoid mutating the session —
  // and re-rendering the DOM editor's props — while the user is still typing.
  const handleNotesBlur = useCallback(
    async (html: string) => {
      if (html !== (session?.notes ?? '')) {
        updateSession.mutate(
          { notes: html.trim() || null },
          { onError: (err) => console.error('Failed to save session notes', err) }
        );
      }
    },
    [session?.notes, updateSession]
  );

  // Android's WebView kills the *entire app process* by default if a render-process crash isn't
  // handled (see https://developer.android.com/reference/android/webkit/WebViewClient#onRenderProcessGone) —
  // this is what was causing the app to silently exit back to the Feed tab while typing notes, with
  // no JS error to catch (it's a native process kill, not a JS exception). Handling the event here
  // (and its iOS equivalent) stops Android from killing the app, and instead just reloads the editor.
  const handleNotesEditorProcessGone = useCallback(() => {
    console.error('Notes editor WebView process was killed (OOM or crash) — reloading it');
    setNotesEditorGeneration((generation) => generation + 1);
    Alert.alert(
      'Notes editor reloaded',
      'The notes editor ran out of memory and had to reload. Any unsaved changes since your last pause may be lost — please check your notes.'
    );
  }, []);

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
        <EmptyState icon="alert-circle-outline" title="Couldn't load this session" message={getApiErrorMessage(error)}>
          <PrimaryButton title="Exit" variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  const isActive = session.status === 'IN_PROGRESS';

  function handleFinish() {
    completeSession.mutate(undefined, {
      onSuccess: () => {
        if (planId && plan) {
          updatePlan.mutate({
            name: plan.name,
            description: plan.description,
            startDate: plan.startDate,
            endDate: plan.endDate,
            status: 'COMPLETED',
            exerciseIds: plan.exercises.map((exercise) => exercise.id),
          });
        }
        router.replace(`/post/new?sessionId=${id}`);
      },
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
                onPress={() =>
                  router.push(
                    planId
                      ? `/train/${session.dogId}?sessionId=${session.id}&planId=${planId}`
                      : `/train/${session.dogId}?sessionId=${session.id}`
                  )
                }
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
        <LexicalNotesEditor
          key={`${session.id}-${notesEditorGeneration}`}
          initialContent={session.notes}
          editable={isActive}
          isDark={isDark}
          colors={{ border: colors.border, primary: colors.primary, text: colors.text, textSecondary: colors.textSecondary, background: colors.backgroundElement }}
          onBlurHtml={isActive ? handleNotesBlur : undefined}
          // The WebView's contentEditable often never fires a native `blur` when the user taps
          // straight from Notes to the native "Finish"/"Cancel" buttons or switches tabs (the pane
          // is just hidden via display:none, not unmounted) — so blur-only saving can silently drop
          // the last-typed notes. This debounced change handler (already built into the editor) acts
          // as a safety net so notes are persisted while typing too, not only on an explicit blur.
          onChangeHtml={isActive ? handleNotesBlur : undefined}
          style={styles.notesEditor}
          dom={{
            onRenderProcessGone: handleNotesEditorProcessGone,
            onContentProcessDidTerminate: handleNotesEditorProcessGone,
          }}
        />
      </View>

      {isActive ? (
        <SessionFooter
          onCancel={handleCancel}
          onFinish={handleFinish}
          cancelLoading={cancelSession.isPending}
          finishLoading={completeSession.isPending}
        />
      ) : session.status === 'COMPLETED' ? (
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.footer,
            styles.footerCentered,
            { backgroundColor: colors.background, borderTopColor: colors.border },
          ]}>
          <PrimaryButton
            title="Share to Feed"
            onPress={() => router.push(`/post/new?sessionId=${session.id}`)}
            style={styles.shareButton}
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
  list: {
    padding: Spacing.four,
    // Extra clearance under the last item so it isn't hidden behind the
    // hovering iOS footer (SessionFooter.ios), which floats over the content
    // instead of taking up its own layout row.
    paddingBottom: Platform.OS === 'ios' ? Spacing.six + Spacing.four : Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  notesTab: { flex: 1 },
  notesEditor: { flex: 1 },
  addButton: { marginBottom: Spacing.one },
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.one,
  },
  footerCentered: { justifyContent: 'center', alignItems: 'center' },
  shareButton: { width: '70%', height: 40 },
});
