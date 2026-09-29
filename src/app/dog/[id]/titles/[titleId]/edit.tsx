import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { t } from '@/i18n';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { TitleForm } from '@/components/title-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDeleteTitle, useDogTitles, useUpdateTitle } from '@/hooks/use-titles';
import { useTheme } from '@/hooks/use-theme';
import type { DogTitlePayload } from '@/types/title';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditTitleScreen() {
  const { id, titleId } = useLocalSearchParams<{ id: string; titleId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: titles, isLoading, isError, error } = useDogTitles(id);
  const title = titles?.find((item) => item.id === titleId);
  const updateTitle = useUpdateTitle(titleId, id);
  const deleteTitle = useDeleteTitle(id);

  function handleSubmit(payload: DogTitlePayload) {
    updateTitle.mutate(payload, {
      onSuccess: () => router.back(),
    });
  }

  function handleDelete() {
    deleteTitle.mutate(titleId, { onSuccess: () => router.back() });
  }

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !title) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title={t('titles.loadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.back()} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('titles.editTitle'), presentation: 'modal' }} />
      <TitleForm
        initialValue={title}
        submitLabel={t('common.saveChanges')}
        isSubmitting={updateTitle.isPending}
        errorMessage={updateTitle.isError ? getApiErrorMessage(updateTitle.error) : null}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        title={t('titles.deleteTitle')}
        variant="danger"
        loading={deleteTitle.isPending}
        style={{ marginHorizontal: Spacing.four, marginBottom: Spacing.four }}
        dialogTitle={t('titles.deleteTitle')}
        dialogMessage={t('titles.deleteMessage')}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
      />
    </ThemedView>
  );
}
