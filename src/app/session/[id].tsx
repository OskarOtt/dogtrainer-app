import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SessionExerciseCard } from '@/components/session-exercise-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
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
  onIncrementRepetitions,
  onIncrementSuccessful,
}: {
  sessionExercise: SessionExercise;
  disabled: boolean;
  onRemove: () => void;
  onIncrementRepetitions: () => void;
  onIncrementSuccessful: () => void;
}) {
  const { data: exercise } = useExercise(sessionExercise.exerciseId);
  return (
    <SessionExerciseCard
      sessionExercise={sessionExercise}
      exerciseName={exercise?.name ?? 'Exercise'}
      disabled={disabled}
      onRemove={onRemove}
      onIncrementRepetitions={onIncrementRepetitions}
      onIncrementSuccessful={onIncrementSuccessful}
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

  const [notes, setNotes] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (session) {
      setNotes(session.notes ?? '');
    }
  }, [session?.id, session?.notes]);

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
  const dogId = session.dogId;
  const sessionNotes = session.notes;

  function handleFinish() {
    Alert.alert('Finish session', 'Mark this training session as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: () => {
          completeSession.mutate(undefined, {
            onSuccess: () => router.replace(`/train/${dogId}`),
          });
        },
      },
    ]);
  }

  function handleCancel() {
    Alert.alert('Cancel session', 'Discard this training session? This cannot be undone.', [
      { text: 'Keep Training', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          cancelSession.mutate(undefined, {
            onSuccess: () => router.replace(`/train/${dogId}`),
          });
        },
      },
    ]);
  }

  function handleRemoveExercise(sessionExerciseId: string) {
    removeSessionExercise.mutate(sessionExerciseId);
  }

  function handleIncrementRepetitions(sessionExercise: SessionExercise) {
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: { repetitions: sessionExercise.repetitions + 1 },
    });
  }

  function handleIncrementSuccessful(sessionExercise: SessionExercise) {
    updateSessionExercise.mutate({
      exerciseId: sessionExercise.id,
      payload: {
        repetitions: sessionExercise.repetitions + 1,
        successfulRepetitions: sessionExercise.successfulRepetitions + 1,
      },
    });
  }

  function handleNotesBlur() {
    if (notes !== (sessionNotes ?? '')) {
      updateSession.mutate({ notes: notes.trim() || null });
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isActive ? 'Training Session' : 'Session Summary' }} />

      <View style={[styles.timerBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Ionicons name="time-outline" size={22} color={colors.primary} />
        <ThemedText type="title" style={styles.timerText}>
          {isActive ? formatTimer(elapsedSeconds) : `${session.durationMinutes ?? 0}m`}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{isActive ? 'Elapsed' : 'Duration'}</ThemedText>
      </View>

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
            onIncrementRepetitions={() => handleIncrementRepetitions(item)}
            onIncrementSuccessful={() => handleIncrementSuccessful(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="barbell-outline"
            title="No exercises yet"
            message={isActive ? 'Add an exercise to start recording reps.' : 'No exercises were recorded.'}
          />
        }
        ListFooterComponent={
          <View style={styles.notesSection}>
            <ThemedText type="smallBold">Notes</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              onBlur={handleNotesBlur}
              editable={isActive}
              placeholder="How did it go?"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[
                styles.notesInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement },
              ]}
            />
          </View>
        }
      />

      {isActive ? (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <PrimaryButton title="Finish Session" onPress={handleFinish} loading={completeSession.isPending} />
          <PrimaryButton
            title="Cancel Session"
            variant="danger"
            onPress={handleCancel}
            loading={cancelSession.isPending}
            style={styles.cancelButton}
          />
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  timerText: { fontSize: 32, lineHeight: 36 },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  addButton: { marginBottom: Spacing.one },
  notesSection: { gap: Spacing.two, marginTop: Spacing.two },
  notesInput: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  cancelButton: { marginTop: 0 },
});
