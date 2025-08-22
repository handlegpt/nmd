import { supabase } from '../lib/supabase';
import { CityService } from './cityService';
import { ActivityService } from './activityService';
import { PostService } from './postService';

export interface SearchResult {
  type: 'user' | 'post' | 'city' | 'meetup';
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
  score: number;
}

export interface SearchFilters {
  types?: ('user' | 'post' | 'city' | 'meetup')[];
  location?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class SearchService {
  // Cache for search results
  private static searchCache: Map<string, SearchResult[]> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Global search across all content types
  static async globalSearch(
    query: string, 
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    const cacheKey = `${query}-${JSON.stringify(filters)}-${limit}`;
    const cached = this.searchCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const results: SearchResult[] = [];
    const searchTypes = filters.types || ['user', 'post', 'city', 'meetup'];

    try {
      // Search users
      if (searchTypes.includes('user')) {
        const userResults = await this.searchUsers(query, filters);
        results.push(...userResults);
      }

      // Search posts
      if (searchTypes.includes('post')) {
        const postResults = await this.searchPosts(query, filters);
        results.push(...postResults);
      }

      // Search cities
      if (searchTypes.includes('city')) {
        const cityResults = await this.searchCities(query, filters);
        results.push(...cityResults);
      }

      // Search meetups
      if (searchTypes.includes('meetup')) {
        const meetupResults = await this.searchMeetups(query, filters);
        results.push(...meetupResults);
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);

      // Apply limit
      const limitedResults = results.slice(0, limit);

      // Cache results
      this.searchCache.set(cacheKey, limitedResults);
      setTimeout(() => this.searchCache.delete(cacheKey), this.CACHE_DURATION);

      return limitedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Search users
  private static async searchUsers(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, nickname, bio, current_city, avatar_url, skills, interests')
        .or(`nickname.ilike.%${query}%,bio.ilike.%${query}%,current_city.ilike.%${query}%,skills.cs.{${query}},interests.cs.{${query}}`)
        .limit(10);

      if (error) throw error;

      return users?.map(user => ({
        type: 'user' as const,
        id: user.id,
        title: user.nickname,
        subtitle: user.current_city || 'Location not set',
        description: user.bio,
        image: user.avatar_url,
        metadata: {
          skills: user.skills,
          interests: user.interests,
        },
        score: this.calculateUserScore(query, user),
      })) || [];
    } catch (error) {
      console.error('User search error:', error);
      return [];
    }
  }

  // Search posts
  private static async searchPosts(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id, content, location, created_at, tags, topic,
          user:users!user_id(id, nickname, avatar_url)
        `)
        .or(`content.ilike.%${query}%,location.ilike.%${query}%,tags.cs.{${query}},topic.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return posts?.map(post => ({
        type: 'post' as const,
        id: post.id,
        title: post.user?.nickname || 'Unknown User',
        subtitle: post.location || 'Unknown Location',
        description: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        image: post.user?.avatar_url,
        metadata: {
          tags: post.tags,
          topic: post.topic,
          createdAt: post.created_at,
        },
        score: this.calculatePostScore(query, post),
      })) || [];
    } catch (error) {
      console.error('Post search error:', error);
      return [];
    }
  }

  // Search cities
  private static async searchCities(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const cities = await CityService.searchCities(query);
      
      return cities.map(city => ({
        type: 'city' as const,
        id: city.id,
        title: city.name,
        subtitle: `${city.country}, ${city.continent}`,
        description: city.description,
        image: city.image,
        metadata: {
          nomadScore: city.nomadScore,
          costOfLiving: city.costOfLiving,
          weather: city.weather,
        },
        score: this.calculateCityScore(query, city),
      }));
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }

  // Search meetups
  private static async searchMeetups(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const meetups = await ActivityService.searchMeetups(query);
      
      return meetups.map(meetup => ({
        type: 'meetup' as const,
        id: meetup.id,
        title: meetup.title,
        subtitle: `${meetup.location} • ${meetup.date}`,
        description: meetup.description,
        metadata: {
          category: meetup.category,
          currentParticipants: meetup.currentParticipants,
          maxParticipants: meetup.maxParticipants,
          tags: meetup.tags,
        },
        score: this.calculateMeetupScore(query, meetup),
      }));
    } catch (error) {
      console.error('Meetup search error:', error);
      return [];
    }
  }

  // Calculate relevance scores
  private static calculateUserScore(query: string, user: any): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (user.nickname?.toLowerCase().includes(lowerQuery)) score += 10;
    if (user.bio?.toLowerCase().includes(lowerQuery)) score += 5;
    if (user.current_city?.toLowerCase().includes(lowerQuery)) score += 8;
    if (user.skills?.some((skill: string) => skill.toLowerCase().includes(lowerQuery))) score += 6;
    if (user.interests?.some((interest: string) => interest.toLowerCase().includes(lowerQuery))) score += 6;
    
    return score;
  }

  private static calculatePostScore(query: string, post: any): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (post.content?.toLowerCase().includes(lowerQuery)) score += 8;
    if (post.location?.toLowerCase().includes(lowerQuery)) score += 6;
    if (post.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) score += 5;
    if (post.topic?.toLowerCase().includes(lowerQuery)) score += 4;
    
    // Boost recent posts
    const daysAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 1) score += 3;
    else if (daysAgo < 7) score += 2;
    else if (daysAgo < 30) score += 1;
    
    return score;
  }

  private static calculateCityScore(query: string, city: any): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (city.name.toLowerCase().includes(lowerQuery)) score += 10;
    if (city.country.toLowerCase().includes(lowerQuery)) score += 8;
    if (city.description?.toLowerCase().includes(lowerQuery)) score += 5;
    if (city.highlights?.some((highlight: string) => highlight.toLowerCase().includes(lowerQuery))) score += 3;
    
    // Boost by nomad score
    score += city.nomadScore * 0.5;
    
    return score;
  }

  private static calculateMeetupScore(query: string, meetup: any): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (meetup.title.toLowerCase().includes(lowerQuery)) score += 10;
    if (meetup.description?.toLowerCase().includes(lowerQuery)) score += 6;
    if (meetup.location.toLowerCase().includes(lowerQuery)) score += 8;
    if (meetup.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) score += 5;
    if (meetup.category?.toLowerCase().includes(lowerQuery)) score += 4;
    
    // Boost upcoming meetups
    if (meetup.status === 'upcoming') score += 3;
    
    return score;
  }

  // Clear search cache
  static clearCache(): void {
    this.searchCache.clear();
  }

  // Get search suggestions
  static async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();
    
    try {
      // Get recent searches (if implemented)
      // Get popular tags
      // Get trending topics
      
      // For now, return basic suggestions
      const commonTerms = [
        'bali', 'chiang mai', 'porto', 'mexico city', 'cape town',
        'surfing', 'coworking', 'coffee', 'networking', 'travel',
        'digital nomad', 'remote work', 'meetup', 'cafe'
      ];

      commonTerms.forEach(term => {
        if (term.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(term);
        }
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Suggestion error:', error);
      return [];
    }
  }
}
