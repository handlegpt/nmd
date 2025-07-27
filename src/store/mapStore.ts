import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Location as LocationType, MapState } from '../types';
import * as ExpoLocation from 'expo-location';
import { useAuthStore } from './authStore';

interface MapStore extends MapState {
  getCurrentLocation: () => Promise<void>;
  updateLocation: (location: LocationType) => Promise<void>;
  fetchNearbyUsers: (latitude: number, longitude: number, radius: number) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  updateLocationInterval: (interval: number) => void;
}

let locationSubscription: ExpoLocation.LocationSubscription | null = null;
let locationUpdateInterval: NodeJS.Timeout | null = null;

export const useMapStore = create<MapStore>((set, get) => ({
  currentLocation: null,
  nearbyUsers: [],
  selectedUser: null,
  loading: false,

  // Get current user location
  getCurrentLocation: async () => {
    set({ loading: true });
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission required');
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });
      
      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: 'Unknown City', // Can be enhanced with reverse geocoding
        country: 'Unknown Country',
      };

      set({ currentLocation });

      // Update user location in database
      const { user } = useAuthStore.getState();
      if (user) {
        await get().updateLocation(currentLocation);
      }
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update location in database
  updateLocation: async (location: LocationType) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        });

      if (error) {
        console.error('Update location error:', error);
      }
    } catch (error) {
      console.error('Update location error:', error);
    }
  },

  // Fetch nearby users
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
            country
          )
        `)
        .eq('is_visible', true);

      if (error) {
        console.error('Fetch nearby users error:', error);
        return;
      }

      // Filter users by distance
      const nearbyUsers = users
        .filter(user => user.user_locations && user.user_locations.length > 0)
        .map(user => ({
          ...user,
          location: user.user_locations[0],
        }))
        .filter(user => {
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

  // Start location tracking
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

    // Set up periodic location updates (every 5 minutes)
    locationUpdateInterval = setInterval(updateLocation, 5 * 60 * 1000);
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
    locationUpdateInterval = setInterval(updateLocation, interval);
  },
}));

// Calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
} 