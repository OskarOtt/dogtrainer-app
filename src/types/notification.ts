import type { AppLocale } from '@/i18n';

export type NotificationType = 'NEW_POST' | 'COMMENT' | 'NEW_FOLLOWER';

export interface NotificationActor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationPage {
  items: AppNotification[];
  nextCursor: string | null;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface RegisterDevicePayload {
  expoPushToken: string;
  platform: 'IOS' | 'ANDROID';
  locale: AppLocale;
}

export interface PushNotificationData {
  type: NotificationType;
  referenceId: string;
  notificationId?: string;
}
