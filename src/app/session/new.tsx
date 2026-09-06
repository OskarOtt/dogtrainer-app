import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { sessionsApi } from '@/api/sessions';
import { plansApi } from '@/api/plans';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * Creates a training session, then adds pre-selected exercises before handing off to
 * the active session screen. Supports two entry points:
 *  - dogId + exerciseIds: the regular "Start Empty Training" flow (dog → pick
 *    exercises from the searchable catalog).
 *  - planId: "Start Training" picked an existing training plan; the session is
 *    created for that plan's dog and pre-filled with all of the plan's exercises.
 * This screen shows a brief loading state and never stays on the navigation stack
 * (it replaces itself with the active session once ready).
 */
export default function NewSessionScreen() {
  const { dogId, exerciseIds, planId } = useLocalSearchParams<{
    dogId?: string;
    exerciseIds?: string;
    planId?: string;
  }>();
  const router = useRouter();
  const colors = useTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || (!dogId && !planId)) {
      return;
    }
    startedRef.current = true;

    (async () => {
      try {
        let sessionDogId = dogId;
        let ids = (exerciseIds ?? '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);

        if (planId) {
          const plan = await plansApi.get(planId);
          sessionDogId = plan.dogId;
          ids = plan.exercises.map((exercise) => exercise.id);
        }

        if (!sessionDogId) {
          throw new Error('Missing dog for this training session');
        }

        const session = await sessionsApi.create(sessionDogId, {});
        for (const exerciseId of ids) {
          await sessionsApi.addExercise(session.id, { exerciseId, repetitions: 0, successfulRepetitions: 0 });
        }
        router.replace(`/session/${session.id}`);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Couldn't start this training session"));
      }
    })();
  }, [dogId, exerciseIds, planId, router]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Starting Session' }} />
      {errorMessage ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't start session" message={errorMessage} />
      ) : (
        <ThemedView style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Starting your training session…
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  message: { marginTop: Spacing.one },
});
