import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  List,
  Switch,
  Divider,
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Chip,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Toast from '../common/Toast';

interface SettingsState {
  notifications: {
    newMessages: boolean;
    meetupInvites: boolean;
    nearbyUsers: boolean;
    postLikes: boolean;
  };
  privacy: {
    showLocation: boolean;
    showOnlineStatus: boolean;
    allowGreetings: boolean;
    allowChatRequests: boolean;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    distanceUnit: 'km' | 'miles';
    timezone: string;
  };
}

export const SettingsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      newMessages: true,
      meetupInvites: true,
      nearbyUsers: false,
      postLikes: true,
    },
    privacy: {
      showLocation: true,
      showOnlineStatus: true,
      allowGreetings: true,
      allowChatRequests: true,
    },
    preferences: {
      language: 'English',
      theme: 'light',
      distanceUnit: 'km',
      timezone: 'UTC',
    },
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const updateNotificationSetting = (key: keyof SettingsState['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
    showToast(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`, 'success');
  };

  const updatePrivacySetting = (key: keyof SettingsState['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
    showToast(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your data including profile, posts, and meetups. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          showToast('Data export started. You will receive an email when ready.', 'info');
        }},
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          showToast('Account deletion requested. Please check your email for confirmation.', 'warning');
        }},
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Settings</Title>
            <Paragraph style={styles.subtitle}>
              Please sign in to access your settings
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Notifications</Title>
          <List.Item
            title="New Messages"
            description="Get notified when someone sends you a message"
            left={(props) => <List.Icon {...props} icon="message" />}
            right={() => (
              <Switch
                value={settings.notifications.newMessages}
                onValueChange={(value) => updateNotificationSetting('newMessages', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Meetup Invites"
            description="Get notified when invited to meetups"
            left={(props) => <List.Icon {...props} icon="calendar" />}
            right={() => (
              <Switch
                value={settings.notifications.meetupInvites}
                onValueChange={(value) => updateNotificationSetting('meetupInvites', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Nearby Users"
            description="Get notified when new nomads are nearby"
            left={(props) => <List.Icon {...props} icon="account-group" />}
            right={() => (
              <Switch
                value={settings.notifications.nearbyUsers}
                onValueChange={(value) => updateNotificationSetting('nearbyUsers', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Post Likes"
            description="Get notified when someone likes your posts"
            left={(props) => <List.Icon {...props} icon="heart" />}
            right={() => (
              <Switch
                value={settings.notifications.postLikes}
                onValueChange={(value) => updateNotificationSetting('postLikes', value)}
                color="#6366f1"
              />
            )}
          />
        </Surface>

        {/* Privacy Section */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Privacy</Title>
          <List.Item
            title="Show Location"
            description="Allow others to see your current location"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={settings.privacy.showLocation}
                onValueChange={(value) => updatePrivacySetting('showLocation', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Online Status"
            description="Show when you're online"
            left={(props) => <List.Icon {...props} icon="wifi" />}
            right={() => (
              <Switch
                value={settings.privacy.showOnlineStatus}
                onValueChange={(value) => updatePrivacySetting('showOnlineStatus', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Allow Greetings"
            description="Allow others to send you greetings"
            left={(props) => <List.Icon {...props} icon="hand-wave" />}
            right={() => (
              <Switch
                value={settings.privacy.allowGreetings}
                onValueChange={(value) => updatePrivacySetting('allowGreetings', value)}
                color="#6366f1"
              />
            )}
          />
          <Divider />
          <List.Item
            title="Chat Requests"
            description="Allow others to send you chat requests"
            left={(props) => <List.Icon {...props} icon="chat" />}
            right={() => (
              <Switch
                value={settings.privacy.allowChatRequests}
                onValueChange={(value) => updatePrivacySetting('allowChatRequests', value)}
                color="#6366f1"
              />
            )}
          />
        </Surface>

        {/* Preferences Section */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Preferences</Title>
          <List.Item
            title="Language"
            description={settings.preferences.language}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showToast('Language selection coming soon!', 'info')}
          />
          <Divider />
          <List.Item
            title="Theme"
            description={settings.preferences.theme}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showToast('Theme selection coming soon!', 'info')}
          />
          <Divider />
          <List.Item
            title="Distance Unit"
            description={settings.preferences.distanceUnit}
            left={(props) => <List.Icon {...props} icon="ruler" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showToast('Distance unit selection coming soon!', 'info')}
          />
        </Surface>

        {/* Account Actions */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Account</Title>
          <List.Item
            title="Export Data"
            description="Download all your data"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={handleExportData}
          />
          <Divider />
          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={(props) => <List.Icon {...props} icon="delete" color="#ef4444" />}
            onPress={handleDeleteAccount}
            titleStyle={{ color: '#ef4444' }}
          />
        </Surface>

        {/* App Info */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>About</Title>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showToast('Terms of Service coming soon!', 'info')}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showToast('Privacy Policy coming soon!', 'info')}
          />
        </Surface>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 8,
  },
  card: {
    margin: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});
