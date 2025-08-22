import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

export class LocationPermissionManager {
  // Request location permission with proper error handling
  static async requestPermission(): Promise<LocationPermissionStatus> {
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openSettings() }
          ]
        );
        return {
          granted: false,
          canAskAgain: true,
          status: Location.PermissionStatus.DENIED
        };
      }

      // Request permission
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === Location.PermissionStatus.GRANTED,
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Location permission request error:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: Location.PermissionStatus.DENIED
      };
    }
  }

  // Check current permission status
  static async checkPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      
      return {
        granted: status === Location.PermissionStatus.GRANTED,
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Location permission check error:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: Location.PermissionStatus.DENIED
      };
    }
  }

  // Get current location with permission handling
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      // Check permission first
      const permission = await this.checkPermission();
      
      if (!permission.granted) {
        // Request permission if not granted
        const newPermission = await this.requestPermission();
        if (!newPermission.granted) {
          throw new Error('Location permission required');
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return location;
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    }
  }

  // Get location with geocoding
  static async getLocationWithAddress(): Promise<{
    location: Location.LocationObject;
    address: string;
    city: string;
    country: string;
  } | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      // Reverse geocoding
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        return {
          location,
          address: `${address.street || ''} ${address.name || ''}`.trim(),
          city: address.city || address.subregion || 'Unknown City',
          country: address.country || 'Unknown Country',
        };
      }

      return {
        location,
        address: 'Unknown Address',
        city: 'Unknown City',
        country: 'Unknown Country',
      };
    } catch (error) {
      console.error('Get location with address error:', error);
      throw error;
    }
  }

  // Open device settings
  private static openSettings() {
    if (Platform.OS === 'ios') {
      // For iOS, we can't directly open settings, but we can show instructions
      Alert.alert(
        'Open Settings',
        'Please go to Settings > Privacy & Security > Location Services and enable location access for this app.',
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      // For Android, we can try to open settings
      // Note: This requires additional permissions in AndroidManifest.xml
      Alert.alert(
        'Open Settings',
        'Please go to Settings > Apps > NomadNow > Permissions and enable location access.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }

  // Watch location changes
  static async watchLocation(
    callback: (location: Location.LocationObject) => void,
    errorCallback?: (error: any) => void
  ): Promise<() => void> {
    try {
      const permission = await this.checkPermission();
      if (!permission.granted) {
        throw new Error('Location permission required');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 100, // 100 meters
        },
        callback
      );

      return () => subscription.remove();
    } catch (error) {
      console.error('Watch location error:', error);
      errorCallback?.(error);
      return () => {};
    }
  }

  // Calculate distance between two points
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
