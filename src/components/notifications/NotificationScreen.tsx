import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Button,
  FAB,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { shadowPresets } from '../../utils/platformStyles';
import { DatabaseService } from '../../services/databaseService';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Notification {
  id: string;
  type: 'greeting' | 'message' | 'activity' | 'system' | 'like' | 'comment' | 'meetup_invite' | 'meetup_update';
  title: string;
  message: string;
  from_user_id?: string;
  from_user_nickname?: string;
  from_user?: {
    nickname: string;
    avatar_url?: string;
  };
  created_at: string;
  is_read: boolean;
}

export const NotificationScreen: React.FC = ({ navigation }: { navigation?: any }) => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

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
    if (!user) return;
    
    setLoading(true);
    try {
      const dbNotifications = await DatabaseService.getNotifications(user.id);
      setNotifications(dbNotifications);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const success = await DatabaseService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
        showToast('Marked as read', 'success');
      } else {
        showToast('Failed to mark as read', 'error');
      }
    } catch (error) {
      showToast('Failed to mark as read', 'error');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const success = await DatabaseService.deleteNotification(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
        showToast('Notification deleted', 'success');
      } else {
        showToast('Failed to delete notification', 'error');
      }
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const success = await DatabaseService.markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        showToast('All notifications marked as read', 'success');
      } else {
        showToast('Failed to mark all as read', 'error');
      }
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
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
      case 'like':
        return 'heart';
      case 'comment':
        return 'comment';
      case 'meetup_invite':
        return 'account-plus';
      case 'meetup_update':
        return 'calendar-clock';
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
      case 'like':
        return '#E91E63';
      case 'comment':
        return '#00BCD4';
      case 'meetup_invite':
        return '#8BC34A';
      case 'meetup_update':
        return '#FF5722';
      default:
        return '#757575';
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (notificationId: string) => {
    if (!user) {
      showToast('Please sign in to manage notifications', 'info');
      return;
    }
    
    markAsRead(notificationId);
  };

  // Handle delete notification
  const handleDeleteNotification = (notificationId: string) => {
    if (!user) {
      showToast('Please sign in to manage notifications', 'info');
      return;
    }
    
    deleteNotification(notificationId);
  };

  // Handle sign in navigation
  const handleSignIn = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Notifications</Title>
            <Paragraph style={styles.subtitle}>
              Sign in to view and manage your notifications
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={handleSignIn} 
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Render notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <Card style={[
      styles.notificationCard,
      !item.is_read && styles.unreadCard
    ]}>
      <Card.Content>
        <View style={styles.notificationHeader}>
          {item.from_user && (
            <Avatar.Image
              size={40}
              source={{ uri: item.from_user.avatar_url || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          )}
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
                onPress={() => handleMarkAsRead(item.id)}
              />
            )}
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteNotification(item.id)}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>No notifications</Title>
                <Paragraph style={styles.emptyMessage}>
                  You're all caught up! Check back later for new updates.
                </Paragraph>
              </Card.Content>
            </Card>
          ) : null
        }
      />

      {/* FAB for mark all as read */}
      {notifications.some(n => !n.is_read) && (
        <FAB
          icon="check-all"
          style={styles.fab}
          onPress={markAllAsRead}
          label="Mark all as read"
        />
      )}

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
    ...shadowPresets.small,
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
  avatar: {
    marginRight: 12,
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
  emptyCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  card: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 10,
  },
  buttonContent: {
    height: 48,
  },
});

export default NotificationScreen; 