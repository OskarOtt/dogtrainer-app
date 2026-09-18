import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useToggleLike } from '@/hooks/use-likes';
import { useTheme } from '@/hooks/use-theme';

export interface LikeButtonProps {
  postId: string;
  likeCount: number;
  likedByMe: boolean;
}

/** Heart toggle + count, used on post cards and the post detail screen. */
export function LikeButton({ postId, likeCount, likedByMe }: LikeButtonProps) {
  const colors = useTheme();
  const toggleLike = useToggleLike(postId);

  return (
    <Pressable
      onPress={() => toggleLike.mutate(!likedByMe)}
      hitSlop={8}
      style={styles.row}
      accessibilityLabel={likedByMe ? 'Unlike' : 'Like'}
    >
      <Ionicons name={likedByMe ? 'heart' : 'heart-outline'} size={20} color={likedByMe ? colors.danger : colors.textSecondary} />
      {likeCount > 0 ? <ThemedText themeColor="textSecondary">{likeCount}</ThemedText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: Spacing.one },
});
