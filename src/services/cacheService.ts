import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, Comment, User, Message } from '../types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_CACHE_SIZE = 100;

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Memory cache operations
  setMemoryCache<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const expiresAt = Date.now() + ttl;
    
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    });

    // Cleanup if cache is too large
    if (this.memoryCache.size > (options.maxSize || this.MAX_MEMORY_CACHE_SIZE)) {
      this.cleanupMemoryCache();
    }
  }

  getMemoryCache<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Persistent cache operations
  async setPersistentCache<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.DEFAULT_TTL;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting persistent cache:', error);
    }
  }

  async getPersistentCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      if (Date.now() > cacheItem.expiresAt) {
        await this.removePersistentCache(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting persistent cache:', error);
      return null;
    }
  }

  async removePersistentCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing persistent cache:', error);
    }
  }

  // Specialized cache methods for different data types
  
  // Posts cache
  async cachePosts(posts: Post[], page: number = 0): Promise<void> {
    const key = `posts_page_${page}`;
    await this.setPersistentCache(key, posts, { ttl: 2 * 60 * 1000 }); // 2 minutes
    this.setMemoryCache(key, posts, { ttl: 30 * 1000 }); // 30 seconds in memory
  }

  async getCachedPosts(page: number = 0): Promise<Post[] | null> {
    const key = `posts_page_${page}`;
    
    // Try memory cache first
    const memoryData = this.getMemoryCache<Post[]>(key);
    if (memoryData) return memoryData;

    // Fallback to persistent cache
    return await this.getPersistentCache<Post[]>(key);
  }

  // Comments cache
  async cacheComments(postId: string, comments: Comment[]): Promise<void> {
    const key = `comments_${postId}`;
    await this.setPersistentCache(key, comments, { ttl: 60 * 1000 }); // 1 minute
    this.setMemoryCache(key, comments, { ttl: 30 * 1000 }); // 30 seconds
  }

  async getCachedComments(postId: string): Promise<Comment[] | null> {
    const key = `comments_${postId}`;
    
    const memoryData = this.getMemoryCache<Comment[]>(key);
    if (memoryData) return memoryData;

    return await this.getPersistentCache<Comment[]>(key);
  }

  // User profile cache
  async cacheUser(user: User): Promise<void> {
    const key = `user_${user.id}`;
    await this.setPersistentCache(key, user, { ttl: 10 * 60 * 1000 }); // 10 minutes
    this.setMemoryCache(key, user, { ttl: 5 * 60 * 1000 }); // 5 minutes
  }

  async getCachedUser(userId: string): Promise<User | null> {
    const key = `user_${userId}`;
    
    const memoryData = this.getMemoryCache<User>(key);
    if (memoryData) return memoryData;

    return await this.getPersistentCache<User>(key);
  }

  // Messages cache
  async cacheMessages(userId1: string, userId2: string, messages: Message[]): Promise<void> {
    const key = `messages_${[userId1, userId2].sort().join('_')}`;
    await this.setPersistentCache(key, messages, { ttl: 30 * 1000 }); // 30 seconds
    this.setMemoryCache(key, messages, { ttl: 10 * 1000 }); // 10 seconds
  }

  async getCachedMessages(userId1: string, userId2: string): Promise<Message[] | null> {
    const key = `messages_${[userId1, userId2].sort().join('_')}`;
    
    const memoryData = this.getMemoryCache<Message[]>(key);
    if (memoryData) return memoryData;

    return await this.getPersistentCache<Message[]>(key);
  }

  // Cache invalidation methods
  invalidatePostsCache(): void {
    // Clear memory cache for posts
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith('posts_page_')) {
        this.memoryCache.delete(key);
      }
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = `user_${userId}`;
    this.memoryCache.delete(key);
    await this.removePersistentCache(key);
  }

  async invalidateCommentsCache(postId: string): Promise<void> {
    const key = `comments_${postId}`;
    this.memoryCache.delete(key);
    await this.removePersistentCache(key);
  }

  // Cleanup methods
  private cleanupMemoryCache(): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    
    // Remove expired items
    entries.forEach(([key, item]) => {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    });

    // If still too large, remove oldest items
    if (this.memoryCache.size > this.MAX_MEMORY_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([key]) => this.memoryCache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const itemsToRemove = this.memoryCache.size - this.MAX_MEMORY_CACHE_SIZE;
      for (let i = 0; i < itemsToRemove; i++) {
        this.memoryCache.delete(sortedEntries[i][0]);
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60 * 1000); // Cleanup every minute
  }

  async clearAllCache(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Cache statistics
  getCacheStats(): { memorySize: number; memoryKeys: string[] } {
    return {
      memorySize: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys())
    };
  }
}

export default CacheService.getInstance();
