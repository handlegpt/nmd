import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  FAB,
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  Button,
  IconButton,
  useTheme,
  Divider,
  Surface,
} from 'react-native-paper';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export const MapScreen: React.FC = () => {
  const { currentLocation, nearbyUsers, selectedUser, loading, getCurrentLocation, fetchNearbyUsers, setSelectedUser } = useMapStore();
  const { user } = useAuthStore();
  const theme = useTheme();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Initialize map with current location
  const initializeMap = async () => {
    try {
      await getCurrentLocation();
      if (currentLocation) {
        await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 10);
        showToast('Location updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Unable to get location. Please check permissions.', 'error');
    }
  };

  // Handle user selection
  const handleUserPress = (user: User) => {
    setSelectedUser(user);
  };

  // Handle greeting functionality
  const handleGreet = (user: User) => {
    if (!useAuthStore.getState().user) {
      showToast('Please sign in to greet users', 'info');
      return;
    }
    
    if (Platform.OS === 'web') {
      // Web-specific greeting logic
      showToast(`Greeting sent to ${user.nickname}!`, 'success');
    } else {
      Alert.alert(
        'Greet User',
        `Say hello to ${user.nickname}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => {
            showToast(`Greeting sent to ${user.nickname}!`, 'success');
          }},
        ]
      );
    }
  };

  // Handle chat functionality
  const handleChat = (user: User) => {
    if (!useAuthStore.getState().user) {
      showToast('Please sign in to chat with users', 'info');
      return;
    }
    // Navigate to chat screen
    showToast(`Opening chat with ${user.nickname}...`, 'info');
  };

  // Refresh nearby users
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await initializeMap();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mock nearby users for demo
  const mockNearbyUsers: User[] = [
    {
      id: '1',
      email: 'alex@example.com',
      nickname: 'Alex',
      avatar_url: 'https://via.placeholder.com/60x60/4CAF50/ffffff?text=A',
      bio: 'Full-stack developer from Berlin',
      current_city: 'Bali, Indonesia',
      languages: ['English', 'German'],
      interests: ['Coding', 'Surfing', 'Coffee'],
      is_visible: true,
      is_available_for_meetup: true,
      location: { latitude: -8.3405, longitude: 115.0920 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'sarah@example.com',
      nickname: 'Sarah',
      avatar_url: 'https://via.placeholder.com/60x60/FF9800/ffffff?text=S',
      bio: 'Digital nomad and yoga instructor',
      current_city: 'Bali, Indonesia',
      languages: ['English', 'Spanish'],
      interests: ['Yoga', 'Travel', 'Photography'],
      is_visible: true,
      is_available_for_meetup: true,
      location: { latitude: -8.3405, longitude: 115.0920 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'mike@example.com',
      nickname: 'Mike',
      avatar_url: 'https://via.placeholder.com/60x60/2196F3/ffffff?text=M',
      bio: 'UX designer and coffee enthusiast',
      current_city: 'Bali, Indonesia',
      languages: ['English', 'French'],
      interests: ['Design', 'Coffee', 'Music'],
      is_visible: true,
      is_available_for_meetup: true,
      location: { latitude: -8.3405, longitude: 115.0920 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const displayUsers = nearbyUsers.length > 0 ? nearbyUsers : mockNearbyUsers;

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading nearby nomads..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Discover Nomads</Title>
        <Paragraph style={styles.headerSubtitle}>Find fellow travelers nearby</Paragraph>
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Card */}
        <Card style={styles.locationCard}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <IconButton icon="map-marker" size={24} iconColor="#1976d2" />
              <View style={styles.locationInfo}>
                <Title style={styles.locationTitle}>
                  {currentLocation ? currentLocation.city : 'Unknown Location'}
                </Title>
                <Paragraph style={styles.locationSubtitle}>
                  {currentLocation ? `${currentLocation.country}` : 'Location not available'}
                </Paragraph>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <Chip icon="account-group" style={styles.statChip}>
                {displayUsers.length} nomads nearby
              </Chip>
              <Chip icon="wifi" style={styles.statChip}>
                {displayUsers.filter(u => u.is_available_for_meetup).length} available
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Users List */}
        <View style={styles.usersContainer}>
          {displayUsers.map((nomad, index) => (
            <Card key={nomad.id} style={[styles.userCard, { marginTop: index === 0 ? 16 : 12 }]} onPress={() => handleUserPress(nomad)}>
              <Card.Content style={styles.userCardContent}>
                <View style={styles.userHeader}>
                  <Avatar.Image
                    size={64}
                    source={{ uri: nomad.avatar_url }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Title style={styles.userName}>{nomad.nickname}</Title>
                    <Paragraph style={styles.userBio}>{nomad.bio}</Paragraph>
                    <View style={styles.userStatus}>
                      <Chip 
                        icon={nomad.is_available_for_meetup ? "check-circle" : "clock"} 
                        style={[styles.statusChip, { backgroundColor: nomad.is_available_for_meetup ? '#e8f5e8' : '#fff3e0' }]}
                        textStyle={{ color: nomad.is_available_for_meetup ? '#2e7d32' : '#f57c00' }}
                      >
                        {nomad.is_available_for_meetup ? 'Available' : 'Busy'}
                      </Chip>
                    </View>
                  </View>
                </View>
                
                <View style={styles.userTags}>
                  {nomad.interests.slice(0, 3).map((interest, index) => (
                    <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                      {interest}
                    </Chip>
                  ))}
                </View>

                <View style={styles.userLanguages}>
                  <Paragraph style={styles.languagesTitle}>Languages:</Paragraph>
                  <View style={styles.languagesList}>
                    {nomad.languages.map((language, index) => (
                      <Chip key={index} style={styles.languageChip} textStyle={styles.languageText}>
                        {language}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.userActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleGreet(nomad)}
                    style={styles.actionButton}
                    icon="hand-wave"
                    contentStyle={styles.actionButtonContent}
                  >
                    Greet
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleChat(nomad)}
                    style={styles.actionButton}
                    icon="chat"
                    contentStyle={styles.actionButtonContent}
                  >
                    Chat
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={handleRefresh}
        loading={isRefreshing}
        color="#ffffff"
      />

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  locationCard: {
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderRadius: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 8,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    marginRight: 8,
    backgroundColor: '#e3f2fd',
  },
  usersContainer: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderRadius: 12,
  },
  userCardContent: {
    padding: 0,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    paddingBottom: 0,
  },
  userAvatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  userStatus: {
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  userLanguages: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  languagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  languageText: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
    borderRadius: 28,
  },
}); 