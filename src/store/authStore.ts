import { create } from 'zustand';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
}

// Default user data for when user signs in
const defaultUser: User = {
  id: 'default-user-id',
  email: 'user@nomadnow.com',
  nickname: 'Nomad User',
  avatar_url: 'https://via.placeholder.com/80x80/2196f3/ffffff?text=N',
  bio: 'Digital nomad exploring the world!',
  current_city: 'Bali, Indonesia',
  languages: ['English', 'Spanish'],
  interests: ['Coding', 'Travel', 'Coffee'],
  skills: ['JavaScript', 'React', 'Travel Planning'],
  is_visible: true,
  is_available_for_meetup: true,
  location: { latitude: -8.3405, longitude: 115.0920 },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null, // Start with no user (guest mode)
  session: null,
  loading: false,

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ 
          user: userData || { ...defaultUser, id: data.user.id, email: data.user.email || email },
          session: data.session 
        });
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
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
            current_city: 'Unknown City',
            languages: ['English'],
            interests: [],
            skills: [],
            is_visible: true,
            is_available_for_meetup: true,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        set({ 
          user: { ...defaultUser, id: data.user.id, email, nickname },
          session: data.session 
        });
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser = { ...user, ...data, updated_at: new Date().toISOString() };
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