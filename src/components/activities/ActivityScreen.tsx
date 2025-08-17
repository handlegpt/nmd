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
  Surface,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Meetup {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  createdBy: {
    id: string;
    nickname: string;
    avatar: string;
  };
  participants: Array<{
    id: string;
    nickname: string;
    avatar: string;
  }>;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export const ActivityScreen: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const [meetups, setMeetups] = useState<Meetup[]>([
    {
      id: '1',
      title: 'Bali Digital Nomad Coffee Meetup',
      description: 'Let\'s grab coffee and share our digital nomad experiences! Perfect for networking and making new friends.',
      location: 'Canggu Coworking Space, Bali',
      date: 'Tomorrow',
      time: '10:00 AM',
      maxParticipants: 8,
      currentParticipants: 3,
      createdBy: {
        id: '1',
        nickname: 'Alex',
        avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=A',
      },
      participants: [
        { id: '1', nickname: 'Alex', avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=A' },
        { id: '2', nickname: 'Sarah', avatar: 'https://via.placeholder.com/40x40/FF9800/ffffff?text=S' },
        { id: '3', nickname: 'Mike', avatar: 'https://via.placeholder.com/40x40/2196F3/ffffff?text=M' },
      ],
      tags: ['Coffee', 'Networking', 'Coworking'],
      status: 'upcoming',
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Surfing Session at Uluwatu',
      description: 'Early morning surf session! All levels welcome. Let\'s catch some waves together.',
      location: 'Uluwatu Beach, Bali',
      date: 'Today',
      time: '6:00 AM',
      maxParticipants: 6,
      currentParticipants: 4,
      createdBy: {
        id: '2',
        nickname: 'Sarah',
        avatar: 'https://via.placeholder.com/40x40/FF9800/ffffff?text=S',
      },
      participants: [
        { id: '2', nickname: 'Sarah', avatar: 'https://via.placeholder.com/40x40/FF9800/ffffff?text=S' },
        { id: '4', nickname: 'Tom', avatar: 'https://via.placeholder.com/40x40/9C27B0/ffffff?text=T' },
        { id: '5', nickname: 'Emma', avatar: 'https://via.placeholder.com/40x40/FF5722/ffffff?text=E' },
        { id: '6', nickname: 'David', avatar: 'https://via.placeholder.com/40x40/607D8B/ffffff?text=D' },
      ],
      tags: ['Surfing', 'Beach', 'Morning'],
      status: 'upcoming',
      createdAt: '1 day ago',
    },
    {
      id: '3',
      title: 'Lunch at Seminyak Cafe',
      description: 'Casual lunch meetup! Great food and conversation guaranteed.',
      location: 'Seminyak Cafe, Bali',
      date: 'Today',
      time: '1:00 PM',
      maxParticipants: 4,
      currentParticipants: 2,
      createdBy: {
        id: '3',
        nickname: 'Mike',
        avatar: 'https://via.placeholder.com/40x40/2196F3/ffffff?text=M',
      },
      participants: [
        { id: '3', nickname: 'Mike', avatar: 'https://via.placeholder.com/40x40/2196F3/ffffff?text=M' },
        { id: '7', nickname: 'Lisa', avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=L' },
      ],
      tags: ['Lunch', 'Food', 'Casual'],
      status: 'upcoming',
      createdAt: '3 hours ago',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMeetup, setNewMeetup] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: 4,
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

  // Handle join meetup
  const handleJoinMeetup = (meetupId: string) => {
    if (!user) {
      showToast('Please sign in to join meetups', 'info');
      return;
    }
    
    setMeetups(meetups.map(meetup => {
      if (meetup.id === meetupId && meetup.currentParticipants < meetup.maxParticipants) {
        const newParticipant = {
          id: user?.id || 'user',
          nickname: user?.nickname || 'Demo User',
          avatar: user?.avatar_url || 'https://via.placeholder.com/40x40/2196f3/ffffff?text=U',
        };
        return {
          ...meetup,
          currentParticipants: meetup.currentParticipants + 1,
          participants: [...meetup.participants, newParticipant],
        };
      }
      return meetup;
    }));
    showToast('Joined meetup successfully!', 'success');
  };

  // Handle leave meetup
  const handleLeaveMeetup = (meetupId: string) => {
    if (!user) {
      showToast('Please sign in to leave meetups', 'info');
      return;
    }
    
    setMeetups(meetups.map(meetup => {
      if (meetup.id === meetupId) {
        return {
          ...meetup,
          currentParticipants: Math.max(0, meetup.currentParticipants - 1),
          participants: meetup.participants.filter(p => p.id !== (user?.id || 'user')),
        };
      }
      return meetup;
    }));
    showToast('Left meetup', 'info');
  };

  // Handle create meetup
  const handleCreateMeetup = () => {
    if (!user) {
      showToast('Please sign in to create meetups', 'info');
      return;
    }
    
    if (!newMeetup.title.trim() || !newMeetup.description.trim() || !newMeetup.location.trim() || !newMeetup.date.trim() || !newMeetup.time.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const meetup: Meetup = {
      id: Date.now().toString(),
      title: newMeetup.title,
      description: newMeetup.description,
      location: newMeetup.location,
      date: newMeetup.date,
      time: newMeetup.time,
      maxParticipants: newMeetup.maxParticipants,
      currentParticipants: 1,
      createdBy: {
        id: user?.id || 'user',
        nickname: user?.nickname || 'Demo User',
        avatar: user?.avatar_url || 'https://via.placeholder.com/40x40/2196f3/ffffff?text=U',
      },
      participants: [{
        id: user?.id || 'user',
        nickname: user?.nickname || 'Demo User',
        avatar: user?.avatar_url || 'https://via.placeholder.com/40x40/2196f3/ffffff?text=U',
      }],
      tags: ['New Meetup'],
      status: 'upcoming',
      createdAt: 'Just now',
    };

    setMeetups([meetup, ...meetups]);
    setModalVisible(false);
    setNewMeetup({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      maxParticipants: 4,
    });
    showToast('Meetup created successfully!', 'success');
  };

  // Check if user is participant
  const isParticipant = (meetup: Meetup) => {
    return meetup.participants.some(p => p.id === (user?.id || 'user'));
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Meetups</Title>
          <Paragraph style={styles.headerSubtitle}>Join exciting activities with fellow nomads</Paragraph>
        </View>
        <View style={styles.headerDecoration} />
      </Surface>

      <ScrollView style={styles.scrollView}>
        {meetups.map((meetup) => (
          <Card key={meetup.id} style={styles.meetupCard}>
            <Card.Content>
              <View style={styles.meetupHeader}>
                <Avatar.Image
                  size={48}
                  source={{ uri: meetup.createdBy.avatar }}
                  style={styles.creatorAvatar}
                />
                <View style={styles.meetupInfo}>
                  <Title style={styles.meetupTitle}>{meetup.title}</Title>
                  <Paragraph style={styles.meetupMeta}>
                    Created by {meetup.createdBy.nickname} • {meetup.createdAt}
                  </Paragraph>
                </View>
              </View>

              <Paragraph style={styles.meetupDescription}>{meetup.description}</Paragraph>

              <View style={styles.meetupDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <IconButton icon="map-marker" size={16} iconColor="#6366f1" />
                  </View>
                  <Paragraph style={styles.detailText}>{meetup.location}</Paragraph>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <IconButton icon="calendar" size={16} iconColor="#6366f1" />
                  </View>
                  <Paragraph style={styles.detailText}>{meetup.date} at {meetup.time}</Paragraph>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <IconButton icon="account-group" size={16} iconColor="#6366f1" />
                  </View>
                  <Paragraph style={styles.detailText}>
                    {meetup.currentParticipants}/{meetup.maxParticipants} participants
                  </Paragraph>
                </View>
              </View>

              <View style={styles.participantsContainer}>
                <Paragraph style={styles.participantsTitle}>Participants:</Paragraph>
                <View style={styles.participantsList}>
                  {meetup.participants.slice(0, 5).map((participant, index) => (
                    <Avatar.Image
                      key={participant.id}
                      size={36}
                      source={{ uri: participant.avatar }}
                      style={styles.participantAvatar}
                    />
                  ))}
                  {meetup.participants.length > 5 && (
                    <View style={styles.moreParticipants}>
                      <Paragraph style={styles.moreText}>+{meetup.participants.length - 5}</Paragraph>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.meetupTags}>
                {meetup.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                    #{tag}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.meetupActions}>
                {isParticipant(meetup) ? (
                  <Button
                    mode="outlined"
                    onPress={() => handleLeaveMeetup(meetup.id)}
                    icon="account-remove"
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                  >
                    Leave
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => handleJoinMeetup(meetup.id)}
                    disabled={meetup.currentParticipants >= meetup.maxParticipants}
                    icon="account-plus"
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                  >
                    {meetup.currentParticipants >= meetup.maxParticipants ? 'Full' : 'Join'}
                  </Button>
                )}
                <Button
                  mode="text"
                  onPress={() => showToast('Chat feature coming soon!', 'info')}
                  icon="chat"
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  Chat
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          if (!user) {
            showToast('Please sign in to create meetups', 'info');
          } else {
            setModalVisible(true);
          }
        }}
        color="#ffffff"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Create New Meetup</Title>
              
              <TextInput
                label="Meetup Title"
                value={newMeetup.title}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, title: text })}
                style={styles.textInput}
              />

              <TextInput
                label="Description"
                value={newMeetup.description}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, description: text })}
                multiline
                numberOfLines={3}
                style={styles.textInput}
              />

              <TextInput
                label="Location"
                value={newMeetup.location}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, location: text })}
                style={styles.textInput}
              />

              <TextInput
                label="Date"
                value={newMeetup.date}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, date: text })}
                placeholder="e.g., Tomorrow, Next Friday"
                style={styles.textInput}
              />

              <TextInput
                label="Time"
                value={newMeetup.time}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, time: text })}
                placeholder="e.g., 2:00 PM"
                style={styles.textInput}
              />

              <TextInput
                label="Max Participants"
                value={newMeetup.maxParticipants.toString()}
                onChangeText={(text) => setNewMeetup({ ...newMeetup, maxParticipants: parseInt(text) || 4 })}
                keyboardType="numeric"
                style={styles.textInput}
              />

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
                  onPress={handleCreateMeetup}
                  style={styles.modalButton}
                >
                  Create
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
  meetupCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  meetupHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  creatorAvatar: {
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  meetupMeta: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  meetupDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#334155',
    fontWeight: '400',
  },
  meetupDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  participantsContainer: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  moreParticipants: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  meetupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  meetupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonLabel: {
    fontSize: 14,
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
    marginBottom: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
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
}); 