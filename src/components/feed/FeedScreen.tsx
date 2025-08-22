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
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { debounce } from '../../utils/performance';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService } from '../../services/databaseService';

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

interface Post {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  location: string;
  locationDetails?: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  media?: MediaItem[];
  isMeetupRequest: boolean;
  meetupDetails?: {
    title: string;
    date: string;
    location: string;
    maxPeople: number;
    currentPeople: number;
  };
  likes: number;
  comments: Comment[];
  createdAt: string;
  tags: string[];
  emotion?: string;
  topic?: string;
}

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

  // Load posts from database
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const dbPosts = await DatabaseService.getPosts(20, 0);
      
      // Transform database posts to match our interface
      const transformedPosts: Post[] = dbPosts.map(dbPost => ({
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

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to mock data if database fails
      setPosts([
        {
          id: '1',
          userId: '1',
          userNickname: 'Sarah',
          userAvatar: '',
          content: 'Just arrived in Bali! The weather is perfect for some beach time. Anyone up for a sunset surf session? 🏄‍♀️',
          location: 'Canggu, Bali',
          locationDetails: {
            name: 'Canggu Beach',
            address: 'Canggu, Bali, Indonesia',
            coordinates: { latitude: -8.6500, longitude: 115.1333 },
          },
          media: [],
          isMeetupRequest: false,
          likes: 12,
          comments: [
            {
              id: '1',
              userId: '2',
              userNickname: 'Mike',
              userAvatar: '',
              content: 'Count me in! I\'ll bring my board 🏄‍♂️',
              createdAt: '1 hour ago',
            },
            {
              id: '2',
              userId: '3',
              userNickname: 'Emma',
              userAvatar: '',
              content: 'Sounds amazing! What time should we meet?',
              createdAt: '30 minutes ago',
            },
          ],
          createdAt: '2 hours ago',
          tags: ['bali', 'surfing', 'beach'],
          emotion: 'excited',
          topic: 'Travel',
        },
        {
          id: '2',
          userId: '2',
          userNickname: 'Mike',
          userAvatar: '',
          content: 'Working from a cozy cafe in Chiang Mai. The coffee here is amazing and the wifi is super fast! ☕️',
          location: 'Chiang Mai, Thailand',
          locationDetails: {
            name: 'Cafe Corner',
            address: 'Nimman Road, Chiang Mai, Thailand',
            coordinates: { latitude: 18.7883, longitude: 98.9853 },
          },
          media: [],
          isMeetupRequest: true,
          meetupDetails: {
            title: 'Digital Nomad Meetup',
            date: 'Tomorrow at 6 PM',
            location: 'Cafe Corner, Nimman Road',
            maxPeople: 8,
            currentPeople: 3,
          },
          likes: 8,
          comments: [
            {
              id: '3',
              userId: '3',
              userNickname: 'Emma',
              userAvatar: '',
              content: 'I\'ll be there! Looking forward to meeting everyone ☕️',
              createdAt: '2 hours ago',
            },
          ],
          createdAt: '4 hours ago',
          tags: ['chiangmai', 'cafe', 'work'],
          emotion: 'productive',
          topic: 'Work',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load posts on component mount
  useEffect(() => {
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
    if (!newComment.trim() || !user) return;

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
    return (
      <ResponsiveContainer>
        <LoadingSpinner visible={true} />
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
