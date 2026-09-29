import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDog } from '@/hooks/use-dogs';

/**
 * Shown right after a new title is saved for a dog, before returning to the dog's
 * profile. Lets the user immediately share the achievement as a post, or skip.
 */
export default function TitleCongratsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const router = useRouter();
  const { data: dog } = useDog(id);

  const dogName = dog?.name ?? '';

  function handlePost() {
    router.push({
      pathname: '/post/new',
      params: { dogId: id, initialContent: t('titles.congratsPostCaption', { title, name: dogName }) },
    });
  }

  function handleSkip() {
    router.dismissTo(`/dog/${id}`);
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('titles.congratsHeader'), presentation: 'modal', headerBackVisible: false }} />
      <View style={styles.content}>
        <EmptyState
          icon="trophy-outline"
          title={t('titles.congratsTitle', { title })}
          message={dogName ? t('titles.congratsMessage', { name: dogName }) : undefined}>
          <PrimaryButton title={t('titles.congratsPost')} onPress={handlePost} style={styles.button} />
          <PrimaryButton title={t('titles.congratsSkip')} variant="secondary" onPress={handleSkip} style={styles.button} />
        </EmptyState>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, transform: [{ translateY: -30 }] },
  button: { marginTop: Spacing.two, alignSelf: 'stretch' },
});
