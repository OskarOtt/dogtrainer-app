import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { t } from '@/i18n';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABEL_KEYS } from '@/constants/activity-types';
import { CardShadow, Radii, Spacing } from '@/constants/theme';
import { useCreateActivity } from '@/hooks/use-activities';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityType } from '@/types/activity';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * Activity type picker: starts the physical activity immediately on selection (no manual date
 * picker - `startedAt` is set server-side to now) and navigates straight into the live timer
 * screen. Mirrors the simplicity of `train/[dogId]/index.tsx`'s exercise picker, but with a
 * fixed, small set of options instead of a searchable catalog. Replaces the old per-dog
 * `activity/[dogId]/start` route now that an activity can be tagged with multiple dogs - the
 * comma-joined `dogIds` param comes from the (possibly multi-select) `activity/pick-dog` screen.
 */
export default function StartActivityScreen() {
  const { dogIds: dogIdsParam } = useLocalSearchParams<{ dogIds: string }>();
  const dogIds = (dogIdsParam ?? '').split(',').filter(Boolean);
  const router = useRouter();
  const colors = useTheme();
  const createActivity = useCreateActivity();

  function handleSelect(activityType: ActivityType) {
    createActivity.mutate(
      { dogIds, activityType },
      {
        onSuccess: (activity) => router.replace(`/activity/${activity.id}`),
      }
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('activity.chooseType') }} />
      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        {t('activity.chooseTypeSubtitle')}
      </ThemedText>
      {createActivity.isError ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {getApiErrorMessage(createActivity.error)}
        </ThemedText>
      ) : null}
      <FlatList
        data={ACTIVITY_TYPES}
        keyExtractor={(item) => item.type}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelect(item.type)}
            disabled={createActivity.isPending}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                opacity: createActivity.isPending ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}>
            <Ionicons name={item.icon} size={26} color={colors.primary} style={styles.icon} />
            <ThemedText type="subtitle" style={styles.label}>
              {t(ACTIVITY_TYPE_LABEL_KEYS[item.type])}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: { paddingHorizontal: Spacing.four, marginTop: Spacing.two, marginBottom: Spacing.three },
  error: { paddingHorizontal: Spacing.four, marginBottom: Spacing.two },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    ...CardShadow,
  },
  icon: { marginRight: -Spacing.one },
  label: { flex: 1 },
});
