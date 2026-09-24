import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useCreatePost, useCreatePostFromSession, useUploadPostMedia } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

const MAX_CONTENT_LENGTH = 2048;

export default function NewPostScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const router = useRouter();
  const colors = useTheme();
  const isFromSession = !!sessionId;

  const { data: dogs } = useDogs();
  const [content, setContent] = useState('');
  const [selectedDogId, setSelectedDogId] = useState<string | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const createPost = useCreatePost();
  const createPostFromSession = useCreatePostFromSession(sessionId ?? '');
  const uploadMedia = useUploadPostMedia();

  const isSubmitting = createPost.isPending || createPostFromSession.isPending || uploadMedia.isPending;
  const errorMessage = createPost.isError
    ? getApiErrorMessage(createPost.error)
    : createPostFromSession.isError
      ? getApiErrorMessage(createPostFromSession.error)
      : uploadMedia.isError
        ? getApiErrorMessage(uploadMedia.error)
        : null;

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('media.permissionTitle'), t('media.permissionAttachment'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) {
      return;
    }
    setSelectedAsset(result.assets[0]);
  }

  function handleSkip() {
    router.dismissTo('/(tabs)');
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    const post = isFromSession
      ? await createPostFromSession.mutateAsync({ content: trimmed || null })
      : await createPost.mutateAsync({ content: trimmed, dogId: selectedDogId ?? null });

    if (selectedAsset) {
      await uploadMedia.mutateAsync({ postId: post.id, asset: selectedAsset });
    }
    router.dismissTo('/(tabs)');
  }

  function handleSubmitPress() {
    handleSubmit().catch(() => {
      // errors are already surfaced via each mutation's isError/error state
    });
  }

  const canSubmit = isFromSession || content.trim().length > 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isFromSession ? t('posts.shareSession') : t('posts.newPost'),
          presentation: 'modal',
          headerRight: isFromSession
            ? () => (
                <Pressable onPress={handleSkip} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <KeyboardAwareScrollView contentContainerStyle={styles.scroll}>
        <FormTextInput
          defaultValue={content}
          onChangeText={setContent}
          placeholder={
            isFromSession ? t('posts.captionSession') : t('posts.captionPost')
          }
          multiline
          numberOfLines={5}
          maxLength={MAX_CONTENT_LENGTH}
          style={styles.contentInput}
        />
        <ThemedText themeColor="textSecondary" type="small" style={styles.counter}>
          {content.length}/{MAX_CONTENT_LENGTH}
        </ThemedText>

        {!isFromSession && dogs && dogs.length > 0 ? (
          <>
            <ThemedText type="smallBold">{t('posts.tagDog')}</ThemedText>
            <View style={styles.dogPicker}>
              <Pressable
                onPress={() => setSelectedDogId(undefined)}
                style={[
                  styles.dogChip,
                  {
                    backgroundColor: !selectedDogId ? colors.primary : colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}>
                <ThemedText style={{ color: !selectedDogId ? colors.onPrimary : colors.text }}>{t('common.none')}</ThemedText>
              </Pressable>
              {dogs.map((dog) => {
                const selected = dog.id === selectedDogId;
                return (
                  <Pressable
                    key={dog.id}
                    onPress={() => setSelectedDogId(dog.id)}
                    style={[
                      styles.dogChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}>
                    <ThemedText style={{ color: selected ? colors.onPrimary : colors.text }}>{dog.name}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <ThemedText type="smallBold">{t('posts.photoOptional')}</ThemedText>
        {selectedAsset ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: selectedAsset.uri }} style={styles.photoPreview} contentFit="cover" />
            <Pressable
              onPress={() => setSelectedAsset(null)}
              style={[styles.removePhotoButton, { backgroundColor: colors.background }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePickPhoto}
            style={[styles.addPhotoRow, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="image-outline" size={22} color={colors.primary} />
            <ThemedText themeColor="primary">{t('posts.addPhoto')}</ThemedText>
          </Pressable>
        )}

        {errorMessage ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {errorMessage}
          </ThemedText>
        ) : null}

        <PrimaryButton
          title={isFromSession ? t('training.shareToFeed') : t('posts.post')}
          onPress={handleSubmitPress}
          loading={isSubmitting}
          disabled={!canSubmit || isSubmitting}
          style={styles.submitButton}
        />

        {isFromSession ? (
          <PrimaryButton
            title={t('posts.dontPost')}
            variant="secondary"
            onPress={handleSkip}
            disabled={isSubmitting}
            style={styles.dontPostButton}
          />
        ) : null}
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.two },
  contentInput: { height: 120 },
  counter: { textAlign: 'right', marginTop: -Spacing.one },
  dogPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.one },
  dogChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
  },
  photoPreviewWrap: { position: 'relative' },
  photoPreview: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radii.medium },
  removePhotoButton: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { textAlign: 'center' },
  submitButton: { marginTop: Spacing.three },
  dontPostButton: { marginTop: Spacing.two },
});
