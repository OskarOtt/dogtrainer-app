import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { notificationsApi } from '@/api/notifications';
import {
  invalidateNotificationQueries,
  useUnreadNotificationCount,
} from '@/hooks/use-notifications';
import { useTranslation } from '@/i18n/provider';
import { getNotificationTargetPath, parsePushNotificationData } from '@/utils/notification-navigation';
import {
  getNotificationPermissionState,
  getNotificationPermissionsStatusAsync,
  registerPushTokenAsync,
  registerPushTokenIfPermittedAsync,
  requestNotificationPermissionsAsync,
  setNotificationBadgeCountAsync,
  supportsPushNotifications,
} from '@/utils/pushNotifications';

function getResponseKey(response: Notifications.NotificationResponse | null | undefined) {
  const identifier = response?.notification.request.identifier;
  if (typeof identifier !== 'string' || !identifier) {
    return null;
  }
  return `${identifier}:${response.actionIdentifier}`;
}

export function usePushNotificationPermission() {
  const { locale } = useTranslation();
  const isSupported = supportsPushNotifications();
  const [permissionStatus, setPermissionStatus] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(isSupported);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const refreshPermissionStatus = useCallback(async () => {
    if (!isSupported) {
      setPermissionStatus(null);
      setIsCheckingPermission(false);
      return null;
    }

    const status = await getNotificationPermissionsStatusAsync();
    setPermissionStatus(status);
    setIsCheckingPermission(false);
    return status;
  }, [isSupported]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void refreshPermissionStatus();
    }, 0);

    return () => clearTimeout(timeout);
  }, [refreshPermissionStatus]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissionStatus();
      }
    });

    return () => subscription.remove();
  }, [isSupported, refreshPermissionStatus]);

  const requestPermissionsAndRegister = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    setIsRequestingPermission(true);
    try {
      const status = await requestNotificationPermissionsAsync();
      setPermissionStatus(status);

      if (getNotificationPermissionState(status) !== 'granted') {
        return false;
      }

      await registerPushTokenAsync(locale);
      return true;
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isSupported, locale]);

  const openNotificationSettings = useCallback(() => {
    void Linking.openSettings().catch(() => {
      // ignore
    });
  }, []);

  return {
    isSupported,
    permissionStatus,
    permissionState: getNotificationPermissionState(permissionStatus),
    isCheckingPermission,
    isRequestingPermission,
    refreshPermissionStatus,
    requestPermissionsAndRegister,
    openNotificationSettings,
  };
}

export function usePushNotifications({
  isAuthenticated,
  isAuthLoading,
}: {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale } = useTranslation();
  const isSupported = supportsPushNotifications();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const { data: unreadCount } = useUnreadNotificationCount(isAuthenticated && !isAuthLoading && isSupported);
  const handledResponseKeysRef = useRef(new Set<string>());
  const pendingResponseRef = useRef<Notifications.NotificationResponse | null>(null);
  const isHandlingResponseRef = useRef(false);

  const handleNotificationResponse = useCallback(
    async (response: Notifications.NotificationResponse | null) => {
      if (!isSupported || !response) {
        return;
      }

      const responseKey = getResponseKey(response);
      if (!responseKey || handledResponseKeysRef.current.has(responseKey)) {
        return;
      }

      if (isAuthLoading || !isAuthenticated || isHandlingResponseRef.current) {
        pendingResponseRef.current = response;
        return;
      }

      isHandlingResponseRef.current = true;
      try {
        if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
          return;
        }

        const data = parsePushNotificationData(response.notification.request.content.data);
        if (!data) {
          return;
        }

        if (data.notificationId) {
          try {
            await notificationsApi.markRead(data.notificationId);
          } catch {
            // ignore
          }
        }

        await invalidateNotificationQueries(queryClient);

        const targetPath = getNotificationTargetPath(data);
        if (targetPath) {
          router.push(targetPath);
        }
      } finally {
        handledResponseKeysRef.current.add(responseKey);
        pendingResponseRef.current = null;
        isHandlingResponseRef.current = false;

        try {
          await Notifications.clearLastNotificationResponseAsync();
        } catch {
          // ignore
        }
      }
    },
    [isAuthLoading, isAuthenticated, isSupported, queryClient, router]
  );

  useEffect(() => {
    if (!isSupported || typeof unreadCount?.count !== 'number' || !isAuthenticated || isAuthLoading) {
      return;
    }

    void setNotificationBadgeCountAsync(unreadCount.count);
  }, [isAuthenticated, isAuthLoading, isSupported, unreadCount?.count]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleNotificationResponse(response);
    });

    return () => subscription.remove();
  }, [handleNotificationResponse, isSupported]);

  useEffect(() => {
    if (lastNotificationResponse) {
      void handleNotificationResponse(lastNotificationResponse);
    }
  }, [handleNotificationResponse, lastNotificationResponse]);

  useEffect(() => {
    if (!pendingResponseRef.current || isAuthLoading || !isAuthenticated) {
      return;
    }

    void handleNotificationResponse(pendingResponseRef.current);
  }, [handleNotificationResponse, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!isSupported || isAuthLoading || !isAuthenticated) {
      return;
    }

    const subscription = Notifications.addNotificationReceivedListener(() => {
      void invalidateNotificationQueries(queryClient);
    });

    return () => subscription.remove();
  }, [isAuthenticated, isAuthLoading, isSupported, queryClient]);

  useEffect(() => {
    if (!isSupported || isAuthLoading || !isAuthenticated) {
      return;
    }

    const subscription = Notifications.addPushTokenListener((token) => {
      if (typeof token.data === 'string' && token.data) {
        void registerPushTokenAsync(locale, token.data);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, isAuthLoading, isSupported, locale]);

  useEffect(() => {
    if (!isSupported || isAuthLoading || !isAuthenticated) {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void registerPushTokenIfPermittedAsync(locale);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, isAuthLoading, isSupported, locale]);
}
