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
} from 'react-native-paper';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';

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

  useEffect(() => {
    initializeMap();
  }, []);

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
        await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get location information');
    }
  };

  // Handle marker press to show user details
  const handleMarkerPress = (user: User) => {
    setSelectedUser(user);
  };

  // Handle greeting functionality
  const handleGreet = (user: User) => {
    // TODO: Implement greeting functionality (e.g., open Telegram or send email)
    Alert.alert(
      'Greet User',
      `Say hello to ${user.nickname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
          // TODO: Implement greeting logic
          console.log('Greeting:', user.nickname);
        }},
      ]
    );
  };

  // Refresh nearby users
  const handleRefresh = async () => {
    if (currentLocation) {
      await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude);
    }
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
            title="My Location"
            description="You are here"
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
          >
            <View style={styles.markerContainer}>
              <Avatar.Image
                size={40}
                source={
                  user.avatar_url
                    ? { uri: user.avatar_url }
                    : require('../../../assets/default-avatar.png')
                }
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Selected user information card */}
      {selectedUser && (
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userHeader}>
              <Avatar.Image
                size={50}
                source={
                  selectedUser.avatar_url
                    ? { uri: selectedUser.avatar_url }
                    : require('../../../assets/default-avatar.png')
                }
              />
              <View style={styles.userInfo}>
                <Title>{selectedUser.nickname}</Title>
                <Paragraph>{selectedUser.current_city}</Paragraph>
              </View>
            </View>

            {selectedUser.bio && (
              <Paragraph style={styles.bio}>{selectedUser.bio}</Paragraph>
            )}

            <View style={styles.languagesContainer}>
              {selectedUser.languages.map((lang, index) => (
                <Chip key={index} style={styles.chip}>
                  {lang}
                </Chip>
              ))}
            </View>

            <View style={styles.interestsContainer}>
              {selectedUser.interests.map((interest, index) => (
                <Chip key={index} style={styles.chip} mode="outlined">
                  {interest}
                </Chip>
              ))}
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => handleGreet(selectedUser)}
                style={styles.greetButton}
              >
                Greet
              </Button>
              <Button
                mode="outlined"
                onPress={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Refresh button */}
      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={handleRefresh}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    elevation: 8,
    borderRadius: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  bio: {
    marginBottom: 12,
    fontStyle: 'italic',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greetButton: {
    flex: 1,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 