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

const { width } = Dimensions.get('window');

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
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
  comments: number;
  createdAt: string;
  tags: string[];
  emotion?: string;
  topic?: string;
}

const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();
  const navigation = useNavigation();

  const [posts, setPosts] = useState<Post[]>(() => [
    {
      id: '1',
      userId: '1',
      userNickname: 'Sarah',
      userAvatar: '',
      content: 'Just arrived in Bali! The weather is perfect for some beach time. Anyone up for a sunset surf session?',
      location: 'Canggu, Bali',
      locationDetails: {
        name: 'Canggu Beach',
        address: 'Canggu, Bali, Indonesia',
        coordinates: { latitude: -8.6500, longitude: 115.1333 },
      },
      media: [
        {
          id: '1',
          uri: '',
          type: 'image',
          filename: 'beach_view.jpg',
          size: 1024000,
        },
      ],
      isMeetupRequest: false,
      likes: 15,
      comments: 5,
      createdAt: '2 hours ago',
      tags: ['Bali', 'Beach', 'Surfing'],
      emotion: 'excited',
      topic: 'travel',
    },
    {
      id: '2',
      userId: '2',
      userNickname: 'Alex',
      userAvatar: '',
      content: 'Working from this amazing coworking space with ocean views. The wifi is lightning fast!',
      location: 'Uluwatu, Bali',
      locationDetails: {
        name: 'Uluwatu Beach',
        address: 'Uluwatu, Bali, Indonesia',
        coordinates: { latitude: -8.8167, longitude: 115.0833 },
      },
      isMeetupRequest: false,
      likes: 24,
      comments: 8,
      createdAt: '4 hours ago',
      tags: ['Coworking', 'Ocean View', 'Uluwatu'],
      emotion: 'productive',
      topic: 'work',
    },
    {
      id: '3',
      userId: '3',
      userNickname: 'Mike',
      userAvatar: '',
      content: 'Working from a beautiful cafe in Seminyak. Great coffee and even better wifi! Anyone want to join for lunch?',
      location: 'Seminyak, Bali',
      locationDetails: {
        name: 'Seminyak Cafe',
        address: 'Seminyak, Bali, Indonesia',
        coordinates: { latitude: -8.6833, longitude: 115.1667 },
      },
      isMeetupRequest: true,
      meetupDetails: {
        title: 'Lunch Meetup',
        date: 'Today, 1:00 PM',
        location: 'Seminyak Cafe',
        maxPeople: 4,
        currentPeople: 1,
      },
      likes: 8,
      comments: 3,
      createdAt: '6 hours ago',
      tags: ['Cafe', 'Lunch', 'Seminyak'],
      emotion: 'happy',
      topic: 'food',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationShareVisible, setLocationShareVisible] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    isMeetupRequest: false,
    meetupTitle: '',
    meetupDate: '',
    meetupLocation: '',
    maxPeople: 4,
    location: '',
    locationDetails: null as any,
    media: [] as MediaItem[],
    tags: [] as string[],
    emotion: '',
    topic: '',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Handle like post
  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
    showToast('Post liked!', 'success');
  };

  // Handle join meetup
  const handleJoinMeetup = (postId: string) => {
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
    showToast('Joined meetup!', 'success');
  };

  // Handle location selection from LocationShare component
  const handleLocationSelect = (location: any) => {
    setNewPost({
      ...newPost,
      location: location.address,
      locationDetails: location,
    });
    setLocationShareVisible(false);
    showToast('Location selected!', 'success');
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem[]) => {
    setNewPost({
      ...newPost,
      media,
    });
  };

  // Handle tags change
  const handleTagsChange = (tags: string[]) => {
    setNewPost({
      ...newPost,
      tags,
    });
  };

  // Handle emotion change
  const handleEmotionChange = (emotion: string) => {
    setNewPost({
      ...newPost,
      emotion,
    });
  };

  // Handle topic change
  const handleTopicChange = (topic: string) => {
    setNewPost({
      ...newPost,
      topic,
    });
  };

  // Handle create post
  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      showToast('Please enter some content', 'warning');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      userId: user?.id || '1',
      userNickname: user?.nickname || 'Anonymous',
              userAvatar: user?.avatar_url || '',
      content: newPost.content,
      location: newPost.location,
      locationDetails: newPost.locationDetails,
      media: newPost.media,
      isMeetupRequest: newPost.isMeetupRequest,
      meetupDetails: newPost.isMeetupRequest ? {
        title: newPost.meetupTitle,
        date: newPost.meetupDate,
        location: newPost.meetupLocation,
        maxPeople: newPost.maxPeople,
        currentPeople: 1,
      } : undefined,
      likes: 0,
      comments: 0,
      createdAt: 'Just now',
      tags: newPost.tags,
      emotion: newPost.emotion,
      topic: newPost.topic,
    };

    setPosts([post, ...posts]);
    setNewPost({
      content: '',
      isMeetupRequest: false,
      meetupTitle: '',
      meetupDate: '',
      meetupLocation: '',
      maxPeople: 4,
      location: '',
      locationDetails: null,
      media: [],
      tags: [],
      emotion: '',
      topic: '',
    });
    setModalVisible(false);
    showToast('Post created successfully!', 'success');
  };

  const renderMediaGrid = (media: MediaItem[]) => {
    if (!media || media.length === 0) return null;

    return (
      <View style={styles.mediaGrid}>
        {media.map((item, index) => (
          <Surface key={item.id} style={styles.mediaItem}>
            {item.uri ? (
              <Image source={{ uri: item.uri }} style={styles.mediaImage} />
            ) : (
              <PlaceholderImage 
                width={styles.mediaItem.width} 
                height={styles.mediaItem.height}
                text={item.filename || 'Media'}
                backgroundColor="#f1f5f9"
                textColor="#64748b"
              />
            )}
            {item.type === 'video' && (
              <View style={styles.videoOverlay}>
                <IconButton icon="play" size={20} iconColor="#ffffff" />
              </View>
            )}
          </Surface>
        ))}
      </View>
    );
  };

  const getEmotionEmoji = (emotion: string) => {
    const emotionMap: Record<string, string> = {
      happy: '😊',
      excited: '🤩',
      relaxed: '😌',
      inspired: '✨',
      grateful: '🙏',
      adventurous: '🏔️',
      productive: '💪',
      creative: '🎨',
    };
    return emotionMap[emotion] || '';
  };

  if (!user) {
    return (
      <ResponsiveContainer>
        <Card style={styles.guestCard}>
          <Card.Content>
            <Title style={styles.guestTitle}>Welcome to NomadNow!</Title>
            <Paragraph style={styles.guestSubtitle}>
              Join our community of digital nomads to discover amazing places, connect with fellow travelers, and share your adventures.
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate('Login')}
              style={styles.guestButton}
            >
              Sign In to Start Sharing
            </Button>
          </Card.Content>
        </Card>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {posts.map((post) => (
            <Card key={post.id} style={styles.postCard}>
              <Card.Content>
                <View style={styles.postHeader}>
                  {post.userAvatar ? (
                    <Avatar.Image size={40} source={{ uri: post.userAvatar }} />
                  ) : (
                    <Avatar.Text 
                      size={40} 
                      label={post.userNickname.charAt(0).toUpperCase()}
                      style={{ backgroundColor: '#6366f1' }}
                    />
                  )}
                  <View style={styles.postHeaderInfo}>
                    <Title style={styles.postAuthor}>{post.userNickname}</Title>
                    <View style={styles.postMeta}>
                      <Paragraph style={styles.postTime}>{post.createdAt}</Paragraph>
                      {post.location && (
                        <Paragraph style={styles.postLocation}>📍 {post.location}</Paragraph>
                      )}
                      {post.emotion && (
                        <Paragraph style={styles.postEmotion}>
                          {getEmotionEmoji(post.emotion)}
                        </Paragraph>
                      )}
                    </View>
                  </View>
                </View>

                <Paragraph style={styles.postContent}>{post.content}</Paragraph>

                {/* Media Grid */}
                {renderMediaGrid(post.media || [])}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {post.tags.map((tag, index) => (
                      <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                        #{tag}
                      </Chip>
                    ))}
                  </View>
                )}

                {/* Topic Badge */}
                {post.topic && (
                  <Chip icon="folder" style={styles.topicChip} textStyle={styles.topicText}>
                    {post.topic}
                  </Chip>
                )}

                {post.isMeetupRequest && post.meetupDetails && (
                  <Card style={styles.meetupCard}>
                    <Card.Content>
                      <Title style={styles.meetupTitle}>{post.meetupDetails.title}</Title>
                      <Paragraph style={styles.meetupDetails}>
                        📅 {post.meetupDetails.date} • 📍 {post.meetupDetails.location}
                      </Paragraph>
                      <Paragraph style={styles.meetupPeople}>
                        👥 {post.meetupDetails.currentPeople}/{post.meetupDetails.maxPeople} people
                      </Paragraph>
                      <Button
                        mode="outlined"
                        onPress={() => handleJoinMeetup(post.id)}
                        disabled={post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople}
                        style={styles.joinButton}
                      >
                        {post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople ? 'Full' : 'Join Meetup'}
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                <Divider style={styles.divider} />

                <View style={styles.postActions}>
                  <Button
                    mode="text"
                    onPress={() => handleLike(post.id)}
                    icon="heart"
                    labelStyle={styles.actionLabel}
                  >
                    {post.likes}
                  </Button>
                  <Button
                    mode="text"
                    icon="comment"
                    labelStyle={styles.actionLabel}
                  >
                    {post.comments}
                  </Button>
                  <Button
                    mode="text"
                    icon="share"
                    labelStyle={styles.actionLabel}
                  >
                    Share
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ResponsiveContainer>
    );
  }

  return (
    <View style={styles.container}>
      <ResponsiveContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Guest Card for non-logged in users */}
          {!user && (
            <Card style={styles.guestCard}>
              <Card.Content>
                <Title style={styles.guestTitle}>Welcome to NomadNow! 🌍</Title>
                <Paragraph style={styles.guestSubtitle}>
                  Discover amazing digital nomads and connect with fellow travelers around the world
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => (navigation as any).navigate('Login')}
                  style={styles.guestButton}
                  contentStyle={styles.guestButtonContent}
                >
                  Sign In to Start Sharing
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Posts List */}
          {posts.map((post) => (
            <Card key={post.id} style={styles.postCard}>
              <Card.Content>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Avatar.Text 
                    size={48} 
                    label={post.userNickname.charAt(0).toUpperCase()}
                    style={{ backgroundColor: colors.primary }}
                  />
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postAuthor}>{post.userNickname}</Text>
                    <View style={styles.postMeta}>
                      <Text style={styles.postTime}>{post.createdAt}</Text>
                      <Text style={styles.postLocation}>📍 {post.location}</Text>
                      {post.emotion && (
                        <Text style={styles.postEmotion}>
                          {post.emotion === 'happy' ? '😊' : 
                           post.emotion === 'productive' ? '💪' : 
                           post.emotion === 'relaxed' ? '😌' : '😊'}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Post Content */}
                <Paragraph style={styles.postContent}>{post.content}</Paragraph>

                {/* Media Grid */}
                {post.media && post.media.length > 0 && (
                  <View style={styles.mediaGrid}>
                    {post.media.map((media, index) => (
                      <View key={index} style={styles.mediaItem}>
                        <Image
                          source={{ uri: media.uri }}
                          style={styles.mediaImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                )}

                {/* Meetup Card */}
                {post.isMeetupRequest && post.meetupDetails && (
                  <Card style={styles.meetupCard}>
                    <Card.Content>
                      <Title style={styles.meetupTitle}>{post.meetupDetails.title}</Title>
                      <Paragraph style={styles.meetupDetails}>
                        📅 {post.meetupDetails.date}
                      </Paragraph>
                      <Paragraph style={styles.meetupDetails}>
                        📍 {post.meetupDetails.location}
                      </Paragraph>
                      <Paragraph style={styles.meetupPeople}>
                        👥 {post.meetupDetails.currentPeople}/{post.meetupDetails.maxPeople} people
                      </Paragraph>
                      <Button
                        mode="outlined"
                        onPress={() => handleJoinMeetup(post.id)}
                        style={styles.joinButton}
                      >
                        Join Meetup
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {post.tags.map((tag, index) => (
                      <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <Button
                    mode="text"
                    onPress={() => handleLike(post.id)}
                    icon="heart"
                  >
                    {post.likes}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {/* Handle comment */}}
                    icon="comment"
                  >
                    {post.comments}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {/* Handle share */}}
                    icon="share"
                  >
                    Share
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

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
                
                <TextInput
                  label="What's on your mind?"
                  value={newPost.content}
                  onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.textInput}
                />

                <Button
                  mode="outlined"
                  onPress={() => setLocationShareVisible(true)}
                  icon="map-marker"
                  style={styles.locationButton}
                  labelStyle={styles.locationButtonLabel}
                >
                  {newPost.location || 'Add Location'}
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setNewPost({ ...newPost, isMeetupRequest: !newPost.isMeetupRequest })}
                  icon={newPost.isMeetupRequest ? "calendar-check" : "calendar-plus"}
                  style={styles.toggleButton}
                  labelStyle={styles.toggleButtonLabel}
                >
                  {newPost.isMeetupRequest ? 'Remove Meetup Request' : 'Add Meetup Request'}
                </Button>

                {newPost.isMeetupRequest && (
                  <View style={styles.meetupForm}>
                    <TextInput
                      label="Meetup Title"
                      value={newPost.meetupTitle}
                      onChangeText={(text) => setNewPost({ ...newPost, meetupTitle: text })}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Date & Time"
                      value={newPost.meetupDate}
                      onChangeText={(text) => setNewPost({ ...newPost, meetupDate: text })}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Location"
                      value={newPost.meetupLocation}
                      onChangeText={(text) => setNewPost({ ...newPost, meetupLocation: text })}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Max People"
                      value={newPost.maxPeople.toString()}
                      onChangeText={(text) => setNewPost({ ...newPost, maxPeople: parseInt(text) || 4 })}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.textInput}
                    />
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleCreatePost}
                    style={[styles.modalButton, styles.createButton]}
                  >
                    Create Post
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* Location Share Modal */}
        <LocationShare
          visible={locationShareVisible}
          onDismiss={() => setLocationShareVisible(false)}
          onLocationSelect={handleLocationSelect}
          mode="select"
        />

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </ResponsiveContainer>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

export default React.memo(FeedScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  guestCard: {
    margin: spacing.base,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    ...shadowPresets.card,
  },
  guestTitle: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  guestSubtitle: {
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    opacity: 0.9,
    fontSize: 16,
    lineHeight: 24,
  },
  guestButton: {
    marginTop: spacing.base,
    backgroundColor: colors.white,
    color: colors.primary,
    borderRadius: borderRadius.lg,
    ...shadowPresets.small,
  },
  guestButtonContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  postCard: {
    margin: spacing.base,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadowPresets.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  postHeaderInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  postAuthor: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  postTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.base,
  },
  postLocation: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  postEmotion: {
    fontSize: 18,
    marginLeft: spacing.xs,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  mediaItem: {
    width: (width - spacing.base * 4) / 3,
    height: (width - spacing.base * 4) / 3,
    margin: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  tag: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray100,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  topicChip: {
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  topicText: {
    color: colors.white,
    fontSize: 12,
  },
  meetupCard: {
    backgroundColor: colors.gray50,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
    marginBottom: spacing.md,
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
  textInput: {
    marginBottom: spacing.md,
  },
  locationButton: {
    marginBottom: spacing.md,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  locationButtonLabel: {
    color: colors.primary,
  },
  toggleButton: {
    marginBottom: spacing.md,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  toggleButtonLabel: {
    color: colors.primary,
  },
  meetupForm: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
});
