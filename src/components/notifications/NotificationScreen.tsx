import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Notification {
  id: string;
  type: 'greeting' | 'message' | 'activity' | 'system';
  title: string;
  message: string;
  from_user_id?: string;
  from_user_nickname?: string;
  created_at: string;
  is_read: boolean;
}

export const NotificationScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    loadNotifications();
  }, []);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Load notifications from database
  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual notification loading from Supabase
      // For now, using mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'greeting',
          title: 'New Greeting',
          message: 'John Doe sent you a greeting!',
          from_user_id: 'user-1',
          from_user_nickname: 'John Doe',
          created_at: new Date(Date.now() - 300000).toISOString(),
          is_read: false,
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'Jane Smith sent you a message',
          from_user_id: 'user-2',
          from_user_nickname: 'Jane Smith',
          created_at: new Date(Date.now() - 600000).toISOString(),
          is_read: true,
        },
        {
          id: '3',
          type: 'activity',
          title: 'Activity Update',
          message: 'Digital Nomad Meetup starts in 2 hours',
          created_at: new Date(Date.now() - 900000).toISOString(),
          is_read: false,
        },
        {
          id: '4',
          type: 'system',
          title: 'Welcome to NomadNow!',
          message: 'Your account has been successfully created',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Implement actual mark as read in Supabase
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      showToast('Marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark as read', 'error');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement actual deletion in Supabase
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'greeting':
        return 'hand-wave';
      case 'message':
        return 'message';
      case 'activity':
        return 'calendar';
      case 'system':
        return 'cog';
      default:
        return 'bell';
    }
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'greeting':
        return '#4CAF50';
      case 'message':
        return '#2196F3';
      case 'activity':
        return '#FF9800';
      case 'system':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  // Render notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <Card style={[
      styles.notificationCard,
      !item.is_read && styles.unreadCard
    ]}>
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationInfo}>
            <Title style={styles.notificationTitle}>{item.title}</Title>
            <Paragraph style={styles.notificationMessage}>{item.message}</Paragraph>
            <View style={styles.notificationMeta}>
              <Chip
                icon={getNotificationIcon(item.type)}
                style={[styles.typeChip, { backgroundColor: getNotificationColor(item.type) }]}
                textStyle={{ color: '#fff' }}
              >
                {item.type}
              </Chip>
              <Paragraph style={styles.timestamp}>
                {formatTime(item.created_at)}
              </Paragraph>
            </View>
          </View>
          <View style={styles.notificationActions}>
            {!item.is_read && (
              <IconButton
                icon="check"
                size={20}
                onPress={() => markAsRead(item.id)}
              />
            )}
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deleteNotification(item.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
      />

      {/* Toast for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading spinner */}
      <LoadingSpinner visible={loading} message="Loading notifications..." />
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
  notificationCard: {
    marginBottom: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default NotificationScreen; 