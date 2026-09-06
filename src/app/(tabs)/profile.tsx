import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colors = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>

        <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <ThemedText type="subtitle">{user?.name ?? 'Trainer'}</ThemedText>
          <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
        </ThemedView>

        <PrimaryButton title="Log Out" onPress={logout} variant="danger" style={styles.logoutButton} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, paddingBottom: Spacing.six + BottomTabInset, gap: Spacing.four },
  title: { fontSize: 28 },
  card: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  logoutButton: { marginTop: 'auto' },
});
