import { supabase } from '../lib/supabase';
import { User, Location, Message, Post, Comment, Notification } from '../types';
import CacheService from './cacheService';
import { sanitizeInput, validateUrl } from '../utils/securityManager';
import { addCSRFTokenToHeaders } from '../utils/csrfProtection';

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
      // Sanitize user input
      const sanitizedData = {
        ...postData,
        content: sanitizeInput(postData.content || ''),
        title: sanitizeInput(postData.title || ''),
        location: sanitizeInput(postData.location || '')
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate posts cache when new post is created
      CacheService.invalidatePostsCache();
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const page = Math.floor(offset / limit);
    
    // Try cache first
    const cachedPosts = await CacheService.getCachedPosts(page);
    if (cachedPosts) {
              // Returning cached posts (silent in production)
      return cachedPosts;
    }

    try {
              // Fetching posts from database (silent in production)
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
      
      const posts = data || [];
      
      // Cache the results
      await CacheService.cachePosts(posts, page);
      
      return posts;
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
      // Sanitize user input
      const sanitizedData = {
        ...commentData,
        content: sanitizeInput(commentData.content || '')
      };

      // Creating comment (silent in production)
      const { data, error } = await supabase
        .from('comments')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        console.error('🔍 DatabaseService: Comment creation error', error);
        throw error;
      }
      
      // Invalidate comments cache for this post
      if (commentData.post_id) {
        await CacheService.invalidateCommentsCache(commentData.post_id);
      }
      
      // Comment created successfully (silent in production)
      return data;
    } catch (error) {
      console.error('🔍 DatabaseService: Error creating comment:', error);
      return null;
    }
  }

  static async getComments(postId: string): Promise<Comment[]> {
    // Try cache first
    const cachedComments = await CacheService.getCachedComments(postId);
    if (cachedComments) {
              // Returning cached comments (silent in production)
      return cachedComments;
    }

    try {
              // Fetching comments from database (silent in production)
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users(nickname, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const comments = data || [];
      
      // Cache the results
      await CacheService.cacheComments(postId, comments);
      
      return comments;
    } catch (error) {
      console.error('Error getting comments:', error);
      console.error('Post ID:', postId);
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

  static async getConversations(userId: string): Promise<Message[]> {
    try {
      // Get the latest message from each conversation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:users!from_user_id(id, nickname, avatar_url),
          to_user:users!to_user_id(id, nickname, avatar_url)
        `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation and get the latest message from each
      const conversations = new Map<string, Message>();
      data?.forEach(message => {
        const otherUserId = message.from_user_id === userId ? message.to_user_id : message.from_user_id;
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, message);
        }
      });

      return Array.from(conversations.values());
    } catch (error) {
      console.error('Error getting conversations:', error);
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

  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  static async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
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

  // User profile methods
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          work_experience(*),
          education(*),
          travel_history(*),
          preferences(*),
          stats(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  static async addWorkExperience(userId: string, experience: Omit<WorkExperience, 'id'>): Promise<WorkExperience | null> {
    try {
      const { data, error } = await supabase
        .from('work_experience')
        .insert({ ...experience, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding work experience:', error);
      return null;
    }
  }

  static async updateWorkExperience(experienceId: string, experience: Partial<WorkExperience>): Promise<WorkExperience | null> {
    try {
      const { data, error } = await supabase
        .from('work_experience')
        .update(experience)
        .eq('id', experienceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating work experience:', error);
      return null;
    }
  }

  static async deleteWorkExperience(experienceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting work experience:', error);
      return false;
    }
  }

  static async addEducation(userId: string, education: Omit<Education, 'id'>): Promise<Education | null> {
    try {
      const { data, error } = await supabase
        .from('education')
        .insert({ ...education, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding education:', error);
      return null;
    }
  }

  static async updateEducation(educationId: string, education: Partial<Education>): Promise<Education | null> {
    try {
      const { data, error } = await supabase
        .from('education')
        .update(education)
        .eq('id', educationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating education:', error);
      return null;
    }
  }

  static async deleteEducation(educationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', educationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      return false;
    }
  }

  static async addTravelHistory(userId: string, travel: Omit<TravelHistory, 'id'>): Promise<TravelHistory | null> {
    try {
      const { data, error } = await supabase
        .from('travel_history')
        .insert({ ...travel, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding travel history:', error);
      return null;
    }
  }

  static async updateTravelHistory(travelId: string, travel: Partial<TravelHistory>): Promise<TravelHistory | null> {
    try {
      const { data, error } = await supabase
        .from('travel_history')
        .update(travel)
        .eq('id', travelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating travel history:', error);
      return null;
    }
  }

  static async deleteTravelHistory(travelId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('travel_history')
        .delete()
        .eq('id', travelId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting travel history:', error);
      return false;
    }
  }

  // Follow/Unfollow methods
  static async followUser(followerId: string, followingId: string): Promise<FollowRelationship | null> {
    try {
      const { data, error } = await supabase
        .from('follow_relationships')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error following user:', error);
      return null;
    }
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follow_relationships')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  static async getFollowers(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('follow_relationships')
        .select(`
          follower:users!follower_id(*)
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return data?.map(item => item.follower).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  static async getFollowing(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('follow_relationships')
        .select(`
          following:users!following_id(*)
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      return data?.map(item => item.following).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follow_relationships')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  // User stats methods
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  static async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .upsert({ user_id: userId, ...stats })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return null;
    }
  }

  // User preferences methods
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...preferences })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }
  }
}
