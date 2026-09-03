import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { TrainingCategoryCard } from '@/components/training-category-card';
import { Spacing } from '@/constants/theme';
import { useTrainingCategories } from '@/hooks/use-training-catalog';
import { usePlanPickerSelection } from '@/store/plan-exercise-picker';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { ThemedText } from '@/components/themed-text';

/**
 * Entry point for picking exercises to attach to a training plan. Mirrors the
 * regular /train category browse screen, but finishing here returns the picked
 * exercises to the Plan form instead of starting a session (see
 * src/store/plan-exercise-picker.ts).
 */
export default function PlanPickerCategoriesScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: categories, isLoading, isError, error } = useTrainingCategories();
  const selection = usePlanPickerSelection();

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
              Pick the exercises this plan should include.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <TrainingCategoryCard
              category={item}
              onPress={() =>
                router.push(`/train/plan-picker/${item.id}?returnTo=${encodeURIComponent(returnTo)}`)
              }
            />
          )}
        />
      )}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton
          title={selection.length > 0 ? `Done (${selection.length})` : 'Done'}
          onPress={() => router.dismissTo(returnTo as never)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { marginBottom: Spacing.one },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
  },
});
