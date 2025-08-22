import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  location: string;
  locationDetails?: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  isMeetupRequest: boolean;
  meetupDetails?: {
    title: string;
    date: string;
    location: string;
    maxPeople: number;
    currentPeople: number;
  };
  likes: number;
  comments: Array<{
    id: string;
    userId: string;
    userNickname: string;
    userAvatar: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  tags: string[];
  emotion?: string;
  topic?: string;
}

export class PostService {
  // Cache for posts data
  private static postsCache: Post[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  // Get all posts with caching
  static async getPosts(): Promise<Post[]> {
    // Check cache first
    if (this.postsCache && Date.now() < this.cacheExpiry) {
      return this.postsCache;
    }

    try {
      // Try to get from database first
      const { data: dbPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(id, nickname, avatar_url),
          comments:comments(
            id,
            content,
            created_at,
            user:users!user_id(id, nickname, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts from database:', error);
        // Fallback to static data
        return this.getStaticPosts();
      }

      if (dbPosts && dbPosts.length > 0) {
        // Transform database data to match our interface
        const transformedPosts = dbPosts.map(post => ({
          id: post.id,
          userId: post.user_id,
          userNickname: post.user?.nickname || 'Unknown User',
          userAvatar: post.user?.avatar_url || '',
          content: post.content,
          location: post.location || '',
          locationDetails: post.location_details,
          media: post.media || [],
          isMeetupRequest: post.is_meetup_request || false,
          meetupDetails: post.meetup_details,
          likes: post.likes_count || 0,
          comments: post.comments?.map((comment: any) => ({
            id: comment.id,
            userId: comment.user?.id || 'unknown',
            userNickname: comment.user?.nickname || 'Unknown User',
            userAvatar: comment.user?.avatar_url || '',
            content: comment.content,
            createdAt: comment.created_at,
          })) || [],
          createdAt: post.created_at,
          tags: post.tags || [],
          emotion: post.emotion,
          topic: post.topic,
        }));

        // Cache the data
        this.postsCache = transformedPosts;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        return transformedPosts;
      }

      // If no database data, use static data
      return this.getStaticPosts();
    } catch (error) {
      console.error('Error in getPosts:', error);
      return this.getStaticPosts();
    }
  }

  // Get static posts data (fallback)
  private static getStaticPosts(): Post[] {
    return [
      {
        id: '1',
        userId: '1',
        userNickname: 'Sarah',
        userAvatar: '',
        content: 'Just arrived in Bali! The weather is perfect for some beach time. Anyone up for a sunset surf session? 🏄‍♀️',
        location: 'Bali, Indonesia',
        locationDetails: {
          name: 'Canggu Beach',
          address: 'Canggu, Bali, Indonesia',
          coordinates: { latitude: -8.6500, longitude: 115.1333 },
        },
        media: [],
        isMeetupRequest: true,
        meetupDetails: {
          title: 'Sunset Surf Session',
          date: 'Today at 5 PM',
          location: 'Canggu Beach, Bali',
          maxPeople: 6,
          currentPeople: 2,
        },
        likes: 12,
        comments: [
          {
            id: '1',
            userId: '2',
            userNickname: 'Mike',
            userAvatar: '',
            content: 'I\'m in! What time should we meet?',
            createdAt: '1 hour ago',
          },
          {
            id: '2',
            userId: '3',
            userNickname: 'Emma',
            userAvatar: '',
            content: 'Sounds amazing! What time should we meet?',
            createdAt: '30 minutes ago',
          },
        ],
        createdAt: '2 hours ago',
        tags: ['bali', 'surfing', 'beach'],
        emotion: 'excited',
        topic: 'Travel',
      },
      {
        id: '2',
        userId: '2',
        userNickname: 'Mike',
        userAvatar: '',
        content: 'Working from a cozy cafe in Chiang Mai. The coffee here is amazing and the wifi is super fast! ☕️',
        location: 'Chiang Mai, Thailand',
        locationDetails: {
          name: 'Cafe Corner',
          address: 'Nimman Road, Chiang Mai, Thailand',
          coordinates: { latitude: 18.7883, longitude: 98.9853 },
        },
        media: [],
        isMeetupRequest: true,
        meetupDetails: {
          title: 'Digital Nomad Meetup',
          date: 'Tomorrow at 6 PM',
          location: 'Cafe Corner, Nimman Road',
          maxPeople: 8,
          currentPeople: 3,
        },
        likes: 8,
        comments: [
          {
            id: '3',
            userId: '3',
            userNickname: 'Emma',
            userAvatar: '',
            content: 'I\'ll be there! Looking forward to meeting everyone ☕️',
            createdAt: '2 hours ago',
          },
        ],
        createdAt: '4 hours ago',
        tags: ['chiangmai', 'cafe', 'work'],
        emotion: 'productive',
        topic: 'Work',
      },
    ];
  }

  // Create a new post
  static async createPost(postData: Partial<Post>): Promise<Post | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: postData.userId,
          content: postData.content,
          location: postData.location,
          location_details: postData.locationDetails,
          media: postData.media,
          is_meetup_request: postData.isMeetupRequest,
          meetup_details: postData.meetupDetails,
          tags: postData.tags,
          emotion: postData.emotion,
          topic: postData.topic,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache to refresh data
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  // Like a post
  static async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Add like to post_likes table
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (error) throw error;

      // Update likes count
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          likes_count: supabase.rpc('increment', { row_id: postId, column_name: 'likes_count' })
        })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Clear cache to refresh data
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  // Unlike a post
  static async unlikePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Remove like from post_likes table
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update likes count
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          likes_count: supabase.rpc('decrement', { row_id: postId, column_name: 'likes_count' })
        })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Clear cache to refresh data
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  }

  // Add comment to post
  static async addComment(postId: string, commentData: {
    userId: string;
    content: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: commentData.userId,
          content: commentData.content,
        });

      if (error) throw error;

      // Clear cache to refresh data
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }

  // Get posts by user
  static async getPostsByUser(userId: string): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(post => post.userId === userId);
  }

  // Get posts by location
  static async getPostsByLocation(location: string): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(post => 
      post.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Search posts
  static async searchPosts(query: string): Promise<Post[]> {
    const posts = await this.getPosts();
    const lowerQuery = query.toLowerCase();
    
    return posts.filter(post => 
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      post.topic?.toLowerCase().includes(lowerQuery)
    );
  }

  // Clear cache
  static clearCache(): void {
    this.postsCache = null;
    this.cacheExpiry = 0;
  }
}
