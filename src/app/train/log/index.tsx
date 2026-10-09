import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { t } from '@/i18n';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LogEntryType = 'session' | 'activity';

/**
 * First step of the Train tab's "log a past entry" shortcut: choose whether the forgotten
 * entry was a training session (exercises) or a physical activity (walk/run/etc), then move
 * on to picking which dog it's for.
 */
export default function LogPastEntryTypeScreen() {
  const router = useRouter();
  const colors = useTheme();

  const options: { type: LogEntryType; icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }[] = [
    { type: 'session', icon: 'barbell-outline', title: t('training.session'), subtitle: t('manualEntry.sessionSubtitle') },
    { type: 'activity', icon: 'walk-outline', title: t('activity.activity'), subtitle: t('manualEntry.activitySubtitle') },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('train.logPast') }} />
      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        {t('manualEntry.chooseTypeSubtitle')}
      </ThemedText>
      {options.map((option) => (
        <Pressable
          key={option.type}
          onPress={() => router.push(`/train/log/pick-dog?type=${option.type}`)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Ionicons name={option.icon} size={26} color={colors.primary} style={styles.icon} />
          <ThemedView style={styles.cardText}>
            <ThemedText type="subtitle">{option.title}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {option.subtitle}
            </ThemedText>
          </ThemedView>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  subtitle: { marginBottom: Spacing.one },
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
  cardText: { flex: 1, gap: 2, backgroundColor: 'transparent' },
});
