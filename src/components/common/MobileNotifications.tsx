import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Switch,
  List,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useResponsive } from '../../utils/responsive';
import Toast from './Toast';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  badgeEnabled: boolean;
  locationUpdates: boolean;
  newMessages: boolean;
  nearbyUsers: boolean;
  activities: boolean;
  marketing: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: 'message' | 'location' | 'activity' | 'system';
}

export const MobileNotifications: React.FC = () => {
  const { isPhone, spacing, borderRadius } = useResponsive();
  const theme = useTheme();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    soundEnabled: true,
    badgeEnabled: true,
    locationUpdates: true,
    newMessages: true,
    nearbyUsers: true,
    activities: true,
    marketing: false,
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    if (isPhone) {
      registerForPushNotificationsAsync();
      setupNotificationListeners();
      loadNotifications();
    }
  }, [isPhone]);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      showToast('Push notifications are only available on physical devices', 'warning');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      showToast('Failed to get push token for push notification!', 'error');
      return;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your Expo project ID
      });
      setExpoPushToken(token.data);
      showToast('Push notifications enabled!', 'success');
    } catch (error) {
      showToast('Failed to get push token', 'error');
    }
  };

  // Setup notification listeners
  const setupNotificationListeners = () => {
    // Handle notification received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const newNotification: NotificationItem = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        timestamp: new Date(),
        read: false,
        type: notification.request.content.data?.type || 'system',
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Handle notification response (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notification = response.notification;
      // Handle notification tap - navigate to appropriate screen
      handleNotificationTap(notification);
    });

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
      subscription?.remove();
    };
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - clear badge
      Notifications.setBadgeCountAsync(0);
    }
  };

  // Handle notification tap
  const handleNotificationTap = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    
    switch (data?.type) {
      case 'message':
        // Navigate to chat screen
        showToast('Opening chat...', 'info');
        break;
      case 'location':
        // Navigate to map screen
        showToast('Opening map...', 'info');
        break;
      case 'activity':
        // Navigate to activities screen
        showToast('Opening activities...', 'info');
        break;
      default:
        // Handle system notifications
        break;
    }
  };

  // Load saved notifications
  const loadNotifications = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const receivedNotifications = await Notifications.getPresentedNotificationsAsync();
      
      // Convert to our format
      const savedNotifications: NotificationItem[] = [
        ...scheduledNotifications.map(notification => ({
          id: notification.identifier,
          title: notification.content.title || '',
          body: notification.content.body || '',
          data: notification.content.data,
          timestamp: new Date(notification.trigger as any),
          read: false,
          type: notification.content.data?.type || 'system',
        })),
        ...receivedNotifications.map(notification => ({
          id: notification.request.identifier,
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          timestamp: new Date(),
          read: false,
          type: notification.request.content.data?.type || 'system',
        })),
      ];
      
      setNotifications(savedNotifications);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    }
  };

  // Update notification settings
  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'pushEnabled' && value) {
      registerForPushNotificationsAsync();
    }
    
    showToast(`${key} ${value ? 'enabled' : 'disabled'}`, 'success');
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from NomadNow!",
          data: { type: 'system' },
        },
        trigger: null, // Send immediately
      });
      showToast('Test notification sent!', 'success');
    } catch (error) {
      showToast('Failed to send test notification', 'error');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotifications([]);
      showToast('All notifications cleared', 'success');
    } catch (error) {
      showToast('Failed to clear notifications', 'error');
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    Notifications.dismissNotificationAsync(id);
  };

  if (!isPhone) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title>Notifications</Title>
          <Paragraph>Notifications are only available on mobile devices.</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Push Token Display */}
      {expoPushToken && (
        <Card style={styles.tokenCard}>
          <Card.Content>
            <Title>Push Token</Title>
            <Paragraph style={styles.tokenText}>{expoPushToken}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Notification Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Notification Settings</Title>
          
          <List.Item
            title="Push Notifications"
            description="Enable push notifications"
            right={() => (
              <Switch
                value={settings.pushEnabled}
                onValueChange={(value) => updateSetting('pushEnabled', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Sound"
            description="Play sound for notifications"
            right={() => (
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting('soundEnabled', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Badge"
            description="Show badge count on app icon"
            right={() => (
              <Switch
                value={settings.badgeEnabled}
                onValueChange={(value) => updateSetting('badgeEnabled', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Location Updates"
            description="Notify when nearby nomads are found"
            right={() => (
              <Switch
                value={settings.locationUpdates}
                onValueChange={(value) => updateSetting('locationUpdates', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="New Messages"
            description="Notify when you receive new messages"
            right={() => (
              <Switch
                value={settings.newMessages}
                onValueChange={(value) => updateSetting('newMessages', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Activities"
            description="Notify about nearby meetups and events"
            right={() => (
              <Switch
                value={settings.activities}
                onValueChange={(value) => updateSetting('activities', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Marketing"
            description="Receive promotional notifications"
            right={() => (
              <Switch
                value={settings.marketing}
                onValueChange={(value) => updateSetting('marketing', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Test Notification */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Title>Test Notifications</Title>
          <Paragraph>Send a test notification to verify settings</Paragraph>
          <Button
            mode="contained"
            onPress={sendTestNotification}
            style={styles.testButton}
          >
            Send Test Notification
          </Button>
        </Card.Content>
      </Card>

      {/* Notifications List */}
      <Card style={styles.notificationsCard}>
        <Card.Content>
          <View style={styles.notificationsHeader}>
            <Title>Recent Notifications</Title>
            <Button onPress={clearAllNotifications}>Clear All</Button>
          </View>
          
          {notifications.length === 0 ? (
            <Paragraph style={styles.emptyText}>No notifications yet</Paragraph>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Title style={[styles.notificationTitle, notification.read && styles.readTitle]}>
                    {notification.title}
                  </Title>
                  <Paragraph style={styles.notificationBody}>
                    {notification.body}
                  </Paragraph>
                  <Paragraph style={styles.notificationTime}>
                    {notification.timestamp.toLocaleString()}
                  </Paragraph>
                </View>
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <IconButton
                      icon="check"
                      size={20}
                      onPress={() => markAsRead(notification.id)}
                    />
                  )}
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => deleteNotification(notification.id)}
                  />
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Toast for feedback */}
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
    padding: 16,
  },
  tokenCard: {
    marginBottom: 16,
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  settingsCard: {
    marginBottom: 16,
  },
  testCard: {
    marginBottom: 16,
  },
  testButton: {
    marginTop: 8,
  },
  notificationsCard: {
    flex: 1,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  readTitle: {
    opacity: 0.6,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
