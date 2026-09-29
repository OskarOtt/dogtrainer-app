import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { t, type TranslationKey } from '@/i18n';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { useCreateActivity } from '@/hooks/use-activities';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityType } from '@/types/activity';
import { getApiErrorMessage } from '@/utils/apiError';

const ACTIVITY_TYPES: { type: ActivityType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'WALK', icon: 'footsteps-outline' },
  { type: 'RUN', icon: 'walk-outline' },
  { type: 'SKI', icon: 'snow-outline' },
  { type: 'STRENGTH_TRAINING', icon: 'barbell-outline' },
  { type: 'SWIM', icon: 'water-outline' },
  { type: 'HIKE', icon: 'trail-sign-outline' },
  { type: 'PLAY_SESSION', icon: 'tennisball-outline' },
];

const TYPE_LABEL_KEYS: Record<ActivityType, TranslationKey> = {
  WALK: 'activity.walk',
  RUN: 'activity.run',
  SKI: 'activity.ski',
  STRENGTH_TRAINING: 'activity.strengthTraining',
  SWIM: 'activity.swim',
  HIKE: 'activity.hike',
  PLAY_SESSION: 'activity.playSession',
};

/**
 * Activity type picker: starts the physical activity immediately on selection (no manual date
 * picker - `startedAt` is set server-side to now) and navigates straight into the live timer
 * screen. Mirrors the simplicity of `train/[dogId]/index.tsx`'s exercise picker, but with a
 * fixed, small set of options instead of a searchable catalog.
 */
export default function StartActivityScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const createActivity = useCreateActivity(dogId);

  function handleSelect(activityType: ActivityType) {
    createActivity.mutate(
      { activityType },
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
              {t(TYPE_LABEL_KEYS[item.type])}
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
  },
  icon: { marginRight: -Spacing.one },
  label: { flex: 1 },
});
