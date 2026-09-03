import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingSessionCard } from '@/components/training-session-card';
import { Radii, Spacing } from '@/constants/theme';
import { useDeleteDog, useDog } from '@/hooks/use-dogs';
import { useDogSessions } from '@/hooks/use-sessions';
import { useDogStatistics } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatAge, formatDuration } from '@/utils/date';

export default function DogDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = useDog(id);
  const { data: sessions } = useDogSessions(id);
  const { data: statistics } = useDogStatistics(id);
  const deleteDog = useDeleteDog();

  function handleDelete() {
    if (!dog) {
      return;
    }
    Alert.alert('Delete dog', `Remove ${dog.name} and all of their training data?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteDog.mutate(dog.id, {
            onSuccess: () => router.replace('/(tabs)/dogs'),
          });
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !dog) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState icon="alert-circle-outline" title="Couldn't load this dog" message={getApiErrorMessage(error)} />
      </ThemedView>
    );
  }

  const age = formatAge(dog.birthDate);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: dog.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
          {dog.imageUrl ? (
            <Image source={{ uri: dog.imageUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Ionicons name="paw" size={40} color={colors.primary} />
          )}
        </View>

        <ThemedText type="title" style={styles.name}>
          {dog.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {[dog.breed, age, dog.sex].filter(Boolean).join(' · ') || 'No details yet'}
        </ThemedText>

        {statistics ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Training Statistics
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              {statistics.completedSessions} sessions completed · {formatDuration(statistics.totalTrainingMinutes)}{' '}
              total · {statistics.currentStreakDays} day streak ·{' '}
              {Math.round(statistics.averageSuccessRate * 100)}% avg success
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Training History
          </ThemedText>
          {!sessions || sessions.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              No training sessions yet. Start a session from the Train tab.
            </ThemedText>
          ) : (
            <View style={styles.sessionsList}>
              {sessions.slice(0, 5).map((session) => (
                <TrainingSessionCard
                  key={session.id}
                  session={session}
                  onPress={() => router.push(`/session/${session.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <PrimaryButton
          title="Start Training"
          onPress={() => router.push(`/train/${dog.id}`)}
          style={styles.button}
        />

        <PrimaryButton
          title="Goals"
          variant="secondary"
          onPress={() => router.push(`/dog/${dog.id}/goals`)}
          style={styles.button}
        />
        <PrimaryButton
          title="View Progress"
          variant="secondary"
          onPress={() => router.push(`/progress/${dog.id}`)}
          style={styles.button}
        />

        <PrimaryButton
          title="Edit Dog"
          variant="secondary"
          onPress={() => router.push(`/dog/${dog.id}/edit`)}
          style={styles.button}
        />
        <PrimaryButton title="Delete Dog" variant="danger" onPress={handleDelete} style={styles.button} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 28 },
  subtitle: { marginBottom: Spacing.three },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  sectionTitle: { fontSize: 18 },
  sessionsList: { gap: Spacing.two },
  button: { alignSelf: 'stretch', marginTop: Spacing.two },
});
