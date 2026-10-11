import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { notificationsApi } from '@/api/notifications';
import type { NotificationPage, NotificationUnreadCount } from '@/types/notification';

export const notificationsKey = ['notifications'] as const;
export const unreadNotificationCountKey = ['notifications', 'unread-count'] as const;

function markNotificationReadInCache(queryClient: QueryClient, notificationId: string) {
  let unreadChanged = false;

  queryClient.setQueryData<InfiniteData<NotificationPage>>(notificationsKey, (data) => {
    if (!data) {
      return data;
    }

    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((notification) => {
          if (notification.id !== notificationId || notification.read) {
            return notification;
          }
          unreadChanged = true;
          return { ...notification, read: true };
        }),
      })),
    };
  });

  if (unreadChanged) {
    queryClient.setQueryData<NotificationUnreadCount>(unreadNotificationCountKey, (data) =>
      data ? { count: Math.max(0, data.count - 1) } : data
    );
  }
}

function markAllNotificationsReadInCache(queryClient: QueryClient) {
  queryClient.setQueryData<InfiniteData<NotificationPage>>(notificationsKey, (data) => {
    if (!data) {
      return data;
    }

    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((notification) => (notification.read ? notification : { ...notification, read: true })),
      })),
    };
  });

  queryClient.setQueryData<NotificationUnreadCount>(unreadNotificationCountKey, (data) =>
    data ? { count: 0 } : data
  );
}

export async function invalidateNotificationQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: notificationsKey, exact: true }),
    queryClient.invalidateQueries({ queryKey: unreadNotificationCountKey, exact: true }),
  ]);
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationsKey,
    queryFn: ({ pageParam }: { pageParam?: string }) => notificationsApi.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: unreadNotificationCountKey,
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markRead(notificationId),
    onSuccess: async (_data, notificationId) => {
      markNotificationReadInCache(queryClient, notificationId);
      await invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: async () => {
      markAllNotificationsReadInCache(queryClient);
      await invalidateNotificationQueries(queryClient);
    },
  });
}
