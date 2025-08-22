import { supabase } from '../lib/supabase';
import { User, Location, Message, Post, Comment, Notification } from '../types';

// Database service for handling all database operations
export class DatabaseService {
  // User operations
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Location operations
  static async updateUserLocation(userId: string, location: Location): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: userId,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user location:', error);
      return false;
    }
  }

  static async getNearbyUsers(latitude: number, longitude: number, radius: number = 10): Promise<User[]> {
    try {
      // Simple distance calculation (in production, use PostGIS for better performance)
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          user_id,
          latitude,
          longitude,
          city,
          country,
          users!inner(*)
        `)
        .gte('latitude', latitude - radius / 111) // Rough conversion to degrees
        .lte('latitude', latitude + radius / 111)
        .gte('longitude', longitude - radius / (111 * Math.cos(latitude * Math.PI / 180)))
        .lte('longitude', longitude + radius / (111 * Math.cos(latitude * Math.PI / 180)));

      if (error) throw error;
      return data?.map(item => item.users) || [];
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }

  // Post operations
  static async createPost(postData: Partial<Post>): Promise<Post | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!inner(nickname, avatar_url),
          comments(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  static async likePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: supabase.raw('likes + 1') })
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  // Comment operations
  static async createComment(commentData: Partial<Comment>): Promise<Comment | null> {
    try {
      console.log('🔍 DatabaseService: Creating comment', commentData);
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) {
        console.error('🔍 DatabaseService: Comment creation error', error);
        throw error;
      }
      
      console.log('🔍 DatabaseService: Comment created successfully', data);
      return data;
    } catch (error) {
      console.error('🔍 DatabaseService: Error creating comment:', error);
      return null;
    }
  }

  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users!inner(nickname, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  // Message operations
  static async sendMessage(messageData: Partial<Message>): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  static async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:users!from_user_id(nickname, avatar_url),
          to_user:users!to_user_id(nickname, avatar_url)
        `)
        .or(`and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Notification operations
  static async createNotification(notificationData: Partial<Notification>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:users!from_user_id(nickname, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // File upload operations
  static async uploadFile(file: File, path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }
}
