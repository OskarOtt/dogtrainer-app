import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { DogForm } from '@/components/dog-form';
import { EmptyState } from '@/components/empty-state';
import { ThemedView } from '@/components/themed-view';
import { useDog, useUpdateDog } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import type { DogPayload } from '@/types/dog';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = useDog(id);
  const updateDog = useUpdateDog(id as string);

  function handleSubmit(payload: DogPayload) {
    updateDog.mutate(payload, {
      onSuccess: () => router.back(),
    });
  }

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !dog) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this dog" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: `Edit ${dog.name}` }} />
      <DogForm
        initialValue={dog}
        submitLabel="Save Changes"
        isSubmitting={updateDog.isPending}
        errorMessage={updateDog.isError ? getApiErrorMessage(updateDog.error) : null}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}
