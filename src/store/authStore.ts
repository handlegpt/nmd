import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
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
        
        set({ user: data.user, session: data.session });
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