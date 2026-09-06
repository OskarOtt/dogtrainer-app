import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PlanForm } from '@/components/plan-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDeletePlan, usePlan, useUpdatePlan } from '@/hooks/use-plans';
import { useTheme } from '@/hooks/use-theme';
import { resetPlanPickerSelection } from '@/store/plan-exercise-picker';
import type { TrainingPlanPayload } from '@/types/plan';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditPlanScreen() {
  const { dogId, planId } = useLocalSearchParams<{ dogId: string; planId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: plan, isLoading, isError, error } = usePlan(planId);
  const updatePlan = useUpdatePlan(planId, dogId);
  const deletePlan = useDeletePlan(dogId);

  function handleSubmit(payload: TrainingPlanPayload) {
    updatePlan.mutate(payload, {
      onSuccess: () => {
        resetPlanPickerSelection([]);
        router.back();
      },
    });
  }

  function handleDelete() {
    deletePlan.mutate(planId, { onSuccess: () => router.back() });
  }

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !plan) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this plan" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Edit Plan' }} />
      <PlanForm
        initialValue={plan}
        submitLabel="Save Changes"
        isSubmitting={updatePlan.isPending}
        errorMessage={updatePlan.isError ? getApiErrorMessage(updatePlan.error) : null}
        onSubmit={handleSubmit}
        pickerHref={`/train/plan-picker?returnTo=${encodeURIComponent(`/train/plan/${dogId}/${planId}/edit`)}`}
      />
      <ConfirmDialog
        title="Delete Plan"
        variant="danger"
        loading={deletePlan.isPending}
        style={{ marginHorizontal: Spacing.four, marginBottom: Spacing.four }}
        dialogTitle="Delete plan"
        dialogMessage="Remove this training plan?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </ThemedView>
  );
}
