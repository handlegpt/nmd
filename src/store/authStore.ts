import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
}

// Default user data for immediate access
const defaultUser: User = {
  id: 'default-user-id',
  email: 'user@nomadnow.com',
  nickname: 'Nomad User',
  avatar_url: 'https://via.placeholder.com/80x80/2196f3/ffffff?text=N',
  bio: 'Digital nomad exploring the world!',
  current_city: 'Bali, Indonesia',
  languages: ['English', 'Spanish'],
  interests: ['Coding', 'Travel', 'Coffee'],
  is_visible: true,
  is_available_for_meetup: true,
  location: { latitude: -8.3405, longitude: 115.0920 },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: defaultUser, // Start with default user
  session: { user: defaultUser },
  loading: false,

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      // Mock sign in
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userWithEmail = { ...defaultUser, email, nickname: email.split('@')[0] };
      set({ user: userWithEmail, session: { user: userWithEmail } });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Sign up with email, password and nickname
  signUp: async (email: string, password: string, nickname: string) => {
    set({ loading: true });
    try {
      // Mock sign up
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = { ...defaultUser, email, nickname };
      set({ user: newUser, session: { user: newUser } });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Sign out user
  signOut: async () => {
    set({ loading: true });
    try {
      // Mock sign out
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ user: defaultUser, session: { user: defaultUser } });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;
    
    set({ loading: true });
    try {
      // Mock profile update
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: any | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),
})); 