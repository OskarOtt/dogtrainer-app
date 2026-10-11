import type { Href } from 'expo-router';

import type { AppNotification, NotificationType, PushNotificationData } from '@/types/notification';

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'NEW_POST' || value === 'COMMENT' || value === 'NEW_FOLLOWER';
}

export function parsePushNotificationData(value: unknown): PushNotificationData | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const data = value as Record<string, unknown>;
  if (!isNotificationType(data.type) || typeof data.referenceId !== 'string' || !data.referenceId) {
    return null;
  }

  return {
    type: data.type,
    referenceId: data.referenceId,
    notificationId: typeof data.notificationId === 'string' && data.notificationId ? data.notificationId : undefined,
  };
}

export function getNotificationTargetPath(
  notification: Pick<AppNotification, 'type' | 'referenceId'> | PushNotificationData
): Href | null {
  if (!notification.referenceId) {
    return null;
  }

  switch (notification.type) {
    case 'NEW_POST':
    case 'COMMENT':
      return `/post/${notification.referenceId}` as Href;
    case 'NEW_FOLLOWER':
      return `/user/${notification.referenceId}` as Href;
    default:
      return null;
  }
}
