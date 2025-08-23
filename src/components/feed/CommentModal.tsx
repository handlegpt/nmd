import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  Title,
  Paragraph,
  TextInput,
  Button,
  Avatar,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { DatabaseService } from '../../services/databaseService';
import { Post, Comment } from '../../services/postService';
import { ToastOptimized } from '../common/ToastOptimized';

interface CommentModalProps {
  visible: boolean;
  post: Post | null;
  onDismiss: () => void;
  onCommentAdded?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  post,
  onDismiss,
  onCommentAdded,
}) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Load comments
  const loadComments = async () => {
    if (!post) return;

    setLoading(true);
    try {
      const commentsData = await DatabaseService.getComments(post.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load comments when modal opens
  useEffect(() => {
    if (visible && post) {
      loadComments();
    }
  }, [visible, post]);

  // Submit comment
  const handleSubmitComment = async () => {
    if (!user || !post || !newComment.trim()) {
      showToast('Please login and enter comment content', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      };

      const newCommentData = await DatabaseService.createComment(commentData);
      
      if (newCommentData) {
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        showToast('评论发布成功', 'success');
        onCommentAdded?.();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      showToast('评论发布失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return '刚刚';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
      return `${Math.floor(diffInSeconds / 2592000)}个月前`;
    } catch {
      return '刚刚';
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.headerTitle}>评论</Title>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <Divider />

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Paragraph style={styles.loadingText}>加载评论中...</Paragraph>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Paragraph style={styles.emptyText}>还没有评论，快来抢沙发吧！</Paragraph>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Avatar.Image
                    size={32}
                    source={comment.userAvatar ? { uri: comment.userAvatar } : undefined}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Paragraph style={styles.commentAuthor}>
                        {comment.userNickname}
                      </Paragraph>
                      <Paragraph style={styles.commentTime}>
                        {formatTime(comment.created_at)}
                      </Paragraph>
                    </View>
                    <Paragraph style={styles.commentText}>
                      {comment.content}
                    </Paragraph>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Comment Input */}
          {user && (
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                placeholder="写下你的评论..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.commentInput}
                outlineStyle={styles.inputOutline}
                multiline
                maxLength={500}
                disabled={submitting}
              />
              <Button
                mode="contained"
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                loading={submitting}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                发送
              </Button>
            </View>
          )}

          {!user && (
            <View style={styles.loginPrompt}>
              <Paragraph style={styles.loginText}>
                请先登录后发表评论
              </Paragraph>
            </View>
          )}
        </Surface>

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: spacing.md,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadowPresets.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    margin: 0,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  commentAvatar: {
    marginRight: spacing.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.gray50,
  },
  commentInput: {
    flex: 1,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  inputOutline: {
    borderRadius: borderRadius.lg,
  },
  submitButton: {
    borderRadius: borderRadius.lg,
  },
  submitButtonContent: {
    paddingHorizontal: spacing.md,
  },
  loginPrompt: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.gray50,
  },
  loginText: {
    color: colors.textSecondary,
  },
});

export default CommentModal;
