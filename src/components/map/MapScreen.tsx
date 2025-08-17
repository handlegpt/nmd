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
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Discover Nomads</Title>
          <Paragraph style={styles.headerSubtitle}>Find fellow travelers nearby</Paragraph>
        </View>
        <View style={styles.headerDecoration} />
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Location Card */}
        <Card style={styles.locationCard}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <View style={styles.locationIcon}>
                <IconButton icon="map-marker" size={24} iconColor="#6366f1" />
              </View>
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
              <Chip icon="account-group" style={styles.statChip} textStyle={styles.statChipText}>
                {displayUsers.length} nomads nearby
              </Chip>
              <Chip icon="wifi" style={styles.statChip} textStyle={styles.statChipText}>
                {displayUsers.filter(u => u.is_available_for_meetup).length} available
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Enhanced Users List */}
        <View style={styles.usersContainer}>
          {displayUsers.map((nomad, index) => (
            <Card key={nomad.id} style={[styles.userCard, { marginTop: index === 0 ? 20 : 16 }]} onPress={() => handleUserPress(nomad)}>
              <Card.Content style={styles.userCardContent}>
                <View style={styles.userHeader}>
                  <Avatar.Image
                    size={72}
                    source={{ uri: nomad.avatar_url }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Title style={styles.userName}>{nomad.nickname}</Title>
                    <Paragraph style={styles.userBio}>{nomad.bio}</Paragraph>
                    <View style={styles.userStatus}>
                      <Chip 
                        icon={nomad.is_available_for_meetup ? "check-circle" : "clock"} 
                        style={[styles.statusChip, { backgroundColor: nomad.is_available_for_meetup ? '#dcfce7' : '#fef3c7' }]}
                        textStyle={{ color: nomad.is_available_for_meetup ? '#166534' : '#92400e' }}
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
                    labelStyle={styles.actionButtonLabel}
                  >
                    Greet
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleChat(nomad)}
                    style={styles.actionButton}
                    icon="chat"
                    contentStyle={styles.actionButtonContent}
                    labelStyle={styles.actionButtonLabel}
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
  locationCard: {
    margin: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
  },
  statChipText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  usersContainer: {
    padding: 20,
  },
  userCard: {
    marginBottom: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  userCardContent: {
    padding: 0,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 20,
    paddingBottom: 0,
  },
  userAvatar: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 12,
    fontWeight: '400',
  },
  userStatus: {
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  userTags: {
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
  userLanguages: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  languagesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  languageText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e2e8f0',
    height: 1,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
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
}); 