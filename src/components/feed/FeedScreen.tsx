import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  IconButton,
  Surface,
  Chip,
  Divider,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { LocationShare } from '../common/LocationShare';
import { MediaPicker } from '../common/MediaPicker';
import { PostEnhancer } from '../common/PostEnhancer';
import { PlaceholderImage } from '../common/PlaceholderImage';
import ResponsiveContainer from '../common/ResponsiveContainer';
import { ToastOptimized } from '../common/ToastOptimized';
import LoadingSpinner from '../common/LoadingSpinner';
import { debounce } from '../../utils/performance';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService } from '../../services/databaseService';
import { PostService, Post } from '../../services/postService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { NotificationService } from '../../services/notificationService';
import { FeedCardOptimized } from './FeedCardOptimized';
import { CreatePostOptimized } from './CreatePostOptimized';

const { width } = Dimensions.get('window');

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
}

interface Comment {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

// Using Post interface from PostService

const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();
  const navigation = useNavigation();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'info' });
  };

  // Load posts from PostService
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const postsData = await PostService.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load posts on component mount
  useEffect(() => {
    // Loading posts (silent in production)
    loadPosts();
  }, [loadPosts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  // Handle join meetup
  const handleJoinMeetup = (postId: string) => {
    if (!user) {
      showToast('Please sign in to join meetups', 'warning');
      (navigation as any).navigate('Login');
      return;
    }
    
    setPosts(posts.map(post => {
      if (post.id === postId && post.meetupDetails) {
        return {
          ...post,
          meetupDetails: {
            ...post.meetupDetails,
            currentPeople: Math.min(post.meetupDetails.currentPeople + 1, post.meetupDetails.maxPeople),
          },
        };
      }
      return post;
    }));
    showToast('Successfully joined the meetup!', 'success');
  };

  // Handle comment click
  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }
    
    if (!user) {
      showToast('Please sign in to comment', 'warning');
      return;
    }

    try {
      const comment = await DatabaseService.createComment({
        post_id: selectedPostId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (comment) {
        setPosts(posts.map(post => {
          if (post.id === selectedPostId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: comment.id,
                  userId: comment.user_id,
                  userNickname: user.nickname,
                  userAvatar: user.avatar_url || '',
                  content: comment.content,
                  createdAt: comment.created_at,
                },
              ],
            };
          }
          return post;
        }));

        // Send notification to post owner
        const selectedPost = posts.find(post => post.id === selectedPostId);
        if (selectedPost && selectedPost.userId !== user?.id) {
          await NotificationService.notifyPostComment(
            selectedPostId,
            selectedPost.userId,
            user?.id || '',
            user?.nickname || 'Unknown User',
            newComment.trim()
          );
        }

        setNewComment('');
        showToast('Comment added successfully!', 'success');
        // Comment added to UI (silent in production)
      }
    } catch (error) {
      console.error('🔍 Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
  };

  // Handle like post
  const handleLikePost = async (postId: string) => {
    try {
      const success = await DatabaseService.likePost(postId);
      if (success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes + 1 };
          }
          return post;
        }));
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
        const transformedPost: Post = {
          id: newPost.id,
          userId: newPost.user_id,
          userNickname: user.nickname,
          userAvatar: user.avatar_url || '',
          content: newPost.content,
          location: newPost.location?.city || 'Unknown Location',
          locationDetails: newPost.location ? {
            name: newPost.location.city,
            address: `${newPost.location.city}, ${newPost.location.country}`,
            coordinates: {
              latitude: newPost.location.latitude,
              longitude: newPost.location.longitude,
            },
          } : undefined,
          media: newPost.media_urls?.map((url, index) => ({
            id: `${newPost.id}-media-${index}`,
            uri: url,
            type: 'image' as const,
            filename: `media-${index}.jpg`,
            size: 0,
          })) || [],
          isMeetupRequest: !!newPost.meetup_details,
          meetupDetails: newPost.meetup_details ? {
            title: newPost.meetup_details.title,
            date: newPost.meetup_details.date_time,
            location: `${newPost.meetup_details.location.city}, ${newPost.meetup_details.location.country}`,
            maxPeople: newPost.meetup_details.max_participants,
            currentPeople: newPost.meetup_details.current_participants,
          } : undefined,
          likes: newPost.likes,
          comments: newPost.comments || [],
          createdAt: newPost.created_at,
          tags: [],
          emotion: undefined,
          topic: undefined,
        };

        setPosts([transformedPost, ...posts]);
        setModalVisible(false);
        showToast('Post created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Failed to create post', 'error');
    }
  };

  if (loading) {
    // Loading state, showing spinner (silent in production)
    return (
      <ResponsiveContainer>
        <LoadingSpinner visible={true} />
      </ResponsiveContainer>
    );
  }

      // Rendering with posts (silent in production)

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
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
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
                <ScrollView style={{ maxHeight: 300 }}>
                  {posts.find(p => p.id === selectedPostId)?.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
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
                  ))}
                </ScrollView>
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
    borderRadius: borderRadius.md,
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
    borderRadius: borderRadius.md,
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
});

export default FeedScreen;
