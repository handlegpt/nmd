import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  FAB,
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  Button,
  IconButton,
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
  const [region, setRegion] = useState({
    latitude: 39.9042, // Default to Beijing
    longitude: 116.4074,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
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
        const newRegion = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 10);
        showToast('Location updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Unable to get location. Please check permissions.', 'error');
    }
  };

  // Handle marker press to show user details
  const handleMarkerPress = (user: User) => {
    setSelectedUser(user);
  };

  // Handle greeting functionality
  const handleGreet = (user: User) => {
    Alert.alert(
      'Greet User',
      `Say hello to ${user.nickname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
          // TODO: Implement greeting logic (e.g., send message, open chat)
          showToast(`Greeting sent to ${user.nickname}!`, 'success');
        }},
      ]
    );
  };

  // Handle chat functionality
  const handleChat = (user: User) => {
    // Navigate to chat screen
    // This will be handled by the navigation
    showToast(`Opening chat with ${user.nickname}`, 'info');
  };

  // Refresh nearby users
  const handleRefresh = async () => {
    if (!currentLocation) {
      showToast('Location not available. Please wait...', 'warning');
      return;
    }

    setIsRefreshing(true);
    try {
      await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 10);
      showToast('Nearby users refreshed!', 'success');
    } catch (error) {
      showToast('Failed to refresh nearby users', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get user avatar or default
  const getUserAvatar = (user: User) => {
    return user.avatar_url || 'https://via.placeholder.com/50';
  };

  // Get distance from current location
  const getDistance = (user: User) => {
    if (!currentLocation || !user.location) return 'Unknown';
    
    const distance = Math.sqrt(
      Math.pow(currentLocation.latitude - user.location.latitude, 2) +
      Math.pow(currentLocation.longitude - user.location.longitude, 2)
    ) * 111; // Rough conversion to km
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${Math.round(distance)}km`;
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Current user location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
            description="Your current location"
            pinColor="blue"
          />
        )}

        {/* Nearby users markers */}
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: user.location?.latitude || 0,
              longitude: user.location?.longitude || 0,
            }}
            title={user.nickname}
            description={user.current_city}
            onPress={() => handleMarkerPress(user)}
          />
        ))}
      </MapView>

      {/* User details card */}
      {selectedUser && (
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userHeader}>
              <Avatar.Image
                size={50}
                source={{ uri: getUserAvatar(selectedUser) }}
              />
              <View style={styles.userInfo}>
                <Title>{selectedUser.nickname}</Title>
                <Paragraph>{selectedUser.current_city}</Paragraph>
                <Chip style={styles.distanceChip}>
                  {getDistance(selectedUser)}
                </Chip>
              </View>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSelectedUser(null)}
              />
            </View>
            
            {selectedUser.bio && (
              <Paragraph style={styles.bio}>{selectedUser.bio}</Paragraph>
            )}

            <View style={styles.userActions}>
              <Button
                mode="contained"
                onPress={() => handleGreet(selectedUser)}
                style={styles.actionButton}
              >
                Greet
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleChat(selectedUser)}
                style={styles.actionButton}
              >
                Chat
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Refresh FAB */}
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={handleRefresh}
        loading={isRefreshing}
        disabled={loading || isRefreshing}
      />

      {/* Toast for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading spinner */}
      <LoadingSpinner visible={loading} message="Loading map..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  distanceChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bio: {
    marginBottom: 12,
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MapScreen; 