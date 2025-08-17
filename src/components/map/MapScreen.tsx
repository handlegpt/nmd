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
      <ScrollView style={styles.scrollView}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.title}>Discover Nearby Nomads</Title>
            <Paragraph style={styles.subtitle}>
              {currentLocation 
                ? `You're in ${currentLocation.city}, ${currentLocation.country}`
                : 'Location not available'
              }
            </Paragraph>
            <View style={styles.statsContainer}>
              <Chip icon="account-group" style={styles.statChip}>
                {displayUsers.length} nomads nearby
              </Chip>
              <Chip icon="map-marker" style={styles.statChip}>
                {currentLocation ? `${currentLocation.city}` : 'Unknown location'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.usersContainer}>
          {displayUsers.map((nomad) => (
            <Card key={nomad.id} style={styles.userCard} onPress={() => handleUserPress(nomad)}>
              <Card.Content>
                <View style={styles.userHeader}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: nomad.avatar_url }}
                  />
                  <View style={styles.userInfo}>
                    <Title style={styles.userName}>{nomad.nickname}</Title>
                    <Paragraph style={styles.userBio}>{nomad.bio}</Paragraph>
                    <View style={styles.userTags}>
                      {nomad.interests.slice(0, 3).map((interest, index) => (
                        <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                          {interest}
                        </Chip>
                      ))}
                    </View>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.userActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleGreet(nomad)}
                    style={styles.actionButton}
                    icon="hand-wave"
                  >
                    Greet
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleChat(nomad)}
                    style={styles.actionButton}
                    icon="chat"
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    marginRight: 8,
  },
  usersContainer: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#e3f2fd',
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
}); 