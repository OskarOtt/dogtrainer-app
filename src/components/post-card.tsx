import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { LikeButton } from '@/components/like-button';
import { ReportPostSheet } from '@/components/report-post-sheet';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeletePost } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import type { Post } from '@/types/post';
import { formatRelativeTime } from '@/utils/date';
import { ensureMediaUri } from '@/utils/media';

export interface PostCardProps {
  post: Post;
  /** Override the content tap (e.g. no-op on the post's own detail screen). */
  onPress?: () => void;
  /** Called after a successful delete, e.g. so the detail screen can navigate back. */
  onDeleted?: () => void;
}

/** Card summarizing a post for use in the Feed, a user's post list, and the post detail screen. */
export function PostCard({ post, onPress, onDeleted }: PostCardProps) {
  const router = useRouter();
  const colors = useTheme();
  const { user } = useAuth();
  const deletePost = useDeletePost();
  const isOwnPost = post.authorId === user?.id;
  const [isReportSheetVisible, setIsReportSheetVisible] = useState(false);

  function goToAuthor() {
    router.push(isOwnPost ? '/(tabs)/profile' : `/user/${post.authorId}`);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={goToAuthor} style={styles.authorRow} hitSlop={4}>
          <Avatar uri={post.authorAvatarUrl} size={40} />
          <View style={styles.authorInfo}>
            <ThemedText type="subtitle" style={styles.authorName} numberOfLines={1}>
              {post.authorName}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {formatRelativeTime(post.createdAt)}
            </ThemedText>
          </View>
        </Pressable>

        {isOwnPost ? (
          <ConfirmDialog
            title={t('common.delete')}
            variant="danger"
            loading={deletePost.isPending}
            style={styles.deleteButton}
            dialogTitle={t('posts.deleteTitle')}
            dialogMessage={t('posts.deleteMessage')}
            confirmLabel={t('common.delete')}
            destructive
            onConfirm={() =>
              deletePost.mutate({ id: post.id, authorId: post.authorId }, { onSuccess: onDeleted })
            }
          />
        ) : (
          <Pressable
            onPress={() => setIsReportSheetVisible(true)}
            hitSlop={8}
            style={styles.reportButton}
            accessibilityLabel={t('posts.reportOrBlock')}
          >
            <Ionicons name="alert-circle-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Pressable onPress={onPress ?? (() => router.push(`/post/${post.id}`))}>
        <ThemedText style={styles.content}>{post.content}</ThemedText>
        {post.imageUrl ? <Image source={{ uri: ensureMediaUri(post.imageUrl) }} style={styles.image} contentFit="cover" /> : null}
      </Pressable>

      {post.dogId || post.trainingSessionId ? (
        <View style={styles.tagRow}>
          {post.dogId ? (
            <Tag
              icon="paw"
              label={post.dogName ?? t('posts.dogFallback')}
              onPress={isOwnPost ? () => router.push(`/dog/${post.dogId}`) : undefined}
            />
          ) : null}
          {post.trainingSessionId ? (
            <Tag
              icon="barbell-outline"
              label={t('posts.sessionTag')}
              onPress={isOwnPost ? () => router.push(`/session/${post.trainingSessionId}`) : undefined}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.engagementRow}>
        <LikeButton postId={post.id} likeCount={post.likeCount} likedByMe={post.likedByMe} />
        <Pressable
          onPress={onPress ?? (() => router.push(`/post/${post.id}`))}
          hitSlop={8}
          style={styles.row}
          accessibilityLabel={t('posts.commentsAccessibility')}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          {post.commentCount > 0 ? <ThemedText themeColor="textSecondary">{post.commentCount}</ThemedText> : null}
        </Pressable>
      </View>

      {!isOwnPost ? (
        <ReportPostSheet
          visible={isReportSheetVisible}
          onClose={() => setIsReportSheetVisible(false)}
          postId={post.id}
          authorId={post.authorId}
          authorName={post.authorName}
        />
      ) : null}
    </View>
  );
}

/**
 * Renders as a Pressable link only when `onPress` is given. Dogs and training sessions are
 * only viewable through the app by their owner (`GET /dogs/{id}` and `GET /training-sessions/{id}`
 * both 403 for anyone else) — so tags on someone else's post show the same label but aren't links.
 */
function Tag({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const colors = useTheme();

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.tag} hitSlop={4}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  authorInfo: { flex: 1, gap: 2 },
  authorName: { fontSize: 15, lineHeight: 20 },
  deleteButton: { height: 32, width: 76 },
  reportButton: { padding: Spacing.one },
  content: { fontSize: 16, lineHeight: 22 },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radii.medium, marginTop: Spacing.one },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  engagementRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
});
