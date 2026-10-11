import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { AddFriendModal } from '@/components/add-friend-modal';
import { EmptyState } from '@/components/empty-state';
import { FindFriendsModal } from '@/components/find-friends-modal';
import { NotificationPermissionExplainer } from '@/components/notification-permission-explainer';
import { PostList } from '@/components/post-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { usePushNotificationPermission } from '@/hooks/use-push-notifications';
import { useFeed } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  hasShownNotificationExplainerAsync,
  markNotificationExplainerShownAsync,
} from '@/utils/pushNotifications';

export default function FeedScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { isAuthenticated } = useAuth();
  const [isAddFriendVisible, setIsAddFriendVisible] = useState(false);
  const [isFindFriendsVisible, setIsFindFriendsVisible] = useState(false);
  const [isNotificationExplainerVisible, setIsNotificationExplainerVisible] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();
  const {
    isSupported,
    permissionState,
    isCheckingPermission,
    isRequestingPermission,
    requestPermissionsAndRegister,
  } = usePushNotificationPermission();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFeed();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCountValue = unreadCount?.count ?? 0;
  const unreadCountLabel = unreadCountValue > 99 ? '99+' : String(unreadCountValue);

  useEffect(() => {
    let isMounted = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (!isAuthenticated || !isSupported || isCheckingPermission || permissionState !== 'undetermined') {
      return;
    }

    void (async () => {
      const hasShown = await hasShownNotificationExplainerAsync();
      if (!isMounted || hasShown) {
        return;
      }

      await markNotificationExplainerShownAsync();
      if (!isMounted) {
        return;
      }

      timeout = setTimeout(() => {
        if (isMounted) {
          setIsNotificationExplainerVisible(true);
        }
      }, 750);
    })();

    return () => {
      isMounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isAuthenticated, isSupported, isCheckingPermission, permissionState]);

  async function handleEnableNotifications() {
    setIsNotificationExplainerVisible(false);
    await requestPermissionsAndRegister();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/noborder-doglogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={styles.title}>
              {t('navigation.feed')}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setIsFindFriendsVisible(true)}
              hitSlop={8}
              style={[
                styles.composeButton,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 },
              ]}>
              <Ionicons name="person-add-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/notifications')}
              hitSlop={8}
              accessibilityLabel={
                unreadCountValue > 0
                  ? t('notifications.openWithCount', { count: unreadCountValue })
                  : t('notifications.open')
              }
              style={[
                styles.composeButton,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 },
              ]}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadCountValue > 0 ? (
                <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                  <ThemedText style={styles.notificationBadgeText}>{unreadCountLabel}</ThemedText>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => router.push('/post/new')}
              hitSlop={8}
              style={[styles.composeButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={26} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        <FindFriendsModal
          visible={isFindFriendsVisible}
          onClose={() => setIsFindFriendsVisible(false)}
          onUseEmailFallback={() => {
            setIsFindFriendsVisible(false);
            setIsAddFriendVisible(true);
          }}
        />
        <AddFriendModal visible={isAddFriendVisible} onClose={() => setIsAddFriendVisible(false)} />
        <NotificationPermissionExplainer
          visible={isNotificationExplainerVisible}
          loading={isRequestingPermission}
          onEnable={() => void handleEnableNotifications()}
          onNotNow={() => setIsNotificationExplainerVisible(false)}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title={t('posts.feedLoadError')} message={getApiErrorMessage(error)} />
        ) : (
          <PostList
            posts={posts}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            isFetchingNextPage={isFetchingNextPage}
            refreshing={isRefetching}
            onRefresh={refetch}
            emptyTitle={t('posts.noPosts')}
            emptyMessage={t('posts.noPostsFeed')}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: { fontSize: 28 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: { width: 40, height: 40, borderRadius: 20 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 700,
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
