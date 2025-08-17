import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Switch,
  Divider,
  List,
  IconButton,
  Surface,
  Chip,
  Modal,
  Portal,
  TextInput,
  useTheme,
} from 'react-native-paper';
import * as ExpoLocation from 'expo-location';
import { useAuthStore } from '../../store/authStore';
import { useMapStore } from '../../store/mapStore';
import Toast from './Toast';

interface LocationShareProps {
  visible: boolean;
  onDismiss: () => void;
  onLocationSelect?: (location: any) => void;
  mode?: 'share' | 'select';
}

interface LocationHistory {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  isCurrent: boolean;
}

export const LocationShare: React.FC<LocationShareProps> = ({
  visible,
  onDismiss,
  onLocationSelect,
  mode = 'share',
}) => {
  const { user } = useAuthStore();
  const { currentLocation, updateLocation } = useMapStore();
  const theme = useTheme();
  
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [shareSettings, setShareSettings] = useState({
    shareRealTime: false,
    sharePreciseLocation: true,
    shareWithFriends: true,
    shareWithPublic: false,
    autoShare: false,
  });
  const [customLocation, setCustomLocation] = useState({
    name: '',
    address: '',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    if (visible) {
      loadLocationHistory();
    }
  }, [visible]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const loadLocationHistory = async () => {
    try {
      // Load from AsyncStorage or database
      const history = [
        {
          id: '1',
          name: 'Canggu Coworking Space',
          address: 'Canggu, Bali, Indonesia',
          coordinates: { latitude: -8.6500, longitude: 115.1333 },
          timestamp: Date.now() - 3600000, // 1 hour ago
          isCurrent: false,
        },
        {
          id: '2',
          name: 'Uluwatu Beach',
          address: 'Uluwatu, Bali, Indonesia',
          coordinates: { latitude: -8.8167, longitude: 115.0833 },
          timestamp: Date.now() - 7200000, // 2 hours ago
          isCurrent: false,
        },
      ];

      if (currentLocation) {
        history.unshift({
          id: 'current',
          name: 'Current Location',
          address: `${currentLocation.city}, ${currentLocation.country}`,
          coordinates: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          timestamp: Date.now(),
          isCurrent: true,
        });
      }

      setLocationHistory(history);
    } catch (error) {
      console.error('Error loading location history:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to share your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: shareSettings.sharePreciseLocation 
          ? ExpoLocation.Accuracy.High 
          : ExpoLocation.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: 'Current Location',
        country: 'Unknown',
      };

      await updateLocation(newLocation);
      showToast('Current location updated!', 'success');
      
      // Add to history
      const historyItem: LocationHistory = {
        id: `current_${Date.now()}`,
        name: 'Current Location',
        address: `${newLocation.city}, ${newLocation.country}`,
        coordinates: { latitude: newLocation.latitude, longitude: newLocation.longitude },
        timestamp: Date.now(),
        isCurrent: true,
      };

      setLocationHistory(prev => [historyItem, ...prev.filter(item => !item.isCurrent)]);
    } catch (error) {
      showToast('Failed to get current location', 'error');
    }
  };

  const handleLocationSelect = (location: LocationHistory) => {
    if (mode === 'select' && onLocationSelect) {
      onLocationSelect(location);
      onDismiss();
    } else {
      shareLocation(location);
    }
  };

  const shareLocation = async (location: LocationHistory) => {
    try {
      // Share location logic here
      const shareData = {
        ...location,
        sharedBy: user?.nickname,
        sharedAt: new Date().toISOString(),
        settings: shareSettings,
      };

      console.log('Sharing location:', shareData);
      showToast('Location shared successfully!', 'success');
      
      // Add to history if not already there
      if (!locationHistory.find(item => item.id === location.id)) {
        setLocationHistory(prev => [location, ...prev]);
      }
    } catch (error) {
      showToast('Failed to share location', 'error');
    }
  };

  const handleRealTimeShare = async (enabled: boolean) => {
    setShareSettings(prev => ({ ...prev, shareRealTime: enabled }));
    
    if (enabled) {
      Alert.alert(
        'Real-time Location Sharing',
        'This will continuously share your location. You can stop sharing anytime.',
        [
          { text: 'Cancel', onPress: () => setShareSettings(prev => ({ ...prev, shareRealTime: false })) },
          { text: 'Start Sharing', onPress: () => {
            showToast('Real-time location sharing started', 'success');
          }},
        ]
      );
    } else {
      showToast('Real-time location sharing stopped', 'info');
    }
  };

  const handleCustomLocation = () => {
    if (!customLocation.name || !customLocation.address) {
      showToast('Please enter location name and address', 'warning');
      return;
    }

    const newLocation: LocationHistory = {
      id: `custom_${Date.now()}`,
      name: customLocation.name,
      address: customLocation.address,
      coordinates: { latitude: 0, longitude: 0 }, // Would need geocoding
      timestamp: Date.now(),
      isCurrent: false,
    };

    setLocationHistory(prev => [newLocation, ...prev]);
    setCustomLocation({ name: '', address: '' });
    showToast('Custom location added!', 'success');
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <View style={styles.header}>
            <Title style={styles.title}>
              {mode === 'select' ? 'Choose Location' : 'Share Location'}
            </Title>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          <Divider />

          {/* Current Location Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Current Location</Title>
              <Button
                mode="contained"
                onPress={handleGetCurrentLocation}
                icon="crosshairs-gps"
                style={styles.currentLocationButton}
              >
                Get Current Location
              </Button>
              {currentLocation && (
                <View style={styles.currentLocationInfo}>
                  <Paragraph style={styles.locationText}>
                    📍 {currentLocation.city}, {currentLocation.country}
                  </Paragraph>
                  <Chip icon="check" style={styles.verifiedChip}>
                    Verified
                  </Chip>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Share Settings */}
          {mode === 'share' && (
            <Card style={styles.section}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Share Settings</Title>
                
                <List.Item
                  title="Real-time Sharing"
                  description="Continuously share your location"
                  left={(props) => <List.Icon {...props} icon="radar" />}
                  right={() => (
                    <Switch
                      value={shareSettings.shareRealTime}
                      onValueChange={handleRealTimeShare}
                      color="#6366f1"
                    />
                  )}
                />
                
                <List.Item
                  title="Precise Location"
                  description="Share exact coordinates"
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                  right={() => (
                    <Switch
                      value={shareSettings.sharePreciseLocation}
                      onValueChange={(value) => setShareSettings(prev => ({ ...prev, sharePreciseLocation: value }))}
                      color="#6366f1"
                    />
                  )}
                />
                
                <List.Item
                  title="Share with Friends"
                  description="Visible to your connections"
                  left={(props) => <List.Icon {...props} icon="account-group" />}
                  right={() => (
                    <Switch
                      value={shareSettings.shareWithFriends}
                      onValueChange={(value) => setShareSettings(prev => ({ ...prev, shareWithFriends: value }))}
                      color="#6366f1"
                    />
                  )}
                />
                
                <List.Item
                  title="Public Sharing"
                  description="Visible to all users"
                  left={(props) => <List.Icon {...props} icon="earth" />}
                  right={() => (
                    <Switch
                      value={shareSettings.shareWithPublic}
                      onValueChange={(value) => setShareSettings(prev => ({ ...prev, shareWithPublic: value }))}
                      color="#6366f1"
                    />
                  )}
                />
              </Card.Content>
            </Card>
          )}

          {/* Location History */}
          <Card style={styles.section}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Recent Locations</Title>
              {locationHistory.map((location) => (
                <List.Item
                  key={location.id}
                  title={location.name}
                  description={`${location.address} • ${formatTimestamp(location.timestamp)}`}
                  left={(props) => (
                    <List.Icon 
                      {...props} 
                      icon={location.isCurrent ? "crosshairs-gps" : "map-marker"} 
                      color={location.isCurrent ? "#6366f1" : "#64748b"}
                    />
                  )}
                  right={(props) => (
                    <View style={styles.locationActions}>
                      {location.isCurrent && (
                        <Chip icon="check" style={styles.currentChip} textStyle={styles.currentChipText}>
                          Current
                        </Chip>
                      )}
                      <IconButton
                        {...props}
                        icon={mode === 'select' ? "check" : "share"}
                        size={20}
                        onPress={() => handleLocationSelect(location)}
                      />
                    </View>
                  )}
                  style={styles.locationItem}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Custom Location */}
          <Card style={styles.section}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Add Custom Location</Title>
              <TextInput
                label="Location Name"
                value={customLocation.name}
                onChangeText={(text) => setCustomLocation(prev => ({ ...prev, name: text }))}
                style={styles.textInput}
                mode="outlined"
              />
              <TextInput
                label="Address"
                value={customLocation.address}
                onChangeText={(text) => setCustomLocation(prev => ({ ...prev, address: text }))}
                style={styles.textInput}
                mode="outlined"
              />
              <Button
                mode="outlined"
                onPress={handleCustomLocation}
                icon="plus"
                style={styles.addButton}
              >
                Add Location
              </Button>
            </Card.Content>
          </Card>
        </Surface>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  currentLocationButton: {
    marginBottom: 12,
    backgroundColor: '#6366f1',
  },
  currentLocationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  verifiedChip: {
    backgroundColor: '#10b981',
  },
  locationItem: {
    paddingVertical: 8,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentChip: {
    backgroundColor: '#6366f1',
    marginRight: 8,
  },
  currentChipText: {
    color: '#ffffff',
    fontSize: 10,
  },
  textInput: {
    marginBottom: 12,
  },
  addButton: {
    borderColor: '#6366f1',
  },
});
