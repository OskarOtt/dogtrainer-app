import { Stack, useRouter } from 'expo-router';

import { DogForm } from '@/components/dog-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateDog } from '@/hooks/use-dogs';
import type { DogPayload } from '@/types/dog';
import { getApiErrorMessage } from '@/utils/apiError';

export default function NewDogScreen() {
  const router = useRouter();
  const createDog = useCreateDog();

  function handleSubmit(payload: DogPayload) {
    createDog.mutate(payload, {
      onSuccess: (dog) => {
        router.replace(`/dog/${dog.id}`);
      },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Add Dog', presentation: 'modal' }} />
      <DogForm
        submitLabel="Add Dog"
        isSubmitting={createDog.isPending}
        errorMessage={createDog.isError ? getApiErrorMessage(createDog.error) : null}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}
