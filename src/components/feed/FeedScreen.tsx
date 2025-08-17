import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
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
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Post {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  location: string;
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
  const [newPost, setNewPost] = useState({
    content: '',
    isMeetupRequest: false,
    meetupTitle: '',
    meetupDate: '',
    meetupLocation: '',
    maxPeople: 4,
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

  // Handle create post
  const handleCreatePost = () => {
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
      location: user?.current_city || 'Unknown Location',
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
    });
    showToast('Post created successfully!', 'success');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {posts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            <Card.Content>
              <View style={styles.postHeader}>
                <Avatar.Image
                  size={40}
                  source={{ uri: post.userAvatar }}
                />
                <View style={styles.postInfo}>
                  <Title style={styles.userName}>{post.userNickname}</Title>
                  <Paragraph style={styles.postMeta}>
                    {post.location} • {post.createdAt}
                  </Paragraph>
                </View>
              </View>

              <Paragraph style={styles.postContent}>{post.content}</Paragraph>

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
                    <Paragraph style={styles.meetupDetails}>
                      👥 {post.meetupDetails.currentPeople}/{post.meetupDetails.maxPeople} people
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={() => handleJoinMeetup(post.id)}
                      disabled={post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople}
                      style={styles.joinButton}
                    >
                      {post.meetupDetails.currentPeople >= post.meetupDetails.maxPeople 
                        ? 'Full' 
                        : 'Join Meetup'
                      }
                    </Button>
                  </Card.Content>
                </Card>
              )}

              <View style={styles.postTags}>
                {post.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                    #{tag}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.postActions}>
                <Button
                  mode="text"
                  onPress={() => handleLike(post.id)}
                  icon="heart"
                  style={styles.actionButton}
                >
                  {post.likes}
                </Button>
                <Button
                  mode="text"
                  onPress={() => showToast('Comments feature coming soon!', 'info')}
                  icon="comment"
                  style={styles.actionButton}
                >
                  {post.comments}
                </Button>
                <Button
                  mode="text"
                  onPress={() => showToast('Share feature coming soon!', 'info')}
                  icon="share"
                  style={styles.actionButton}
                >
                  Share
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

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
              />

              <Button
                mode="outlined"
                onPress={() => setNewPost({ ...newPost, isMeetupRequest: !newPost.isMeetupRequest })}
                icon={newPost.isMeetupRequest ? "calendar-check" : "calendar-plus"}
                style={styles.toggleButton}
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
                  />
                  <TextInput
                    label="Date & Time"
                    value={newPost.meetupDate}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupDate: text })}
                    placeholder="e.g., Tomorrow, 2:00 PM"
                    style={styles.textInput}
                  />
                  <TextInput
                    label="Location"
                    value={newPost.meetupLocation}
                    onChangeText={(text) => setNewPost({ ...newPost, meetupLocation: text })}
                    style={styles.textInput}
                  />
                  <TextInput
                    label="Max People"
                    value={newPost.maxPeople.toString()}
                    onChangeText={(text) => setNewPost({ ...newPost, maxPeople: parseInt(text) || 4 })}
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
                  style={styles.modalButton}
                >
                  Post
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postMeta: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  meetupCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: 12,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  meetupDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  joinButton: {
    marginTop: 8,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 12,
  },
  toggleButton: {
    marginBottom: 12,
  },
  meetupForm: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
