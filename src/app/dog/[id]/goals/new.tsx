import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { GoalForm } from '@/components/goal-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateGoal } from '@/hooks/use-goals';
import type { GoalPayload } from '@/types/goal';
import { getApiErrorMessage } from '@/utils/apiError';

export default function NewGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createGoal = useCreateGoal(id);

  function handleSubmit(payload: GoalPayload) {
    createGoal.mutate(payload, {
      onSuccess: () => router.back(),
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Add Goal', presentation: 'modal' }} />
      <GoalForm
        submitLabel="Add Goal"
        isSubmitting={createGoal.isPending}
        errorMessage={createGoal.isError ? getApiErrorMessage(createGoal.error) : null}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}
