import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { MediaAvatarPicker } from '@/components/media-avatar-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingSessionCard } from '@/components/training-session-card';
import { Radii, Spacing } from '@/constants/theme';
import { useDeleteDog, useDog, useRemoveDogMedia, useUploadDogMedia } from '@/hooks/use-dogs';
import { useDogSessions } from '@/hooks/use-sessions';
import { useDogStatistics } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatAge, formatDuration } from '@/utils/date';
import { formatPercent } from '@/utils/number';

export default function DogDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = useDog(id);
  const { data: sessions } = useDogSessions(id);
  const { data: statistics } = useDogStatistics(id);
  const deleteDog = useDeleteDog();
  const uploadMedia = useUploadDogMedia(id as string);
  const removeMedia = useRemoveDogMedia(id as string);
  const isMediaBusy = uploadMedia.isPending || removeMedia.isPending;
  const mediaErrorMessage = uploadMedia.isError
    ? getApiErrorMessage(uploadMedia.error)
    : removeMedia.isError
      ? getApiErrorMessage(removeMedia.error)
      : null;

  function handleDelete() {
    if (!dog) {
      return;
    }
    deleteDog.mutate(dog.id, {
      onSuccess: () => router.replace('/(tabs)/dogs'),
    });
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !dog) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title={t('dog.loadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </EmptyState>
      </ThemedView>
    );
  }

  const age = formatAge(dog.birthDate);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: dog.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <MediaAvatarPicker
          uri={dog.mediaUrl}
          mediaType={dog.mediaType}
          size={96}
          placeholderIcon="paw"
          allowVideo
          isBusy={isMediaBusy}
          onSelect={(asset) => uploadMedia.mutate(asset)}
        />
        {mediaErrorMessage ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {mediaErrorMessage}
          </ThemedText>
        ) : null}
        {dog.mediaUrl ? (
          <PrimaryButton
            title={t('common.removePhoto')}
            variant="secondary"
            disabled={isMediaBusy}
            onPress={() => removeMedia.mutate()}
            style={styles.removeButton}
          />
        ) : null}

        <ThemedText type="title" style={styles.name}>
          {dog.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {[dog.breed, age, dog.sex ? t(dog.sex === 'MALE' ? 'dog.male' : 'dog.female') : null]
            .filter(Boolean)
            .join(' · ') || t('common.noDetails')}
        </ThemedText>

        {statistics ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('dog.statistics')}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              {t('dog.sessionsCompleted', { count: statistics.completedSessions })} ·{' '}
              {t('dog.totalDuration', { duration: formatDuration(statistics.totalTrainingMinutes) })} ·{' '}
              {t('dog.streak', { count: statistics.currentStreakWeeks })} ·{' '}
              {t('dog.averageSuccess', { rate: formatPercent(statistics.averageSuccessRate) })}
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('dog.history')}
          </ThemedText>
          {!sessions || sessions.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              {t('dog.noSessions')}
            </ThemedText>
          ) : (
            <View style={styles.sessionsList}>
              {sessions.slice(0, 5).map((session) => (
                <TrainingSessionCard
                  key={session.id}
                  session={session}
                  onPress={() => router.push(`/session/${session.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <PrimaryButton
          title={t('dog.startTraining')}
          onPress={() => router.push(`/train/${dog.id}`)}
          style={styles.button}
        />

        <PrimaryButton
          title={t('dog.viewProgress')}
          variant="secondary"
          onPress={() => router.push(`/progress/${dog.id}`)}
          style={styles.button}
        />

        <PrimaryButton
          title={t('dog.edit')}
          variant="secondary"
          onPress={() => router.push(`/dog/${dog.id}/edit`)}
          style={styles.button}
        />
        <ConfirmDialog
          title={t('dog.deleteDog')}
          variant="danger"
          loading={deleteDog.isPending}
          style={styles.button}
          dialogTitle={t('dog.deleteTitle')}
          dialogMessage={t('dog.deleteMessage', { name: dog.name })}
          confirmLabel={t('common.delete')}
          destructive
          onConfirm={handleDelete}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  removeButton: { paddingHorizontal: Spacing.four },
  error: { textAlign: 'center', paddingHorizontal: Spacing.four },
  name: { fontSize: 28, marginTop: Spacing.two },
  subtitle: { marginBottom: Spacing.three },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  sectionTitle: { fontSize: 18 },
  sessionsList: { gap: Spacing.two },
  button: { alignSelf: 'stretch', marginTop: Spacing.two },
});
