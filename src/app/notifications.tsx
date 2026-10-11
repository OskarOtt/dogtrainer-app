import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { NotificationItem } from '@/components/notification-item';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/use-notifications';
import { usePushNotificationPermission } from '@/hooks/use-push-notifications';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import type { AppNotification } from '@/types/notification';
import { getNotificationTargetPath } from '@/utils/notification-navigation';
import { getApiErrorMessage } from '@/utils/apiError';

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const markNotificationRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { isSupported, permissionState, openNotificationSettings } = usePushNotificationPermission();

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const canMarkAllRead = (unreadCount?.count ?? 0) > 0 && !markAllRead.isPending;

  async function handlePressNotification(notification: AppNotification) {
    if (!notification.read) {
      try {
        await markNotificationRead.mutateAsync(notification.id);
      } catch {
        // ignore
      }
    }

    const targetPath = getNotificationTargetPath(notification);
    if (targetPath) {
      router.push(targetPath);
    }
  }

  if (isLoading && notifications.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: t('notifications.title') }} />
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError && notifications.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t('notifications.title') }} />
        <EmptyState
          icon="alert-circle-outline"
          title={t('notifications.loadError')}
          message={getApiErrorMessage(error)}
        >
          <PrimaryButton title={t('notifications.retry')} variant="secondary" onPress={() => void refetch()} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: t('notifications.title'),
          headerRight: () => (
            <Pressable
              disabled={!canMarkAllRead}
              onPress={() => markAllRead.mutate()}
              hitSlop={8}
              style={{ opacity: canMarkAllRead ? 1 : 0.4 }}
            >
              <ThemedText type="small" style={{ color: colors.primary }}>
                {t('notifications.markAllRead')}
              </ThemedText>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => void handlePressNotification(item)}
            disabled={markNotificationRead.isPending && markNotificationRead.variables === item.id}
          />
        )}
        ListHeaderComponent={
          isSupported && permissionState === 'denied' ? (
            <View style={[styles.banner, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
              <View style={styles.bannerContent}>
                <ThemedText type="smallBold">{t('notifications.permissionBannerTitle')}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {t('notifications.permissionBannerMessage')}
                </ThemedText>
              </View>
              <PrimaryButton
                title={t('notifications.permissionBannerAction')}
                variant="secondary"
                onPress={openNotificationSettings}
                style={styles.bannerButton}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title={t('notifications.emptyTitle')}
            message={t('notifications.emptyMessage')}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  banner: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  bannerContent: {
    gap: Spacing.one,
  },
  bannerButton: {
    width: '100%',
  },
  footer: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
