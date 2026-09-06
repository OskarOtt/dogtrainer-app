import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radii, Spacing } from '@/constants/theme';
import { useInProgressSessions } from '@/hooks/use-sessions';
import { useTheme } from '@/hooks/use-theme';

/**
 * Train tab hub: everything training-related starts from one of these two flows —
 * starting a session right now (empty or from a plan) vs. building a plan/template
 * to use later. Also surfaces any session left IN_PROGRESS (e.g. the user navigated
 * away mid-training) so it can be resumed instead of orphaned.
 */
export default function TrainScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { data: inProgressSessions } = useInProgressSessions();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Train
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Start a training session or build a training plan.
        </ThemedText>

        {inProgressSessions && inProgressSessions.length > 0 ? (
          <View style={styles.resumeSection}>
            <ThemedText type="smallBold" style={styles.resumeTitle}>
              Resume Session
            </ThemedText>
            {inProgressSessions.map(({ session, dog }) => (
              <Pressable
                key={session.id}
                onPress={() => router.push(`/session/${session.id}`)}
                style={({ pressed }) => [
                  styles.resumeCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}>
                <Ionicons name="play-circle-outline" size={28} color={colors.primary} />
                <View style={styles.resumeCardText}>
                  <ThemedText type="subtitle" numberOfLines={1}>
                    {dog.name}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {session.exercises.length} exercise{session.exercises.length === 1 ? '' : 's'} in progress
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.buttons}>
          <PrimaryButton title="Start Training" onPress={() => router.push('/train/start')} />
          <PrimaryButton title="Plan Training" variant="secondary" onPress={() => router.push('/train/plan')} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  subtitle: { paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  resumeSection: { paddingHorizontal: Spacing.four, gap: Spacing.two, marginBottom: Spacing.four },
  resumeTitle: { marginBottom: Spacing.one },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.large,
    borderWidth: 1,
  },
  resumeCardText: { flex: 1, gap: 2 },
  buttons: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset, gap: Spacing.three },
});
