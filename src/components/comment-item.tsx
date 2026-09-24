import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { Avatar } from '@/components/avatar';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteComment } from '@/hooks/use-comments';
import { formatRelativeTime } from '@/utils/date';
import type { Comment } from '@/types/comment';

export interface CommentItemProps {
  comment: Comment;
  postId: string;
  /** Whether the current user owns the post (not just the comment) - post owners can moderate. */
  isPostOwner: boolean;
}

/** Single comment row, shown under a post's content and image. */
export function CommentItem({ comment, postId, isPostOwner }: CommentItemProps) {
  const { user } = useAuth();
  const deleteComment = useDeleteComment(postId);
  const canDelete = comment.authorId === user?.id || isPostOwner;

  return (
    <View style={styles.row}>
      <Avatar uri={comment.authorAvatarUrl} size={32} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.authorName} numberOfLines={1}>
            {comment.authorName}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {formatRelativeTime(comment.createdAt)}
          </ThemedText>
        </View>
        <ThemedText style={styles.content}>{comment.content}</ThemedText>
      </View>
      {canDelete ? (
        <ConfirmDialog
          title={t('common.delete')}
          variant="danger"
          loading={deleteComment.isPending}
          style={styles.deleteButton}
          dialogTitle={t('comments.deleteTitle')}
          dialogMessage={t('comments.deleteMessage')}
          confirmLabel={t('common.delete')}
          destructive
          onConfirm={() => deleteComment.mutate(comment.id)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  body: { flex: 1, gap: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  authorName: { fontSize: 14, lineHeight: 18 },
  content: { fontSize: 15, lineHeight: 20 },
  deleteButton: { height: 28, width: 68 },
});
