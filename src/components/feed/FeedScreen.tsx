import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
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
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

const { width } = Dimensions.get('window');

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
  images?: string[];
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
}

export const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '1',
      userNickname: 'Alex',
      userAvatar: 'https://via.placeholder.com/50x50/4CAF50/ffffff?text=A',
      content: 'Just arrived in Bali! Looking for fellow digital nomads to grab coffee and share experiences. Anyone up for a coworking session tomorrow?',
      location: 'Bali, Indonesia',
      locationDetails: {
        name: 'Canggu Coworking Space',
        address: 'Canggu, Bali, Indonesia',
        coordinates: { latitude: -8.6500, longitude: 115.1333 },
      },
      isMeetupRequest: true,
      meetupDetails: {
        title: 'Bali Digital Nomad Meetup',
        date: 'Tomorrow, 10:00 AM',
        location: 'Canggu Coworking Space',
        maxPeople: 8,
        currentPeople: 3,
      },
      likes: 12,
      comments: 5,
      createdAt: '2 hours ago',
      tags: ['Bali', 'Coworking', 'Coffee'],
    },
    {
      id: '2',
      userId: '2',
      userNickname: 'Sarah',
      userAvatar: 'https://via.placeholder.com/50x50/FF9800/ffffff?text=S',
      content: 'Amazing sunset at Uluwatu today! The waves were perfect for surfing. This is why I love the nomad lifestyle 🌊',
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
      tags: ['Surfing', 'Sunset', 'Uluwatu'],
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
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    isMeetupRequest: false,
    meetupTitle: '',
    meetupDate: '',
    meetupLocation: '',
    maxPeople: 4,
    location: '',
    locationDetails: null as any,
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Popular locations for quick selection
  const popularLocations = [
    { name: 'Canggu Coworking Space', address: 'Canggu, Bali, Indonesia', coordinates: { latitude: -8.6500, longitude: 115.1333 } },
    { name: 'Uluwatu Beach', address: 'Uluwatu, Bali, Indonesia', coordinates: { latitude: -8.8167, longitude: 115.0833 } },
    { name: 'Seminyak Cafe', address: 'Seminyak, Bali, Indonesia', coordinates: { latitude: -8.6833, longitude: 115.1667 } },
    { name: 'Kuta Beach', address: 'Kuta, Bali, Indonesia', coordinates: { latitude: -8.7167, longitude: 115.1667 } },
    { name: 'Nusa Dua Resort', address: 'Nusa Dua, Bali, Indonesia', coordinates: { latitude: -8.7833, longitude: 115.2167 } },
  ];

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

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    setNewPost({
      ...newPost,
      location: location.address,
      locationDetails: location,
    });
    setLocationModalVisible(false);
    showToast(`Location set to ${location.name}`, 'success');
  };

  // Handle create post
  const handleCreatePost = () => {
    if (!user) {
      showToast('Please sign in to create posts', 'info');
      return;
    }

    if (!newPost.content.trim()) {
      showToast('Please write something to share', 'error');
      return;
    }

    if (newPost.isMeetupRequest && (!newPost.meetupTitle || !newPost.meetupDate || !newPost.meetupLocation)) {
      showToast('Please fill in all meetup details', 'error');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      userId: user?.id || '1',
      userNickname: user?.nickname || 'Demo User',
      userAvatar: user?.avatar_url || 'https://via.placeholder.com/50x50/2196f3/ffffff?text=U',
      content: newPost.content,
      location: newPost.location || user?.current_city || 'Unknown Location',
      locationDetails: newPost.locationDetails,
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
      tags: ['New Post'],
    };

    setPosts([post, ...posts]);
    setModalVisible(false);
    setNewPost({
      content: '',
      isMeetupRequest: false,
      meetupTitle: '',
      meetupDate: '',
      meetupLocation: '',
      maxPeople: 4,
      location: '',
      locationDetails: null,
    });
    showToast('Post created successfully!', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Modern Gradient Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Nomad Now</Title>
          <Paragraph style={styles.headerSubtitle}>Share your journey</Paragraph>
        </View>
        <View style={styles.headerDecoration} />
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {posts.map((post, index) => (
          <Card key={post.id} style={[styles.postCard, { marginTop: index === 0 ? 20 : 16 }]}>
            <Card.Content style={styles.postContent}>
              <View style={styles.postHeader}>
                <Avatar.Image
                  size={56}
                  source={{ uri: post.userAvatar }}
                  style={styles.userAvatar}
                />
                <View style={styles.postInfo}>
                  <Title style={styles.userName}>{post.userNickname}</Title>
                  <View style={styles.postMeta}>
                    <IconButton icon="map-marker" size={14} iconColor="#6366f1" />
                    <Paragraph style={styles.postMetaText}>
                      {post.location} • {post.createdAt}
                    </Paragraph>
                  </View>
                </View>
              </View>

              <Paragraph style={styles.postText}>{post.content}</Paragraph>

              {/* Enhanced Location Card */}
              {post.locationDetails && (
                <Card style={styles.locationCard}>
                  <Card.Content style={styles.locationCardContent}>
                    <View style={styles.locationHeader}>
                      <View style={styles.locationIcon}>
                        <IconButton icon="map-marker" size={20} iconColor="#6366f1" />
                      </View>
                      <View style={styles.locationInfo}>
                        <Title style={styles.locationTitle}>{post.locationDetails.name}</Title>
                        <Paragraph style={styles.locationAddress}>{post.locationDetails.address}</Paragraph>
                      </View>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => showToast('Map view coming soon!', 'info')}
                      icon="map"
                      style={styles.mapButton}
                      labelStyle={styles.mapButtonLabel}
                    >
                      View on Map
                    </Button>
                  </Card.Content>
                </Card>
              )}

              {/* Enhanced Meetup Card */}
              {post.isMeetupRequest && post.meetupDetails && (
                <Card style={styles.meetupCard}>
                  <Card.Content style={styles.meetupCardContent}>
                    <View style={styles.meetupHeader}>
                      <View style={styles.meetupIcon}>
                        <IconButton icon="calendar" size={20} iconColor="#6366f1" />
                      </View>
                      <Title style={styles.meetupTitle}>{post.meetupDetails.title}</Title>
                    </View>
                    <View style={styles.meetupDetails}>
                      <View style={styles.meetupDetailRow}>
                        <IconButton icon="clock" size={16} iconColor="#6b7280" />
                        <Paragraph style={styles.meetupDetailText}>
                          {post.meetupDetails.date}
                        </Paragraph>
                      </View>
                      <View style={styles.meetupDetailRow}>
                        <IconButton icon="map-marker" size={16} iconColor="#6b7280" />
                        <Paragraph style={styles.meetupDetailText}>
                          {post.meetupDetails.location}
                        </Paragraph>
                      </View>
                      <View style={styles.meetupDetailRow}>
                        <IconButton icon="account-group" size={16} iconColor="#6b7280" />
                        <Paragraph style={styles.meetupDetailText}>
                          {post.meetupDetails.currentPeople}/{post.meetupDetails.maxPeople} people
                        </Paragraph>
                      </View>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleJoinMeetup(post.id)}
                      disabled={post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople}
                      style={styles.joinButton}
                      contentStyle={styles.joinButtonContent}
                      labelStyle={styles.joinButtonLabel}
                    >
                      {post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople 
                        ? 'Full' 
                        : 'Join Meetup'
                      }
                    </Button>
                  </Card.Content>
                </Card>
              )}

              {/* Modern Tags */}
              <View style={styles.postTags}>
                {post.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                    #{tag}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />

              {/* Enhanced Action Buttons */}
              <View style={styles.postActions}>
                <Button
                  mode="text"
                  onPress={() => handleLike(post.id)}
                  icon="heart"
                  style={styles.actionButton}
                  labelStyle={styles.actionLabel}
                >
                  {post.likes}
                </Button>
                <Button
                  mode="text"
                  onPress={() => showToast('Comments feature coming soon!', 'info')}
                  icon="comment"
                  style={styles.actionButton}
                  labelStyle={styles.actionLabel}
                >
                  {post.comments}
                </Button>
                <Button
                  mode="text"
                  onPress={() => showToast('Share feature coming soon!', 'info')}
                  icon="share"
                  style={styles.actionButton}
                  labelStyle={styles.actionLabel}
                >
                  Share
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Modern FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          if (!user) {
            showToast('Please sign in to create posts', 'info');
          } else {
            setModalVisible(true);
          }
        }}
        color="#ffffff"
      />

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

              {/* Enhanced Location Selection */}
              <Button
                mode="outlined"
                onPress={() => setLocationModalVisible(true)}
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
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#6366f1"
                  />
                  <TextInput
                    label="Date & Time"
                    value={newPost.meetupDate}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupDate: text })}
                    placeholder="e.g., Tomorrow, 2:00 PM"
                    style={styles.textInput}
                    mode="outlined"
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#6366f1"
                  />
                  <TextInput
                    label="Location"
                    value={newPost.meetupLocation}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupLocation: text })}
                    style={styles.textInput}
                    mode="outlined"
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#6366f1"
                  />
                  <TextInput
                    label="Max People"
                    value={newPost.maxPeople.toString()}
                    onChangeText={(text) => setNewPost({ ...newPost, maxPeople: parseInt(text) || 4 })}
                    keyboardType="numeric"
                    style={styles.textInput}
                    mode="outlined"
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#6366f1"
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  labelStyle={styles.modalButtonLabel}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreatePost}
                  style={styles.modalButton}
                  labelStyle={styles.modalButtonLabel}
                >
                  Post
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Enhanced Location Selection Modal */}
      <Portal>
        <Modal
          visible={locationModalVisible}
          onDismiss={() => setLocationModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Choose Location</Title>
              
              <View style={styles.locationList}>
                {popularLocations.map((location, index) => (
                  <List.Item
                    key={index}
                    title={location.name}
                    description={location.address}
                    left={(props) => <List.Icon {...props} icon="map-marker" color="#6366f1" />}
                    onPress={() => handleLocationSelect(location)}
                    style={styles.locationItem}
                    titleStyle={styles.locationItemTitle}
                    descriptionStyle={styles.locationItemDescription}
                  />
                ))}
              </View>

              <Button
                mode="outlined"
                onPress={() => setLocationModalVisible(false)}
                style={styles.modalButton}
                labelStyle={styles.modalButtonLabel}
              >
                Cancel
              </Button>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    position: 'relative',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.05,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  postContent: {
    padding: 0,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userAvatar: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postMetaText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: -8,
    fontWeight: '500',
  },
  postText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
    color: '#334155',
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  locationCardContent: {
    padding: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  mapButton: {
    borderRadius: 12,
    borderColor: '#6366f1',
    borderWidth: 1.5,
  },
  mapButtonLabel: {
    color: '#6366f1',
    fontWeight: '600',
  },
  meetupCard: {
    backgroundColor: '#eef2ff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  meetupCardContent: {
    padding: 20,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetupIcon: {
    marginRight: 12,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  meetupDetails: {
    marginBottom: 20,
  },
  meetupDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetupDetailText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: -8,
    fontWeight: '500',
  },
  joinButton: {
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  joinButtonContent: {
    paddingVertical: 8,
  },
  joinButtonLabel: {
    fontWeight: '600',
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 0,
  },
  tagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e2e8f0',
    height: 1,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  modalTitle: {
    marginBottom: 24,
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  locationButton: {
    marginBottom: 16,
    borderRadius: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
  },
  locationButtonLabel: {
    color: '#6366f1',
    fontWeight: '600',
  },
  toggleButton: {
    marginBottom: 16,
    borderRadius: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
  },
  toggleButtonLabel: {
    color: '#6366f1',
    fontWeight: '600',
  },
  meetupForm: {
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalButtonLabel: {
    fontWeight: '600',
  },
  locationList: {
    marginBottom: 24,
  },
  locationItem: {
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  locationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationItemDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});
