import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFollowing } from '@/hooks/use-follows';
import { useTheme } from '@/hooks/use-theme';
import type { User } from '@/types/auth';

export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const { data: following, isLoading } = useFollowing(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('social.following') }} />
      <FlatList
        data={following ?? []}
        keyExtractor={(item: User) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: User }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/user/${item.id}`)}>
            <Avatar uri={item.avatarUrl} size={44} />
            <View style={styles.info}>
              <ThemedText numberOfLines={1}>{item.name}</ThemedText>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title={t('social.notFollowing')} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  info: { flex: 1 },
});
