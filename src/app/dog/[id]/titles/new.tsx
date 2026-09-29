import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { t } from '@/i18n';
import { TitleForm } from '@/components/title-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateTitle } from '@/hooks/use-titles';
import type { DogTitlePayload } from '@/types/title';
import { getApiErrorMessage } from '@/utils/apiError';

export default function NewTitleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createTitle = useCreateTitle(id);

  function handleSubmit(payload: DogTitlePayload) {
    createTitle.mutate(payload, {
      onSuccess: (createdTitle) =>
        router.replace({ pathname: '/dog/[id]/titles/congrats', params: { id, title: createdTitle.title } }),
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('titles.addTitle'), presentation: 'modal' }} />
      <TitleForm
        submitLabel={t('titles.addTitle')}
        isSubmitting={createTitle.isPending}
        errorMessage={createTitle.isError ? getApiErrorMessage(createTitle.error) : null}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}
