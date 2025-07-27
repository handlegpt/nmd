import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  FAB,
  Chip,
  Avatar,
  Divider,
  Dialog,
  Portal,
  Text,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { Activity, User } from '../../types';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { supabase } from '../../lib/supabase';

export const ActivityScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });
  
  // New activity form
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: new Date(),
    maxParticipants: 10,
    location: '',
  });

  useEffect(() => {
    loadActivities();
  }, []);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Load activities from database
  const loadActivities = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual activity loading from Supabase
      // For now, using mock data
      const mockActivities: Activity[] = [
        {
          id: '1',
          title: 'Digital Nomad Meetup',
          description: 'Let\'s meet for coffee and share our experiences!',
          location: { latitude: 39.9042, longitude: 116.4074, city: 'Beijing' },
          date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          max_participants: 8,
          current_participants: 3,
          created_by: 'user-1',
          participants: ['user-1', 'user-2', 'user-3'],
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Co-working Session',
          description: 'Looking for someone to co-work with at a local cafe.',
          location: { latitude: 39.9042, longitude: 116.4074, city: 'Beijing' },
          date_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          max_participants: 4,
          current_participants: 1,
          created_by: 'user-2',
          participants: ['user-2'],
          created_at: new Date().toISOString(),
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      showToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new activity
  const createActivity = async () => {
    if (!user || !newActivity.title.trim() || !newActivity.description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const activity: Activity = {
        id: Date.now().toString(),
        title: newActivity.title.trim(),
        description: newActivity.description.trim(),
        location: { latitude: 39.9042, longitude: 116.4074, city: newActivity.location || 'Unknown' },
        date_time: newActivity.date.toISOString(),
        max_participants: newActivity.maxParticipants,
        current_participants: 1,
        created_by: user.id,
        participants: [user.id],
        created_at: new Date().toISOString(),
      };

      // TODO: Implement actual activity creation in Supabase
      setActivities(prev => [activity, ...prev]);
      setShowCreateDialog(false);
      setNewActivity({ title: '', description: '', date: new Date(), maxParticipants: 10, location: '' });
      showToast('Activity created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create activity', 'error');
    }
  };

  // Join activity
  const joinActivity = async (activity: Activity) => {
    if (!user) return;

    try {
      // TODO: Implement actual join logic in Supabase
      const updatedActivity = {
        ...activity,
        current_participants: activity.current_participants + 1,
        participants: [...activity.participants, user.id],
      };

      setActivities(prev => 
        prev.map(a => a.id === activity.id ? updatedActivity : a)
      );

      showToast('Successfully joined the activity!', 'success');
    } catch (error) {
      showToast('Failed to join activity', 'error');
    }
  };

  // Leave activity
  const leaveActivity = async (activity: Activity) => {
    if (!user) return;

    try {
      // TODO: Implement actual leave logic in Supabase
      const updatedActivity = {
        ...activity,
        current_participants: activity.current_participants - 1,
        participants: activity.participants.filter(id => id !== user.id),
      };

      setActivities(prev => 
        prev.map(a => a.id === activity.id ? updatedActivity : a)
      );

      showToast('Successfully left the activity', 'success');
    } catch (error) {
      showToast('Failed to leave activity', 'error');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} from now`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} from now`;
    return 'Starting soon';
  };

  // Check if user is participating
  const isParticipating = (activity: Activity) => {
    return user && activity.participants.includes(user.id);
  };

  // Render activity item
  const renderActivity = ({ item }: { item: Activity }) => (
    <Card style={styles.activityCard}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph style={styles.description}>{item.description}</Paragraph>
        
        <View style={styles.activityInfo}>
          <Chip icon="map-marker" style={styles.chip}>
            {item.location.city}
          </Chip>
          <Chip icon="clock" style={styles.chip}>
            {formatDate(item.date_time)}
          </Chip>
          <Chip icon="account-group" style={styles.chip}>
            {item.current_participants}/{item.max_participants}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actions}>
          {isParticipating(item) ? (
            <Button
              mode="outlined"
              onPress={() => leaveActivity(item)}
              style={styles.actionButton}
            >
              Leave
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => joinActivity(item)}
              disabled={item.current_participants >= item.max_participants}
              style={styles.actionButton}
            >
              Join
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Activity FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreateDialog(true)}
      />

      {/* Create Activity Dialog */}
      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create New Activity</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newActivity.title}
              onChangeText={(text) => setNewActivity(prev => ({ ...prev, title: text }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={newActivity.description}
              onChangeText={(text) => setNewActivity(prev => ({ ...prev, description: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            <TextInput
              label="Location"
              value={newActivity.location}
              onChangeText={(text) => setNewActivity(prev => ({ ...prev, location: text }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Max Participants"
              value={newActivity.maxParticipants.toString()}
              onChangeText={(text) => setNewActivity(prev => ({ ...prev, maxParticipants: parseInt(text) || 10 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onPress={createActivity}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Toast for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading spinner */}
      <LoadingSpinner visible={loading} message="Loading activities..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
    marginBottom: 16,
    elevation: 2,
  },
  description: {
    marginVertical: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
  },
});

export default ActivityScreen; 