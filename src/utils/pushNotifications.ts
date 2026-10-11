import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { notificationsApi } from '@/api/notifications';
import type { AppLocale } from '@/i18n';

const STORED_PUSH_TOKEN_KEY = 'dogtrainer.push-token';
const NOTIFICATION_EXPLAINER_SHOWN_KEY = 'dogtrainer.notification-explainer-shown';
const ANDROID_NOTIFICATION_CHANNEL_ID = 'default';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function supportsPushNotifications() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function getExpoProjectId(): string | null {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  return typeof projectId === 'string' && projectId ? projectId : null;
}

function getDevicePlatform(): 'IOS' | 'ANDROID' | null {
  if (Platform.OS === 'ios') {
    return 'IOS';
  }
  if (Platform.OS === 'android') {
    return 'ANDROID';
  }
  return null;
}

export async function ensureAndroidNotificationChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      showBadge: true,
    });
  } catch {
    // ignore
  }
}

export function getNotificationPermissionState(
  status: Notifications.NotificationPermissionsStatus | null
): NotificationPermissionState {
  if (!status) {
    return 'undetermined';
  }

  if (Platform.OS === 'ios' && status.ios) {
    switch (status.ios.status) {
      case Notifications.IosAuthorizationStatus.AUTHORIZED:
      case Notifications.IosAuthorizationStatus.PROVISIONAL:
      case Notifications.IosAuthorizationStatus.EPHEMERAL:
        return 'granted';
      case Notifications.IosAuthorizationStatus.DENIED:
        return 'denied';
      default:
        return 'undetermined';
    }
  }

  switch (status.status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}

export async function getNotificationPermissionsStatusAsync(): Promise<Notifications.NotificationPermissionsStatus | null> {
  if (!supportsPushNotifications()) {
    return null;
  }

  try {
    return await Notifications.getPermissionsAsync();
  } catch {
    return null;
  }
}

export async function requestNotificationPermissionsAsync(): Promise<Notifications.NotificationPermissionsStatus | null> {
  if (!supportsPushNotifications()) {
    return null;
  }

  await ensureAndroidNotificationChannelAsync();

  try {
    return await Notifications.requestPermissionsAsync();
  } catch {
    return null;
  }
}

export async function getExpoPushTokenAsync(): Promise<string | null> {
  if (!supportsPushNotifications() || !Device.isDevice) {
    return null;
  }

  const permissionStatus = await getNotificationPermissionsStatusAsync();
  if (getNotificationPermissionState(permissionStatus) !== 'granted') {
    return null;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return null;
  }

  await ensureAndroidNotificationChannelAsync();

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export async function getStoredPushTokenAsync(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORED_PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function storePushTokenAsync(expoPushToken: string) {
  try {
    await AsyncStorage.setItem(STORED_PUSH_TOKEN_KEY, expoPushToken);
  } catch {
    // ignore
  }
}

export async function clearStoredPushTokenAsync() {
  try {
    await AsyncStorage.removeItem(STORED_PUSH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function registerPushTokenAsync(locale: AppLocale, token?: string): Promise<string | null> {
  const platform = getDevicePlatform();
  if (!platform) {
    return null;
  }

  const expoPushToken = token ?? (await getExpoPushTokenAsync());
  if (!expoPushToken) {
    return null;
  }

  try {
    await notificationsApi.registerDevice({
      expoPushToken,
      platform,
      locale,
    });
    await storePushTokenAsync(expoPushToken);
    return expoPushToken;
  } catch {
    return null;
  }
}

export async function registerPushTokenIfPermittedAsync(locale: AppLocale): Promise<string | null> {
  const status = await getNotificationPermissionsStatusAsync();
  if (getNotificationPermissionState(status) !== 'granted') {
    return null;
  }

  return registerPushTokenAsync(locale);
}

export async function unregisterStoredPushTokenAsync() {
  const expoPushToken = await getStoredPushTokenAsync();
  if (!expoPushToken) {
    return;
  }

  try {
    await notificationsApi.unregisterDevice(expoPushToken);
  } catch {
    // ignore
  }
}

export async function hasShownNotificationExplainerAsync(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(NOTIFICATION_EXPLAINER_SHOWN_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markNotificationExplainerShownAsync() {
  try {
    await AsyncStorage.setItem(NOTIFICATION_EXPLAINER_SHOWN_KEY, 'true');
  } catch {
    // ignore
  }
}

export async function setNotificationBadgeCountAsync(count: number) {
  if (!supportsPushNotifications()) {
    return;
  }

  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // ignore
  }
}

export async function clearNotificationBadgeAsync() {
  await setNotificationBadgeCountAsync(0);
}
