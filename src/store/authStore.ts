import { create } from 'zustand';
import { supabase, isMockMode } from '../lib/supabase';
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

// Mock user data for demo
const mockUser: User = {
  id: 'mock-user-id',
  email: 'demo@nomadnow.com',
  nickname: 'Demo Nomad',
  avatar_url: 'https://via.placeholder.com/80x80/2196f3/ffffff?text=D',
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
  user: null,
  session: null,
  loading: false,

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      if (isMockMode) {
        // Mock sign in
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ user: mockUser, session: { user: mockUser } });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch user profile from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        set({ user: userData, session: data.session });
      }
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
      if (isMockMode) {
        // Mock sign up
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newMockUser = { ...mockUser, email, nickname };
        set({ user: newMockUser, session: { user: newMockUser } });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            nickname,
            current_city: '',
            languages: [],
            interests: [],
          });
        
        if (profileError) throw profileError;
        
        // Create a proper User object from the auth user
        const userProfile: User = {
          id: data.user.id,
          email: data.user.email || '',
          nickname,
          current_city: '',
          languages: [],
          interests: [],
          is_visible: true,
          is_available_for_meetup: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set({ user: userProfile, session: data.session });
      }
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
      if (isMockMode) {
        // Mock sign out
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ user: null, session: null });
        return;
      }

      await supabase.auth.signOut();
      set({ user: null, session: null });
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
      if (isMockMode) {
        // Mock profile update
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
        set({ user: updatedUser });
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ user: data });
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