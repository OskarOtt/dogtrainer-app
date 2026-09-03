import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Train tab hub: everything training-related starts from one of these two flows —
 * starting a session right now (empty or from a plan) vs. building a plan/template
 * to use later.
 */
export default function TrainScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Train
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Start a training session or build a training plan.
        </ThemedText>

        <View style={styles.buttons}>
          <PrimaryButton title="Start Training" onPress={() => router.push('/train/start')} style={styles.button} />
          <PrimaryButton
            title="Plan Training"
            variant="secondary"
            onPress={() => router.push('/train/plan')}
            style={styles.button}
          />
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
  buttons: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  button: { minHeight: 72 },
});
