import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DogCard } from '@/components/dog-card';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDogs } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function DogsScreen() {
  const { data: dogs, isLoading, isError, error } = useDogs();
  const router = useRouter();
  const colors = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Dogs
          </ThemedText>
          <Pressable
            onPress={() => router.push('/dog/new')}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            hitSlop={8}>
            <Ionicons name="add" size={26} color={colors.onPrimary} />
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load dogs" message={getApiErrorMessage(error)} />
        ) : !dogs || dogs.length === 0 ? (
          <EmptyState icon="paw-outline" title="No dogs yet" message="Add your first dog to get started." />
        ) : (
          <FlatList
            data={dogs}
            keyExtractor={(dog) => dog.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <DogCard dog={item} onPress={() => router.push(`/dog/${item.id}`)} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  title: { fontSize: 28 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { marginTop: Spacing.six },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
