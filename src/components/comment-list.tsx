import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CommentItem } from '@/components/comment-item';
import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useComments, useCreateComment } from '@/hooks/use-comments';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export interface CommentListProps {
  postId: string;
  /** Whether the current user owns the post - post owners can delete anyone's comment on it. */
  isPostOwner: boolean;
}

/** Comment thread + add-comment input, shown at the bottom of the post detail screen. */
export function CommentList({ postId, isPostOwner }: CommentListProps) {
  const colors = useTheme();
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment(postId);
  const [content, setContent] = useState('');
  // FormTextInput is uncontrolled (only takes a defaultValue), so clearing `content` alone
  // doesn't clear what's rendered - bump this key to force it to remount with a fresh value.
  const [inputKey, setInputKey] = useState(0);

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }
    createComment.mutate(
      { content: trimmed },
      {
        onSuccess: () => {
          setContent('');
          setInputKey((key) => key + 1);
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Comments</ThemedText>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : comments && comments.length > 0 ? (
        <View style={styles.list}>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} isPostOwner={isPostOwner} />
          ))}
        </View>
      ) : (
        <ThemedText themeColor="textSecondary">No comments yet.</ThemedText>
      )}

      <View style={styles.composer}>
        <FormTextInput
          key={inputKey}
          defaultValue={content}
          onChangeText={setContent}
          placeholder="Add a comment..."
          style={styles.input}
        />
        {createComment.isError ? (
          <ThemedText themeColor="danger" style={styles.error}>
            {getApiErrorMessage(createComment.error, 'Could not post this comment.')}
          </ThemedText>
        ) : null}
        <PrimaryButton title="Post" onPress={handleSubmit} loading={createComment.isPending} disabled={!content.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  list: { gap: Spacing.three },
  composer: { gap: Spacing.one },
  input: { flex: 1 },
  error: { fontSize: 14 },
});
