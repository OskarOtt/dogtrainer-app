import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { CardShadow, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import type { AppNotification } from '@/types/notification';
import { formatRelativeTime } from '@/utils/date';

export interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
  disabled?: boolean;
}

export function NotificationItem({ notification, onPress, disabled }: NotificationItemProps) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: notification.read ? colors.backgroundElement : colors.backgroundSelected,
          borderColor: colors.border,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Avatar uri={notification.actor?.avatarUrl} size={44} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {notification.title}
          </ThemedText>
          {!notification.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
        </View>

        <ThemedText themeColor="textSecondary" style={styles.body} numberOfLines={3}>
          {notification.body}
        </ThemedText>

        <View style={styles.footerRow}>
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={1} style={styles.actor}>
            {notification.actor?.name ?? t('notifications.system')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {formatRelativeTime(notification.createdAt)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    ...CardShadow,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontWeight: 700,
    lineHeight: 22,
  },
  body: {
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actor: {
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
});
