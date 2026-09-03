import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
 * Dog picker for the "Start Empty Training" flow. Auto-selects (and skips itself)
 * when the user has only one dog, otherwise lets them choose which dog to train.
 */
export default function PickDogScreen() {
  const { data: dogs, isLoading, isError, error } = useDogs();
  const router = useRouter();
  const colors = useTheme();
  const redirected = useRef(false);

  useEffect(() => {
    if (!redirected.current && dogs && dogs.length === 1) {
      redirected.current = true;
      router.replace(`/train/${dogs[0].id}`);
    }
  }, [dogs, router]);

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
          <EmptyState icon="alert-circle-outline" title="Couldn't load dogs" message={getApiErrorMessage(error)} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!dogs || dogs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState icon="paw-outline" title="No dogs yet" message="Add a dog before starting a training session.">
            <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Choose a Dog
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Who are you training today?
        </ThemedText>
        <FlatList
          data={dogs}
          keyExtractor={(dog) => dog.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <DogCard dog={item} onPress={() => router.push(`/train/${item.id}`)} />}
        />
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
});
