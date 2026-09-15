import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { MediaAvatarPicker } from '@/components/media-avatar-picker';
import { PrimaryButton } from '@/components/primary-button';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingSessionCard } from '@/components/training-session-card';
import { BottomTabInset, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDogs } from '@/hooks/use-dogs';
import { useFollowers, useFollowing } from '@/hooks/use-follows';
import { useDogGoals } from '@/hooks/use-goals';
import { useDogSessions } from '@/hooks/use-sessions';
import { useDogStatistics } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { useRemoveAvatar, useUpdateAvatar } from '@/hooks/use-user';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDuration } from '@/utils/date';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colors = useTheme();
  const router = useRouter();

  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const isBusy = updateAvatar.isPending || removeAvatar.isPending;
  const avatarErrorMessage = updateAvatar.isError
    ? getApiErrorMessage(updateAvatar.error)
    : removeAvatar.isError
      ? getApiErrorMessage(removeAvatar.error)
      : null;

  const { data: followers } = useFollowers(user?.id);
  const { data: following } = useFollowing(user?.id);

  const { data: dogs, isLoading: isLoadingDogs } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState<string | undefined>(undefined);
  const activeDog = useMemo(
    () => dogs?.find((dog) => dog.id === selectedDogId) ?? dogs?.[0],
    [dogs, selectedDogId],
  );
  const { data: statistics } = useDogStatistics(activeDog?.id);
  const { data: sessions } = useDogSessions(activeDog?.id);
  const { data: goals } = useDogGoals(activeDog?.id);
  const activeGoals = goals?.filter((goal) => goal.status !== 'COMPLETED') ?? [];

  const header = (
    <View style={styles.headerContent}>
      <ThemedText type="title" style={styles.title}>
        Profile
      </ThemedText>

      <ThemedView style={styles.avatarSection}>
        <MediaAvatarPicker
          uri={user?.avatarUrl ?? null}
          size={96}
          placeholderIcon="person"
          isBusy={isBusy}
          onSelect={(asset) => updateAvatar.mutate(asset)}
        />
        {user?.avatarUrl ? (
          <PrimaryButton
            title="Remove Photo"
            variant="secondary"
            disabled={isBusy}
            onPress={() => removeAvatar.mutate()}
            style={styles.removeButton}
          />
        ) : null}
        {avatarErrorMessage ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {avatarErrorMessage}
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {user?.name ?? 'Trainer'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
      </ThemedView>

      <View style={styles.followRow}>
        <Pressable
          style={styles.followStat}
          onPress={() => user && router.push(`/user/${user.id}/followers`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {followers?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Followers</ThemedText>
        </Pressable>
        <Pressable
          style={styles.followStat}
          onPress={() => user && router.push(`/user/${user.id}/following`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {following?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Following</ThemedText>
        </Pressable>
      </View>

      {isLoadingDogs ? (
        <ActivityIndicator color={colors.primary} style={styles.dogsLoading} />
      ) : !dogs || dogs.length === 0 ? (
        <EmptyState icon="paw-outline" title="Add a dog" message="Add a dog to see your training overview here.">
          <PrimaryButton title="Add a Dog" onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
        </EmptyState>
      ) : (
        <>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Training Overview
          </ThemedText>

          {dogs.length > 1 ? (
            <View style={styles.dogPicker}>
              {dogs.map((dog) => {
                const selected = dog.id === activeDog?.id;
                return (
                  <Pressable
                    key={dog.id}
                    onPress={() => setSelectedDogId(dog.id)}
                    style={[
                      styles.dogChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}>
                    <ThemedText style={{ color: selected ? colors.onPrimary : colors.text }}>{dog.name}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {activeDog ? (
            <>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="calendar-outline"
                  label="Sessions this week"
                  value={`${statistics?.sessionsThisWeek ?? 0}`}
                />
                <StatCard
                  icon="flame-outline"
                  label="Training streak"
                  value={`${statistics?.currentStreakWeeks ?? 0} ${(statistics?.currentStreakWeeks ?? 0) === 1 ? 'week' : 'weeks'}`}
                />
                <StatCard
                  icon="time-outline"
                  label="Total training time"
                  value={formatDuration(statistics?.totalTrainingMinutes ?? 0)}
                />
                <StatCard
                  icon="checkmark-circle-outline"
                  label="Avg. success rate"
                  value={`${Math.round((statistics?.averageSuccessRate ?? 0) * 100)}%`}
                />
              </View>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Active Goals
              </ThemedText>
              {activeGoals.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  No active goals yet.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {activeGoals.slice(0, 3).map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/dog/${activeDog.id}/goals`)} />
                  ))}
                </View>
              )}

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Recent Sessions
              </ThemedText>
              {!sessions || sessions.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  No sessions yet. Start training to build history.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {sessions.slice(0, 3).map((session) => (
                    <TrainingSessionCard
                      key={session.id}
                      session={session}
                      onPress={() => router.push(`/session/${session.id}`)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </>
      )}

      <Pressable style={styles.myPostsRow} onPress={() => user && router.push(`/user/${user.id}/posts`)}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          My Posts
        </ThemedText>
        <ThemedText themeColor="textSecondary">View all</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={[]}
          keyExtractor={() => 'header'}
          renderItem={null}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={header}
          ListFooterComponent={<PrimaryButton title="Log Out" onPress={logout} variant="danger" style={styles.logoutButton} />}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four + Spacing.three + BottomTabInset, flexGrow: 1 },
  headerContent: { paddingTop: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28 },
  avatarSection: { alignItems: 'center', gap: Spacing.two },
  removeButton: { alignSelf: 'center', paddingHorizontal: Spacing.four },
  error: { textAlign: 'center' },
  card: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  cardTitle: { fontSize: 20 },
  followRow: { flexDirection: 'row', gap: Spacing.four },
  followStat: { alignItems: 'center', flex: 1 },
  followCount: { fontSize: 20 },
  dogsLoading: { marginVertical: Spacing.three },
  emptyButton: { marginTop: Spacing.three, minWidth: 200 },
  sectionTitle: { fontSize: 18, marginTop: Spacing.two },
  subsectionTitle: { fontSize: 18, marginTop: Spacing.two },
  dogPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.one },
  dogChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  myPostsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  emptyText: { marginBottom: Spacing.one },
  list: { gap: Spacing.two },
  logoutButton: { marginTop: Spacing.two, marginBottom: Spacing.four },
});
