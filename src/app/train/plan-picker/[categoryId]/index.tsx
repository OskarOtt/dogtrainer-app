import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ActivityCard } from '@/components/activity-card';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActivities } from '@/hooks/use-training-catalog';
import { usePlanPickerSelection } from '@/store/plan-exercise-picker';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function PlanPickerActivitiesScreen() {
  const { categoryId, returnTo } = useLocalSearchParams<{ categoryId: string; returnTo: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: activities, isLoading, isError, error } = useActivities(categoryId);
  const selection = usePlanPickerSelection();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Select Activity' }} />
      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : isError ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load activities" message={getApiErrorMessage(error)} />
      ) : !activities || activities.length === 0 ? (
        <EmptyState icon="flash-outline" title="No activities available" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(activity) => activity.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ActivityCard
              activity={item}
              onPress={() =>
                router.push(
                  `/train/plan-picker/${categoryId}/${item.id}?returnTo=${encodeURIComponent(returnTo)}`,
                )
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
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
  },
});
