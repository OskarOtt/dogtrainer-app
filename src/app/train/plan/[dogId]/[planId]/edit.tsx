import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { t } from '@/i18n';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PlanForm } from '@/components/plan-form';
import { PrimaryButton } from '@/components/primary-button';
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
        <EmptyState icon="alert-circle-outline" title={t('plans.loadOneError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('plans.editPlan') }} />
      <PlanForm
        initialValue={plan}
        submitLabel={t('common.saveChanges')}
        isSubmitting={updatePlan.isPending}
        errorMessage={updatePlan.isError ? getApiErrorMessage(updatePlan.error) : null}
        onSubmit={handleSubmit}
        pickerHref={`/train/plan-picker?returnTo=${encodeURIComponent(`/train/plan/${dogId}/${planId}/edit`)}`}
      />
      <ConfirmDialog
        title={t('plans.deletePlan')}
        variant="danger"
        loading={deletePlan.isPending}
        style={{ marginHorizontal: Spacing.four, marginBottom: Spacing.four }}
        dialogTitle={t('plans.deleteTitle')}
        dialogMessage={t('plans.deleteMessage')}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
      />
    </ThemedView>
  );
}
