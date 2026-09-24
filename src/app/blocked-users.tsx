import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBlockedUsers, useUnblockUser } from '@/hooks/use-users';
import { useTheme } from '@/hooks/use-theme';
import type { PublicUser } from '@/types/user';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('social.blockedUsers') }} />
      <FlatList
        data={blockedUsers ?? []}
        keyExtractor={(item: PublicUser) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: PublicUser }) => (
          <View style={styles.row}>
            <Pressable style={styles.info} onPress={() => router.push(`/user/${item.id}`)}>
              <Avatar uri={item.avatarUrl} size={44} />
              <ThemedText numberOfLines={1}>{item.name}</ThemedText>
            </Pressable>
            <Pressable onPress={() => unblockUser.mutate(item.id)} hitSlop={8}>
              <ThemedText themeColor="primary" type="small">
                {t('common.unblock')}
              </ThemedText>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="ban-outline" title={t('social.noBlockedUsers')} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  info: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flex: 1 },
});
