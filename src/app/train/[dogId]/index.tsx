import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { TrainingCategoryCard } from '@/components/training-category-card';
import { useTrainingCategories } from '@/hooks/use-training-catalog';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function TrainingCategoriesScreen() {
  const { dogId, sessionId } = useLocalSearchParams<{ dogId: string; sessionId?: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: categories, isLoading, isError, error } = useTrainingCategories();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Select Category' }} />
      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : isError ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load categories" message={getApiErrorMessage(error)} />
      ) : !categories || categories.length === 0 ? (
        <EmptyState icon="layers-outline" title="No categories available" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(category) => category.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <ThemedText themeColor="textSecondary" style={styles.header}>
              What would you like to train today?
            </ThemedText>
          }
          renderItem={({ item }) => (
            <TrainingCategoryCard
              category={item}
              onPress={() =>
                router.push(`/train/${dogId}/${item.id}${sessionId ? `?sessionId=${sessionId}` : ''}`)
              }
            />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { marginBottom: Spacing.one },
});
