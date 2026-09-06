import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { GoalForm } from '@/components/goal-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDeleteGoal, useGoal, useUpdateGoal } from '@/hooks/use-goals';
import { useTheme } from '@/hooks/use-theme';
import type { GoalPayload } from '@/types/goal';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditGoalScreen() {
  const { id, goalId } = useLocalSearchParams<{ id: string; goalId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: goal, isLoading, isError, error } = useGoal(goalId);
  const updateGoal = useUpdateGoal(goalId, id);
  const deleteGoal = useDeleteGoal(id);

  function handleSubmit(payload: GoalPayload) {
    updateGoal.mutate(payload, {
      onSuccess: () => router.back(),
    });
  }

  function handleDelete() {
    deleteGoal.mutate(goalId, { onSuccess: () => router.back() });
  }

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !goal) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this goal" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Edit Goal' }} />
      <GoalForm
        initialValue={goal}
        submitLabel="Save Changes"
        isSubmitting={updateGoal.isPending}
        errorMessage={updateGoal.isError ? getApiErrorMessage(updateGoal.error) : null}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        title="Delete Goal"
        variant="danger"
        loading={deleteGoal.isPending}
        style={{ marginHorizontal: Spacing.four, marginBottom: Spacing.four }}
        dialogTitle="Delete goal"
        dialogMessage="Remove this goal?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </ThemedView>
  );
}
