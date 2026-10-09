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
import { CardShadow, Radii, Spacing } from '@/constants/theme';
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

      {post.dogIds.length > 0 || post.trainingSessionId || post.physicalActivityId ? (
        <View style={styles.tagRow}>
          {post.dogIds.map((postDogId, index) => (
            <Tag
              key={postDogId}
              icon="paw"
              label={post.dogNames[index] ?? t('posts.dogFallback')}
              onPress={() => router.push(isOwnPost ? `/dog/${postDogId}` : `/dog/${postDogId}/public`)}
            />
          ))}
          {post.trainingSessionId ? (
            <Tag
              icon="barbell-outline"
              label={t('posts.sessionTag')}
              onPress={() =>
                router.push(isOwnPost ? `/session/${post.trainingSessionId}` : `/post/${post.id}/session`)
              }
            />
          ) : null}
          {post.physicalActivityId ? (
            <Tag
              icon="footsteps-outline"
              label={t('posts.activityTag')}
              onPress={() =>
                router.push(isOwnPost ? `/activity/${post.physicalActivityId}` : `/post/${post.id}/activity`)
              }
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
 * Renders as a Pressable button (accent-tinted background + border) so it clearly reads as
 * tappable (vs. plain text). Tapping the dog tag always navigates - to the owner's management
 * screen for the post's own author, or the read-only public profile for anyone else.
 */
function Tag({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const colors = useTheme();
  const tintColor = onPress ? colors.primary : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.tag,
        onPress
          ? {
              backgroundColor: colors.primary + (pressed ? '33' : '1f'),
              borderWidth: 1,
              borderColor: colors.primary + '55',
            }
          : null,
      ]}>
      <Ionicons name={icon} size={13} color={tintColor} />
      <ThemedText type="small" style={onPress ? { color: tintColor, fontWeight: '600' } : undefined} themeColor={onPress ? undefined : 'textSecondary'}>
        {label}
      </ThemedText>
      {onPress ? <Ionicons name="chevron-forward" size={11} color={tintColor} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.two,
    ...CardShadow,
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
    gap: 5,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    minHeight: 29,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
});
