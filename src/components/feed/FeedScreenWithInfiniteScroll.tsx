import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Button,
  FAB,
  Surface,
  Chip,
  Divider,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { PostEnhancer } from '../common/PostEnhancer';
import ResponsiveContainer from '../common/ResponsiveContainer';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService } from '../../services/databaseService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Post, Comment, MediaItem } from '../../types';

const FeedScreenWithInfiniteScroll: React.FC = () => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();
  const navigation = useNavigation();

  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use infinite scroll for posts
  const {
    data: posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useInfiniteScroll({
    fetchFunction: async (page: number, limit: number) => {
      const offset = page * limit;
      // Fetching page data (silent in production)
      const dbPosts = await DatabaseService.getPosts(limit, offset);
      
      // Transform database posts to match our interface
      return dbPosts.map(dbPost => ({
        id: dbPost.id,
        userId: dbPost.user_id,
        userNickname: dbPost.users?.nickname || 'Unknown User',
        userAvatar: dbPost.users?.avatar_url || '',
        content: dbPost.content,
        location: dbPost.location?.city || 'Unknown Location',
        locationDetails: dbPost.location ? {
          name: dbPost.location.city,
          address: `${dbPost.location.city}, ${dbPost.location.country}`,
          coordinates: {
            latitude: dbPost.location.latitude,
            longitude: dbPost.location.longitude,
          },
        } : undefined,
        media: dbPost.media_urls?.map((url, index) => ({
          id: `${dbPost.id}-media-${index}`,
          uri: url,
          type: 'image' as const,
          filename: `media-${index}.jpg`,
          size: 0,
        })) || [],
        isMeetupRequest: !!dbPost.meetup_details,
        meetupDetails: dbPost.meetup_details ? {
          title: dbPost.meetup_details.title,
          date: dbPost.meetup_details.date_time,
          location: `${dbPost.meetup_details.location.city}, ${dbPost.meetup_details.location.country}`,
          maxPeople: dbPost.meetup_details.max_participants,
          currentPeople: dbPost.meetup_details.current_participants,
        } : undefined,
        likes: dbPost.likes,
        comments: dbPost.comments?.map(comment => ({
          id: comment.id,
          userId: comment.user_id,
          userNickname: comment.user?.nickname || 'Unknown User',
          userAvatar: comment.user?.avatar_url || '',
          content: comment.content,
          createdAt: comment.created_at,
        })) || [],
        createdAt: dbPost.created_at,
        tags: [], // TODO: Add tags support
        emotion: undefined,
        topic: undefined,
      }));
    },
    limit: 10
  });
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Handle join meetup
  const handleJoinMeetup = (postId: string) => {
    if (!user) {
      showToast('Please sign in to join meetups', 'warning');
      (navigation as any).navigate('Login');
      return;
    }
    
    // TODO: Update posts state in infinite scroll hook
    showToast('Successfully joined the meetup!', 'success');
  };

  // Handle comment click
  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) {
      showToast('Please enter a comment and sign in', 'warning');
      return;
    }

    try {
      const comment = await DatabaseService.createComment({
        post_id: selectedPostId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (comment) {
        // TODO: Update posts state in infinite scroll hook
        setNewComment('');
        showToast('Comment added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
  };

  // Handle like post
  const handleLikePost = async (postId: string) => {
    try {
      const success = await DatabaseService.likePost(postId);
      if (success) {
        // TODO: Update posts state in infinite scroll hook
        showToast('Post liked!', 'success');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle create post
  const handleCreatePost = async (postData: any) => {
    if (!user) return;

    try {
      const newPost = await DatabaseService.createPost({
        user_id: user.id,
        content: postData.content,
        media_urls: postData.media?.map((item: MediaItem) => item.uri) || [],
        location: postData.locationDetails ? {
          latitude: postData.locationDetails.coordinates.latitude,
          longitude: postData.locationDetails.coordinates.longitude,
          city: postData.locationDetails.name,
          country: postData.locationDetails.address.split(', ').pop() || '',
        } : undefined,
        meetup_details: postData.isMeetupRequest ? {
          title: postData.meetupDetails.title,
          date_time: postData.meetupDetails.date,
          location: {
            latitude: postData.locationDetails?.coordinates?.latitude || 0,
            longitude: postData.locationDetails?.coordinates?.longitude || 0,
            city: postData.locationDetails?.name || '',
            country: postData.locationDetails?.address?.split(', ').pop() || '',
          },
          max_participants: postData.meetupDetails.maxPeople,
          current_participants: 1,
        } : undefined,
        likes: 0,
        comments: [],
      });

      if (newPost) {
        setModalVisible(false);
        showToast('Post created successfully!', 'success');
        // Refresh to show new post
        await refresh();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Failed to create post', 'error');
    }
  };

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Render footer for loading more
  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>No more posts to load</Text>
        </View>
      );
    }

    if (loading && posts.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerText}>Loading more posts...</Text>
        </View>
      );
    }

    return null;
  };

  if (loading && posts.length === 0) {
    return (
      <ResponsiveContainer>
        <LoadingSpinner visible={true} />
      </ResponsiveContainer>
    );
  }

  if (error && posts.length === 0) {
    return (
      <ResponsiveContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button mode="contained" onPress={refresh} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.postCard}>
              <Card.Content>
                <View style={styles.postHeader}>
                  <Avatar.Image
                    size={40}
                    source={item.userAvatar ? { uri: item.userAvatar } : undefined}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Title style={styles.userName}>{item.userNickname}</Title>
                    <Paragraph style={styles.postMeta}>
                      {item.location} • {item.createdAt}
                    </Paragraph>
                  </View>
                </View>

                <Paragraph style={styles.postContent}>{item.content}</Paragraph>

                {item.media && item.media.length > 0 && (
                  <View style={styles.mediaContainer}>
                    {item.media.map((media) => (
                      <Image
                        key={media.id}
                        source={{ uri: media.uri }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}

                {item.isMeetupRequest && item.meetupDetails && (
                  <Surface style={styles.meetupCard}>
                    <Title style={styles.meetupTitle}>{item.meetupDetails.title}</Title>
                    <Paragraph style={styles.meetupDetails}>
                      📅 {item.meetupDetails.date}
                    </Paragraph>
                    <Paragraph style={styles.meetupDetails}>
                      📍 {item.meetupDetails.location}
                    </Paragraph>
                    <Paragraph style={styles.meetupPeople}>
                      👥 {item.meetupDetails.currentPeople}/{item.meetupDetails.maxPeople} people
                    </Paragraph>
                    <Button
                      mode="outlined"
                      onPress={() => handleJoinMeetup(item.id)}
                      style={styles.joinButton}
                      disabled={item.meetupDetails.currentPeople >= item.meetupDetails.maxPeople}
                    >
                      {item.meetupDetails.currentPeople >= item.meetupDetails.maxPeople
                        ? 'Full'
                        : 'Join Meetup'}
                    </Button>
                  </Surface>
                )}

                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} style={styles.tag} textStyle={styles.tagText}>
                        #{tag}
                      </Chip>
                    ))}
                  </View>
                )}

                <Divider style={styles.divider} />

                <View style={styles.postActions}>
                  <Button
                    mode="text"
                    onPress={() => handleLikePost(item.id)}
                    icon="heart"
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionLabel}>{item.likes}</Text>
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleCommentClick(item.id)}
                    icon="comment"
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionLabel}>{item.comments.length}</Text>
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {}}
                    icon="share"
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionLabel}>Share</Text>
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
          refreshControl={
            <RefreshControl refreshing={loading && posts.length === 0} onRefresh={refresh} />
          }
          contentContainerStyle={styles.listContainer}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={5}
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />

        {/* Create Post Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title style={styles.modalTitle}>Create New Post</Title>
                <PostEnhancer onSubmit={handleCreatePost} onCancel={() => setModalVisible(false)} />
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* Comment Modal */}
        <Portal>
          <Modal
            visible={commentModalVisible}
            onDismiss={() => setCommentModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title style={styles.modalTitle}>Comments</Title>
                <View style={{ maxHeight: 300 }}>
                  <FlatList
                    data={posts.find(p => p.id === selectedPostId)?.comments || []}
                    keyExtractor={(comment) => comment.id}
                    renderItem={({ item: comment }) => (
                      <View style={styles.commentItem}>
                        <Avatar.Image
                          size={30}
                          source={comment.userAvatar ? { uri: comment.userAvatar } : undefined}
                          style={styles.commentAvatar}
                        />
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUser}>{comment.userNickname}</Text>
                          <Text style={styles.commentText}>{comment.content}</Text>
                          <Text style={styles.commentTime}>{comment.createdAt}</Text>
                        </View>
                      </View>
                    )}
                  />
                </View>
                <View style={styles.commentInput}>
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    style={styles.textInput}
                  />
                  <Button
                    mode="contained"
                    onPress={handleAddComment}
                    disabled={!newComment.trim()}
                    style={styles.addCommentButton}
                  >
                    Add
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.base,
  },
  postCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadowPresets.medium,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  avatar: {
    marginRight: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  postMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  mediaContainer: {
    marginBottom: spacing.base,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.base,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray100,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  meetupCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray50,
  },
  meetupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  meetupDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meetupPeople: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  joinButton: {
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  divider: {
    marginVertical: spacing.lg,
    backgroundColor: colors.gray200,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: spacing.base,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    zIndex: 1000,
    elevation: 8,
    ...shadowPresets.medium,
  },
  modalContainer: {
    margin: 20,
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.base,
    padding: spacing.sm,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.base,
  },
  commentAvatar: {
    marginRight: spacing.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  commentText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  textInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addCommentButton: {
    borderRadius: borderRadius.lg,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  footerText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.base,
  },
});

export default FeedScreenWithInfiniteScroll;
