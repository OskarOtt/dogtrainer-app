import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { ActivityCard } from '@/components/activity-card';
import { EmptyState } from '@/components/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActivities } from '@/hooks/use-training-catalog';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function ActivitiesScreen() {
  const { dogId, categoryId, sessionId } = useLocalSearchParams<{ dogId: string; categoryId: string; sessionId?: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: activities, isLoading, isError, error } = useActivities(categoryId);

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
                router.push(`/train/${dogId}/${categoryId}/${item.id}${sessionId ? `?sessionId=${sessionId}` : ''}`)
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
});
