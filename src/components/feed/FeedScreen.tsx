import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Button,
  FAB,
  Chip,
  Divider,
  IconButton,
  useTheme,
  TextInput,
  Modal,
  Portal,
  Surface,
  List,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { LocationShare } from '../common/LocationShare';
import { MediaPicker } from '../common/MediaPicker';
import { PostEnhancer } from '../common/PostEnhancer';
import { ResponsiveContainer } from '../common/ResponsiveContainer';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

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

export const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useTheme();

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '1',
      userNickname: 'Sarah',
      userAvatar: 'https://via.placeholder.com/50x50/FF6B6B/ffffff?text=S',
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
          uri: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Beach+View',
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
      userAvatar: 'https://via.placeholder.com/50x50/4ECDC4/ffffff?text=A',
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
      userAvatar: 'https://via.placeholder.com/50x50/2196F3/ffffff?text=M',
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
      userAvatar: user?.avatar_url || 'https://via.placeholder.com/50x50/6366f1/ffffff?text=U',
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
            <Image source={{ uri: item.uri }} style={styles.mediaImage} />
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
              onPress={() => {/* Navigate to login */}}
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
                  <Avatar.Image size={40} source={{ uri: post.userAvatar }} />
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
    <ResponsiveContainer>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            <Card.Content>
              <View style={styles.postHeader}>
                <Avatar.Image size={40} source={{ uri: post.userAvatar }} />
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

      {/* Enhanced Create Post Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Share Your Nomad Now</Title>
              
              <TextInput
                label="What's on your mind?"
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                multiline
                numberOfLines={4}
                style={styles.textInput}
                mode="outlined"
                outlineColor="#e5e7eb"
                activeOutlineColor="#6366f1"
              />

              {/* Media Picker */}
              <MediaPicker
                onMediaSelect={handleMediaSelect}
                maxItems={9}
              />

              {/* Post Enhancer */}
              <PostEnhancer
                selectedTags={newPost.tags}
                onTagsChange={handleTagsChange}
                selectedEmotion={newPost.emotion}
                onEmotionChange={handleEmotionChange}
                selectedTopic={newPost.topic}
                onTopicChange={handleTopicChange}
                content={newPost.content}
              />

              {/* Enhanced Location Selection */}
              <Button
                mode="outlined"
                onPress={() => setLocationShareVisible(true)}
                icon="map-marker"
                style={styles.locationButton}
                labelStyle={styles.locationButtonLabel}
              >
                {newPost.location ? newPost.location : 'Add Location'}
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
                    style={styles.textInput}
                    mode="outlined"
                  />
                  <TextInput
                    label="Date & Time"
                    value={newPost.meetupDate}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupDate: text })}
                    style={styles.textInput}
                    mode="outlined"
                  />
                  <TextInput
                    label="Location"
                    value={newPost.meetupLocation}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupLocation: text })}
                    style={styles.textInput}
                    mode="outlined"
                  />
                  <TextInput
                    label="Max People"
                    value={newPost.maxPeople.toString()}
                    onChangeText={(text) => setNewPost({ ...newPost, maxPeople: parseInt(text) || 4 })}
                    style={styles.textInput}
                    mode="outlined"
                    keyboardType="numeric"
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

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  guestCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  guestTitle: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  guestSubtitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  guestButton: {
    marginTop: 16,
    backgroundColor: '#ffffff',
  },
  postCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  postLocation: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  postEmotion: {
    fontSize: 16,
    marginLeft: 4,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  mediaItem: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
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
    marginBottom: 12,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#f1f5f9',
  },
  tagText: {
    fontSize: 12,
    color: '#6366f1',
  },
  topicChip: {
    backgroundColor: '#6366f1',
    marginBottom: 12,
  },
  topicText: {
    color: '#ffffff',
    fontSize: 12,
  },
  meetupCard: {
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    borderRadius: 8,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  meetupDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  meetupPeople: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  joinButton: {
    borderColor: '#6366f1',
  },
  divider: {
    marginVertical: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 12,
  },
  locationButton: {
    marginBottom: 12,
    borderColor: '#6366f1',
  },
  locationButtonLabel: {
    color: '#6366f1',
  },
  toggleButton: {
    marginBottom: 12,
    borderColor: '#6366f1',
  },
  toggleButtonLabel: {
    color: '#6366f1',
  },
  meetupForm: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  createButton: {
    backgroundColor: '#6366f1',
  },
});
