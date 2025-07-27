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
}

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

      const location = await ExpoLocation.getCurrentPositionAsync({});
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

  // Update user location in database
  updateLocation: async (location: LocationType) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Update location in users table
      await supabase
        .from('users')
        .update({
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        })
        .eq('id', user.id);

      // Insert location history
      await supabase
        .from('user_locations')
        .insert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        });
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  },

  // Fetch nearby users within specified radius
  fetchNearbyUsers: async (latitude: number, longitude: number, radius: number = 50) => {
    set({ loading: true });
    try {
      // Query visible users (consider using PostGIS for better performance)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('id', 'eq', useAuthStore.getState().user?.id)
        .eq('is_visible', true);

      if (error) throw error;

      // Simple distance calculation (consider using PostGIS for production)
      const nearbyUsers = data.filter((user: User) => {
        if (!user.location) return false;
        
        const distance = calculateDistance(
          latitude,
          longitude,
          user.location.latitude,
          user.location.longitude
        );
        
        return distance <= radius;
      });

      set({ nearbyUsers });
    } catch (error) {
      console.error('Fetch nearby users error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedUser: (user: User | null) => set({ selectedUser: user }),
  setLoading: (loading: boolean) => set({ loading }),
}));

// Calculate distance between two points in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 