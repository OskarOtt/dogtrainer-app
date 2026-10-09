import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { t, type TranslationKey } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TitleBadge } from '@/components/title-badge';
import { Radii, Spacing, StatusColors, CardShadow } from '@/constants/theme';
import { usePublicDog } from '@/hooks/use-dogs';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatAge, formatDateTime, formatDuration } from '@/utils/date';
import type { PublicDogSession } from '@/types/dog';

/** Read-only dog profile shown to other users (e.g. tapping a dog tag on a post, or a dog in a user's profile). */
export default function PublicDogProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: dog, isLoading, isError, error } = usePublicDog(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError || !dog) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <EmptyState icon="alert-circle-outline" title={t('dog.loadError')} message={getApiErrorMessage(error)}>
          <PrimaryButton title={t('common.exit')} variant="secondary" onPress={() => router.back()} />
        </EmptyState>
      </ThemedView>
    );
  }

  const age = formatAge(dog.birthDate);
  const detailLines = [
    dog.breed,
    age,
    dog.sex ? t(dog.sex === 'MALE' ? 'dog.male' : 'dog.female') : null,
  ].filter(Boolean) as string[];

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: dog.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <ThemedText type="title" style={styles.name}>
              {dog.name}
            </ThemedText>
            {detailLines.length > 0 ? (
              detailLines.map((line) => (
                <ThemedText key={line} themeColor="textSecondary" style={styles.detailLine}>
                  {line}
                </ThemedText>
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.detailLine}>
                {t('common.noDetails')}
              </ThemedText>
            )}
            <ThemedText themeColor="textSecondary" style={styles.detailLine}>
              {t('dog.sessionsCompleted', { count: dog.completedSessionCount })}
            </ThemedText>

            <Pressable style={styles.ownerRow} onPress={() => router.push(`/user/${dog.ownerId}`)} hitSlop={4}>
              <Avatar uri={dog.ownerAvatarUrl} size={24} />
              <ThemedText themeColor="textSecondary">{dog.ownerName}</ThemedText>
            </Pressable>
          </View>

          <Avatar uri={dog.mediaUrl} mediaType={dog.mediaType} size={128} placeholderIcon="paw" />
        </View>

        {dog.titles.length > 0 ? (
          <View style={styles.titlesRow}>
            {dog.titles.map((title) => (
              <TitleBadge key={title.id} title={title} />
            ))}
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('dog.publicSessions')}
          </ThemedText>
          {dog.recentSessions.length === 0 ? (
            <ThemedText themeColor="textSecondary">{t('dog.noSessions')}</ThemedText>
          ) : (
            <View style={styles.sessionsList}>
              {dog.recentSessions.map((session) => (
                <PublicSessionRow key={session.id} session={session} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const STATUS_LABELS: Record<PublicDogSession['status'], TranslationKey> = {
  IN_PROGRESS: 'status.inProgress',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
};

function PublicSessionRow({ session }: { session: PublicDogSession }) {
  const statusColor = StatusColors[session.status];

  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionInfo}>
        <ThemedText numberOfLines={1}>{formatDateTime(session.startedAt)}</ThemedText>
        {session.durationMinutes != null ? (
          <ThemedText themeColor="textSecondary" type="small">
            {formatDuration(session.durationMinutes)}
          </ThemedText>
        ) : null}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <ThemedText type="small" style={{ color: statusColor }}>
          {t(STATUS_LABELS[session.status])}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  headerInfo: { flex: 1, gap: 2 },
  name: { fontSize: 28 },
  detailLine: { fontSize: 15 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  titlesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.three,
    ...CardShadow,
  },
  sectionTitle: { fontSize: 18 },
  sessionsList: { gap: Spacing.two, marginTop: Spacing.one },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sessionInfo: { flex: 1, gap: 2 },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
});
