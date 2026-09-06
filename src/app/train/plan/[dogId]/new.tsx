import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PlanForm } from '@/components/plan-form';
import { ThemedView } from '@/components/themed-view';
import { useCreatePlan } from '@/hooks/use-plans';
import { resetPlanPickerSelection } from '@/store/plan-exercise-picker';
import type { TrainingPlanPayload } from '@/types/plan';
import { getApiErrorMessage } from '@/utils/apiError';

export default function NewPlanScreen() {
  const { dogId, date } = useLocalSearchParams<{ dogId: string; date?: string }>();
  const router = useRouter();
  const createPlan = useCreatePlan(dogId);

  function handleSubmit(payload: TrainingPlanPayload) {
    createPlan.mutate(payload, {
      onSuccess: () => {
        resetPlanPickerSelection([]);
        router.back();
      },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Add Plan', presentation: 'modal' }} />
      <PlanForm
        submitLabel="Add Plan"
        isSubmitting={createPlan.isPending}
        errorMessage={createPlan.isError ? getApiErrorMessage(createPlan.error) : null}
        onSubmit={handleSubmit}
        pickerHref={`/train/plan-picker?returnTo=${encodeURIComponent(`/train/plan/${dogId}/new`)}`}
        initialStartDate={date}
      />
    </ThemedView>
  );
}
