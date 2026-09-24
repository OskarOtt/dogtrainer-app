import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
import { MediaAvatarPicker } from '@/components/media-avatar-picker';
import { PrimaryButton } from '@/components/primary-button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
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
import { useTranslation } from '@/i18n/provider';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDuration } from '@/utils/date';
import { formatPercent } from '@/utils/number';
import type { SocialAuthPayload, SocialProvider } from '@/types/auth';

export default function ProfileScreen() {
  const { user, logout, linkSocialIdentity } = useAuth();
  const colors = useTheme();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(false);
  const [linkError, setLinkError] = useState<unknown>(null);
  const { languagePreference, setLanguagePreference } = useTranslation();

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
  const authMethods = user?.authMethods ?? ['PASSWORD'];
  const unlinkedProviders = (['APPLE'] as SocialProvider[])
    .filter((provider) => !authMethods.includes(provider));

  async function handleProviderLink(credential: SocialAuthPayload) {
    setLinkError(null);
    await linkSocialIdentity(credential);
  }

  const header = (
    <View style={styles.headerContent}>
      <ThemedText type="title" style={styles.title}>
        {t('profile.title')}
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
            title={t('common.removePhoto')}
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

      <View style={styles.followRow}>
        <Pressable
            style={styles.followStat}
            onPress={() => user && router.push(`/user/${user.id}/followers`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {followers?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{t('social.followers')}</ThemedText>
        </Pressable>
        <Pressable
            style={styles.followStat}
            onPress={() => user && router.push(`/user/${user.id}/following`)}>
          <ThemedText type="subtitle" style={styles.followCount}>
            {following?.length ?? 0}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{t('social.following')}</ThemedText>
        </Pressable>
      </View>

      <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {user?.name ?? t('common.trainer')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {t('profile.signInMethods')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {t('profile.connected', { methods: authMethods.map(formatAuthMethod).join(', ') })}
        </ThemedText>
        {unlinkedProviders.length > 0 ? (
          <SocialAuthButtons
            providers={unlinkedProviders}
            onCredential={handleProviderLink}
            onError={setLinkError}
          />
        ) : null}
        {linkError ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {getApiErrorMessage(linkError, t('auth.linkError'))}
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {t('language.title')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{t('language.description')}</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsLanguageSelectorVisible(true)}
          style={[
            styles.languageSelector,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <ThemedText style={styles.languageSelectorLabel}>
            {t(
              languagePreference === 'system'
                ? 'language.followSystem'
                : languagePreference === 'nb'
                  ? 'language.norwegianBokmal'
                  : 'language.english',
            )}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{t('common.edit')}</ThemedText>
        </Pressable>
      </ThemedView>

      {isLoadingDogs ? (
        <ActivityIndicator color={colors.primary} style={styles.dogsLoading} />
      ) : !dogs || dogs.length === 0 ? (
        <EmptyState icon="paw-outline" title={t('profile.addDog')} message={t('profile.addDogMessage')}>
          <PrimaryButton title={t('dog.addADog')} onPress={() => router.push('/dog/new')} style={styles.emptyButton} />
        </EmptyState>
      ) : (
        <>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('profile.trainingOverview')}
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
                  label={t('progress.sessionsThisWeek')}
                  value={`${statistics?.sessionsThisWeek ?? 0}`}
                />
                <StatCard
                  icon="flame-outline"
                  label={t('progress.trainingStreak')}
                  value={t('time.week', { count: statistics?.currentStreakWeeks ?? 0 })}
                />
                <StatCard
                  icon="time-outline"
                  label={t('progress.totalTime')}
                  value={formatDuration(statistics?.totalTrainingMinutes ?? 0)}
                />
                <StatCard
                  icon="checkmark-circle-outline"
                  label={t('progress.averageSuccess')}
                  value={formatPercent(statistics?.averageSuccessRate ?? 0)}
                />
              </View>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                {t('profile.activeGoals')}
              </ThemedText>
              {activeGoals.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  {t('profile.noActiveGoals')}
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {activeGoals.slice(0, 3).map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/dog/${activeDog.id}/goals`)} />
                  ))}
                </View>
              )}

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                {t('profile.recentSessions')}
              </ThemedText>
              {!sessions || sessions.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  {t('profile.noRecentSessions')}
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
          {t('profile.myPosts')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{t('common.viewAll')}</ThemedText>
      </Pressable>

      <Pressable style={styles.myPostsRow} onPress={() => router.push('/blocked-users')}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('profile.blockedUsers')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{t('common.manage')}</ThemedText>
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
          ListFooterComponent={
            <View style={styles.footer}>
              <PrimaryButton title={t('auth.logOut')} onPress={logout} variant="danger" style={styles.logoutButton} />
              <Pressable onPress={() => setIsDeleteModalVisible(true)} hitSlop={8}>
                <ThemedText themeColor="danger" style={styles.deleteAccountLink}>
                  {t('profile.deleteAccount')}
                </ThemedText>
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>
      <DeleteAccountModal
        visible={isDeleteModalVisible}
        authMethods={authMethods}
        onClose={() => setIsDeleteModalVisible(false)}
        onDeleted={() => {
          setIsDeleteModalVisible(false);
          logout();
        }}
      />
      <LanguageSelectorModal
        visible={isLanguageSelectorVisible}
        preference={languagePreference}
        onClose={() => setIsLanguageSelectorVisible(false)}
        onSelect={(preference) => {
          setLanguagePreference(preference);
          setIsLanguageSelectorVisible(false);
        }}
      />
    </ThemedView>
  );
}

function formatAuthMethod(method: string): string {
  return method === 'PASSWORD' ? t('auth.passwordMethod') : method === 'APPLE' ? t('auth.appleMethod') : method;
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
  languageSelectorLabel: { fontWeight: 700 },
  languageSelector: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
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
  footer: { marginTop: Spacing.two, marginBottom: Spacing.four, gap: Spacing.three, alignItems: 'center' },
  logoutButton: { alignSelf: 'stretch' },
  deleteAccountLink: { fontSize: 14 },
});
