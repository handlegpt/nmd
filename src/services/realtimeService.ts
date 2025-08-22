import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Post, Comment, Message, User } from '../types';
import CacheService from './cacheService';

interface RealtimeEventHandlers {
  onPostCreated?: (post: Post) => void;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onCommentCreated?: (comment: Comment, postId: string) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string, postId: string) => void;
  onMessageReceived?: (message: Message) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

class RealtimeService {
  private static instance: RealtimeService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: RealtimeEventHandlers = {};
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Initialize realtime connections
  async initialize(userId?: string): Promise<void> {
    try {
      console.log('🔄 RealtimeService: Initializing realtime connections');
      
      // Subscribe to posts changes
      await this.subscribeToPostsChanges();
      
      // Subscribe to comments changes
      await this.subscribeToCommentsChanges();
      
      // Subscribe to user-specific messages if userId provided
      if (userId) {
        await this.subscribeToMessages(userId);
        await this.subscribeToUserPresence(userId);
      }

      this.isConnected = true;
      console.log('✅ RealtimeService: Realtime connections established');
    } catch (error) {
      console.error('❌ RealtimeService: Failed to initialize:', error);
    }
  }

  // Set event handlers
  setEventHandlers(handlers: RealtimeEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Subscribe to posts table changes
  private async subscribeToPostsChanges(): Promise<void> {
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('🔄 RealtimeService: New post created', payload.new);
          
          // Invalidate posts cache
          CacheService.invalidatePostsCache();
          
          // Call handler if available
          if (this.eventHandlers.onPostCreated) {
            this.eventHandlers.onPostCreated(payload.new as Post);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('🔄 RealtimeService: Post updated', payload.new);
          
          // Invalidate posts cache
          CacheService.invalidatePostsCache();
          
          // Call handler if available
          if (this.eventHandlers.onPostUpdated) {
            this.eventHandlers.onPostUpdated(payload.new as Post);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('🔄 RealtimeService: Post deleted', payload.old);
          
          // Invalidate posts cache
          CacheService.invalidatePostsCache();
          
          // Call handler if available
          if (this.eventHandlers.onPostDeleted && payload.old?.id) {
            this.eventHandlers.onPostDeleted(payload.old.id);
          }
        }
      )
      .subscribe();

    this.channels.set('posts_changes', channel);
  }

  // Subscribe to comments table changes
  private async subscribeToCommentsChanges(): Promise<void> {
    const channel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('🔄 RealtimeService: New comment created', payload.new);
          
          const comment = payload.new as Comment;
          
          // Invalidate comments cache for this post
          if (comment.post_id) {
            CacheService.invalidateCommentsCache(comment.post_id);
          }
          
          // Call handler if available
          if (this.eventHandlers.onCommentCreated && comment.post_id) {
            this.eventHandlers.onCommentCreated(comment, comment.post_id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('🔄 RealtimeService: Comment updated', payload.new);
          
          const comment = payload.new as Comment;
          
          // Invalidate comments cache for this post
          if (comment.post_id) {
            CacheService.invalidateCommentsCache(comment.post_id);
          }
          
          // Call handler if available
          if (this.eventHandlers.onCommentUpdated) {
            this.eventHandlers.onCommentUpdated(comment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('🔄 RealtimeService: Comment deleted', payload.old);
          
          const oldComment = payload.old as Comment;
          
          // Invalidate comments cache for this post
          if (oldComment.post_id) {
            CacheService.invalidateCommentsCache(oldComment.post_id);
          }
          
          // Call handler if available
          if (this.eventHandlers.onCommentDeleted && oldComment.id && oldComment.post_id) {
            this.eventHandlers.onCommentDeleted(oldComment.id, oldComment.post_id);
          }
        }
      )
      .subscribe();

    this.channels.set('comments_changes', channel);
  }

  // Subscribe to messages for specific user
  private async subscribeToMessages(userId: string): Promise<void> {
    const channel = supabase
      .channel(`messages_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 RealtimeService: New message received', payload.new);
          
          const message = payload.new as Message;
          
          // Call handler if available
          if (this.eventHandlers.onMessageReceived) {
            this.eventHandlers.onMessageReceived(message);
          }
        }
      )
      .subscribe();

    this.channels.set(`messages_${userId}`, channel);
  }

  // Subscribe to user presence
  private async subscribeToUserPresence(userId: string): Promise<void> {
    const channel = supabase
      .channel(`presence_${userId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('🔄 RealtimeService: Presence sync', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('🔄 RealtimeService: User joined', key, newPresences);
        
        if (this.eventHandlers.onUserOnline) {
          this.eventHandlers.onUserOnline(key);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🔄 RealtimeService: User left', key, leftPresences);
        
        if (this.eventHandlers.onUserOffline) {
          this.eventHandlers.onUserOffline(key);
        }
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        // Track user presence
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      });

    this.channels.set(`presence_${userId}`, channel);
  }

  // Subscribe to specific post comments (for comment modal)
  async subscribeToPostComments(postId: string): Promise<void> {
    const channelName = `post_comments_${postId}`;
    
    // Don't subscribe if already subscribed
    if (this.channels.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('🔄 RealtimeService: Post comment change', payload);
          
          // Invalidate comments cache for this specific post
          CacheService.invalidateCommentsCache(postId);
          
          // Handle different events
          if (payload.eventType === 'INSERT' && this.eventHandlers.onCommentCreated) {
            this.eventHandlers.onCommentCreated(payload.new as Comment, postId);
          } else if (payload.eventType === 'UPDATE' && this.eventHandlers.onCommentUpdated) {
            this.eventHandlers.onCommentUpdated(payload.new as Comment);
          } else if (payload.eventType === 'DELETE' && this.eventHandlers.onCommentDeleted && payload.old?.id) {
            this.eventHandlers.onCommentDeleted(payload.old.id, postId);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
  }

  // Unsubscribe from specific post comments
  async unsubscribeFromPostComments(postId: string): Promise<void> {
    const channelName = `post_comments_${postId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log('🔄 RealtimeService: Unsubscribed from post comments', postId);
    }
  }

  // Broadcast typing indicator
  async broadcastTyping(postId: string, userId: string, isTyping: boolean): Promise<void> {
    const channel = this.channels.get(`post_comments_${postId}`);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          is_typing: isTyping,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // Get connection status
  isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  // Get active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // Cleanup all connections
  async cleanup(): Promise<void> {
    console.log('🔄 RealtimeService: Cleaning up realtime connections');
    
    for (const [name, channel] of this.channels) {
      await supabase.removeChannel(channel);
      console.log(`🔄 RealtimeService: Removed channel ${name}`);
    }
    
    this.channels.clear();
    this.eventHandlers = {};
    this.isConnected = false;
    
    console.log('✅ RealtimeService: Cleanup completed');
  }

  // Reconnect all channels
  async reconnect(userId?: string): Promise<void> {
    console.log('🔄 RealtimeService: Reconnecting...');
    await this.cleanup();
    await this.initialize(userId);
  }
}

export default RealtimeService.getInstance();
