import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Location as LocationType, MapState } from '../types';
import * as ExpoLocation from 'expo-location';
import { useAuthStore } from './authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reverseGeocode } from '../utils/geocoding';

interface MapStore extends MapState {
  getCurrentLocation: () => Promise<void>;
  updateLocation: (location: LocationType) => Promise<void>;
  fetchNearbyUsers: (latitude: number, longitude: number, radius: number) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  updateLocationInterval: (interval: number) => void;
  // New location sharing features
  locationHistory: LocationHistory[];
  addToLocationHistory: (location: LocationHistory) => Promise<void>;
  getLocationHistory: () => Promise<LocationHistory[]>;
  clearLocationHistory: () => Promise<void>;
  shareSettings: ShareSettings;
  updateShareSettings: (settings: Partial<ShareSettings>) => void;
  startRealTimeSharing: () => void;
  stopRealTimeSharing: () => void;
  isRealTimeSharing: boolean;
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
  sharedWith: string[];
  privacyLevel: 'private' | 'friends' | 'public';
}

interface ShareSettings {
  shareRealTime: boolean;
  sharePreciseLocation: boolean;
  shareWithFriends: boolean;
  shareWithPublic: boolean;
  autoShare: boolean;
  locationUpdateInterval: number; // in minutes
  privacyLevel: 'private' | 'friends' | 'public';
}

let locationSubscription: ExpoLocation.LocationSubscription | null = null;
let locationUpdateInterval: NodeJS.Timeout | null = null;
let realTimeSharingInterval: NodeJS.Timeout | null = null;

export const useMapStore = create<MapStore>((set, get) => ({
  currentLocation: null,
  nearbyUsers: [],
  selectedUser: null,
  loading: false,
  locationHistory: [],
  isRealTimeSharing: false,
  shareSettings: {
    shareRealTime: false,
    sharePreciseLocation: true,
    shareWithFriends: true,
    shareWithPublic: false,
    autoShare: false,
    locationUpdateInterval: 5,
    privacyLevel: 'friends',
  },

  // Get current user location with enhanced accuracy
  getCurrentLocation: async () => {
    set({ loading: true });
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission required');
      }

      const { shareSettings } = get();
      const accuracy = shareSettings.sharePreciseLocation 
        ? ExpoLocation.Accuracy.High 
        : ExpoLocation.Accuracy.Balanced;

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 10, // 10 meters
      });
      
      // Get location details using reverse geocoding
      const geocodingResult = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: geocodingResult.city,
        country: geocodingResult.country,
      };

      set({ currentLocation });

      // Update user location in database
      const { user } = useAuthStore.getState();
      if (user) {
        await get().updateLocation(currentLocation);
        
        // Add to location history
        const historyItem: LocationHistory = {
          id: `current_${Date.now()}`,
          name: 'Current Location',
          address: `${currentLocation.city}, ${currentLocation.country}`,
          coordinates: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          timestamp: Date.now(),
          isCurrent: true,
          sharedWith: [],
          privacyLevel: get().shareSettings.privacyLevel,
        };
        
        await get().addToLocationHistory(historyItem);
      }
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update location in database with privacy controls
  updateLocation: async (location: LocationType) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { shareSettings } = get();
      
      // Only update if sharing is enabled
      if (!shareSettings.shareWithFriends && !shareSettings.shareWithPublic) {
        console.log('Location sharing disabled');
        return;
      }

      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          privacy_level: shareSettings.privacyLevel,
          shared_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Update location error:', error);
      }
    } catch (error) {
      console.error('Update location error:', error);
    }
  },

  // Fetch nearby users with privacy filtering
  fetchNearbyUsers: async (latitude: number, longitude: number, radius: number) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          *,
          user_locations (
            latitude,
            longitude,
            city,
            country,
            privacy_level,
            shared_at
          )
        `)
        .eq('is_visible', true);

      if (error) {
        console.error('Fetch nearby users error:', error);
        return;
      }

      // Filter users by distance and privacy settings
      const nearbyUsers = users
        .filter(user => user.user_locations && user.user_locations.length > 0)
        .map(user => ({
          ...user,
          location: user.user_locations[0],
        }))
        .filter(user => {
          // Check privacy level
          const privacyLevel = user.location.privacy_level || 'friends';
          if (privacyLevel === 'private') return false;
          
          // Calculate distance
          const distance = calculateDistance(
            latitude,
            longitude,
            user.location.latitude,
            user.location.longitude
          );
          return distance <= radius;
        })
        .sort((a, b) => {
          const distanceA = calculateDistance(
            latitude,
            longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distanceB = calculateDistance(
            latitude,
            longitude,
            b.location.latitude,
            b.location.longitude
          );
          return distanceA - distanceB;
        });

      set({ nearbyUsers });
    } catch (error) {
      console.error('Fetch nearby users error:', error);
    }
  },

  // Set selected user
  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Start location tracking with enhanced features
  startLocationTracking: () => {
    const updateLocation = async () => {
      try {
        await get().getCurrentLocation();
        const { currentLocation } = get();
        if (currentLocation) {
          await get().fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 10);
        }
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    // Initial location update
    updateLocation();

    const { shareSettings } = get();
    const interval = shareSettings.locationUpdateInterval * 60 * 1000; // Convert to milliseconds

    // Set up periodic location updates
    locationUpdateInterval = setInterval(updateLocation, interval);
  },

  // Stop location tracking
  stopLocationTracking: () => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
    if (realTimeSharingInterval) {
      clearInterval(realTimeSharingInterval);
      realTimeSharingInterval = null;
    }
    set({ isRealTimeSharing: false });
  },

  // Update location tracking interval
  updateLocationInterval: (interval: number) => {
    get().stopLocationTracking();
    
    const updateLocation = async () => {
      try {
        await get().getCurrentLocation();
        const { currentLocation } = get();
        if (currentLocation) {
          await get().fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 10);
        }
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    // Initial location update
    updateLocation();

    // Set up periodic location updates with new interval
    locationUpdateInterval = setInterval(updateLocation, interval * 60 * 1000);
  },

  // Location history management
  addToLocationHistory: async (location: LocationHistory) => {
    try {
      const { locationHistory } = get();
      const updatedHistory = [location, ...locationHistory.filter(item => !item.isCurrent)];
      
      // Keep only last 50 locations
      const trimmedHistory = updatedHistory.slice(0, 50);
      
      set({ locationHistory: trimmedHistory });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('location_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding to location history:', error);
    }
  },

  getLocationHistory: async () => {
    try {
      const history = await AsyncStorage.getItem('location_history');
      if (history) {
        const parsedHistory = JSON.parse(history);
        set({ locationHistory: parsedHistory });
        return parsedHistory;
      }
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  },

  clearLocationHistory: async () => {
    try {
      await AsyncStorage.removeItem('location_history');
      set({ locationHistory: [] });
    } catch (error) {
      console.error('Error clearing location history:', error);
    }
  },

  // Share settings management
  updateShareSettings: (settings: Partial<ShareSettings>) => {
    const currentSettings = get().shareSettings;
    const newSettings = { ...currentSettings, ...settings };
    set({ shareSettings: newSettings });
    
    // Save settings to AsyncStorage
    AsyncStorage.setItem('share_settings', JSON.stringify(newSettings));
  },

  // Real-time location sharing
  startRealTimeSharing: () => {
    const { shareSettings } = get();
    
    if (!shareSettings.shareRealTime) {
      console.log('Real-time sharing not enabled');
      return;
    }

    set({ isRealTimeSharing: true });

    const shareLocation = async () => {
      try {
        await get().getCurrentLocation();
        const { currentLocation } = get();
        if (currentLocation) {
          await get().updateLocation(currentLocation);
        }
      } catch (error) {
        console.error('Real-time sharing error:', error);
      }
    };

    // Share location every 30 seconds when real-time sharing is enabled
    realTimeSharingInterval = setInterval(shareLocation, 30000);
  },

  stopRealTimeSharing: () => {
    if (realTimeSharingInterval) {
      clearInterval(realTimeSharingInterval);
      realTimeSharingInterval = null;
    }
    set({ isRealTimeSharing: false });
  },
}));

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
} 