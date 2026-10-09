import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * Dog picker for the Train tab's "log a past entry" shortcut, parameterized by `type`
 * (session|activity). Auto-selects (and skips itself) when the user has only one dog,
 * mirroring `train/pick-dog.tsx` / `activity/pick-dog.tsx`. Training sessions stay single-dog
 * (tap a dog to go straight to the form); physical activities support multiple dogs, so that
 * branch becomes a checkbox multi-select with a Continue button, mirroring `activity/pick-dog.tsx`.
 */
export default function PickDogForManualEntryScreen() {
  const { type } = useLocalSearchParams<{ type: 'session' | 'activity' }>();
  const isMultiSelect = type === 'activity';
  const { data: dogs, isLoading, isError, error } = useDogs();
  const router = useRouter();
  const colors = useTheme();
  const redirected = useRef(false);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);

  function destinationForSingle(dogId: string) {
    return `/train/log/${dogId}/${type}`;
  }

  function destinationForMulti(dogIds: string[]) {
    return `/train/log/activity?dogIds=${dogIds.join(',')}`;
  }

  useEffect(() => {
    if (!redirected.current && dogs && dogs.length === 1) {
      redirected.current = true;
      router.replace((isMultiSelect ? destinationForMulti([dogs[0].id]) : destinationForSingle(dogs[0].id)) as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogs, router, type]);

  function toggleDog(id: string) {
    setSelectedDogIds((current) => (current.includes(id) ? current.filter((dogId) => dogId !== id) : [...current, id]));
  }

  function handleContinue() {
    router.push(destinationForMulti(selectedDogIds) as never);
  }

  if (isLoading || (dogs && dogs.length === 1)) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center} edges={['top']}>
          <ActivityIndicator color={colors.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState icon="alert-circle-outline" title={t('dog.loadDogsError')} message={getApiErrorMessage(error)}>
            <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.replace('/(tabs)')} />
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!dogs || dogs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState icon="paw-outline" title={t('dog.noDogs')} message={t('dog.noDogsTraining')}>
            <PrimaryButton title={t('dog.addADog')} onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          {isMultiSelect ? t('screens.chooseDogs') : t('screens.chooseDog')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {t('screens.dogForManualEntry')}
        </ThemedText>
        <FlatList
          data={dogs}
          keyExtractor={(dog) => dog.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            isMultiSelect ? (
              <DogCard dog={item} selected={selectedDogIds.includes(item.id)} onPress={() => toggleDog(item.id)} />
            ) : (
              <DogCard dog={item} onPress={() => router.push(destinationForSingle(item.id) as never)} />
            )
          }
        />
        {isMultiSelect ? (
          <PrimaryButton
            title={t('common.continue')}
            onPress={handleContinue}
            disabled={selectedDogIds.length === 0}
            style={styles.continueButton}
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  subtitle: { paddingHorizontal: Spacing.four, marginBottom: Spacing.three },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
  continueButton: { marginHorizontal: Spacing.four, marginBottom: Spacing.three },
});
