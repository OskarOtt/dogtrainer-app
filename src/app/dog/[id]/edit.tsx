import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DogForm } from '@/components/dog-form';
import { EmptyState } from '@/components/empty-state';
import { MediaAvatarPicker } from '@/components/media-avatar-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDog, useRemoveDogMedia, useUpdateDog, useUploadDogMedia } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import type { DogPayload } from '@/types/dog';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = useDog(id);
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
            title="Remove Photo"
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

const styles = StyleSheet.create({
  mediaSection: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.four },
  removeButton: { alignSelf: 'center', paddingHorizontal: Spacing.four },
  error: { textAlign: 'center', paddingHorizontal: Spacing.four },
});
