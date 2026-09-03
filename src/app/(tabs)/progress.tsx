import { useRouter } from 'expo-router';
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

export default function ProgressScreen() {
  const { data: dogs, isLoading, isError, error } = useDogs();
  const router = useRouter();
  const colors = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Progress
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Choose a dog to see training progress.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load dogs" message={getApiErrorMessage(error)} />
        ) : !dogs || dogs.length === 0 ? (
          <EmptyState icon="paw-outline" title="No dogs yet" message="Add a dog to start tracking progress.">
            <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
          </EmptyState>
        ) : (
          <FlatList
            data={dogs}
            keyExtractor={(dog) => dog.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <DogCard dog={item} onPress={() => router.push(`/progress/${item.id}`)} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  subtitle: { paddingHorizontal: Spacing.four, marginBottom: Spacing.three },
  loading: { marginTop: Spacing.six },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
});
