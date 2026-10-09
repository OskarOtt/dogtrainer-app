import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { DogForm } from '@/components/dog-form';
import { EmptyState } from '@/components/empty-state';
import { MediaAvatarPicker } from '@/components/media-avatar-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TitleBadge } from '@/components/title-badge';
import { Spacing } from '@/constants/theme';
import { useDog, useRemoveDogMedia, useUpdateDog, useUploadDogMedia } from '@/hooks/use-dogs';
import { useDogTitles } from '@/hooks/use-titles';
import { useTheme } from '@/hooks/use-theme';
import type { DogPayload } from '@/types/dog';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = useDog(id);
  const { data: titles } = useDogTitles(id);
  const updateDog = useUpdateDog(id as string);
  const uploadMedia = useUploadDogMedia(id as string);
  const removeMedia = useRemoveDogMedia(id as string);
  const isMediaBusy = uploadMedia.isPending || removeMedia.isPending;
  const mediaErrorMessage = uploadMedia.isError
    ? getApiErrorMessage(uploadMedia.error)
    : removeMedia.isError
      ? getApiErrorMessage(removeMedia.error)
      : null;

  function handleSubmit(payload: DogPayload) {
    updateDog.mutate(payload, {
      onSuccess: () => router.back(),
    });
  }

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !dog) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <EmptyState icon="alert-circle-outline" title={t('dog.loadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('dog.editDog', { name: dog.name }) }} />

      <View style={styles.mediaSection}>
        <MediaAvatarPicker
          uri={dog.mediaUrl}
          mediaType={dog.mediaType}
          size={96}
          placeholderIcon="paw"
          allowVideo
          isBusy={isMediaBusy}
          onSelect={(asset) => uploadMedia.mutate(asset)}
        />
        {dog.mediaUrl ? (
          <PrimaryButton
            title={t('common.removePhoto')}
            variant="secondary"
            disabled={isMediaBusy}
            onPress={() => removeMedia.mutate()}
            style={styles.removeButton}
          />
        ) : null}
        {mediaErrorMessage ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {mediaErrorMessage}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.titlesSection}>
        <ThemedText type="smallBold">{t('titles.title')}</ThemedText>
        <View style={styles.titlesRow}>
          {(titles ?? []).map((title) => (
            <TitleBadge key={title.id} title={title} onPress={() => router.push(`/dog/${id}/titles/${title.id}/edit`)} />
          ))}
        </View>
        <PrimaryButton
          title={t('titles.addTitle')}
          variant="secondary"
          onPress={() => router.push(`/dog/${id}/titles/new`)}
          style={styles.addTitleButton}
        />
      </View>

      <DogForm
        initialValue={dog}
        submitLabel={t('common.saveChanges')}
        isSubmitting={updateDog.isPending}
        errorMessage={updateDog.isError ? getApiErrorMessage(updateDog.error) : null}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mediaSection: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.four },
  removeButton: { alignSelf: 'center', paddingHorizontal: Spacing.four },
  error: { textAlign: 'center', paddingHorizontal: Spacing.four },
  titlesSection: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two },
  titlesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  addTitleButton: { alignSelf: 'flex-start', paddingHorizontal: Spacing.three },
});
