import { supabase } from '../lib/supabase';

export interface CityRating {
  id: string;
  city_id: string;
  user_id: string;
  overall_rating: number;
  cost_rating: number;
  internet_rating: number;
  safety_rating: number;
  community_rating: number;
  weather_rating: number;
  food_rating: number;
  transport_rating: number;
  created_at: string;
  updated_at: string;
}

export interface CityReview {
  id: string;
  city_id: string;
  user_id: string;
  title?: string;
  content: string;
  pros: string[];
  cons: string[];
  visit_duration?: string;
  visit_date?: string;
  is_verified_visit: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  user?: {
    nickname: string;
    avatar_url?: string;
  };
}

export interface CityStatistics {
  id: string;
  city_id: string;
  total_ratings: number;
  total_reviews: number;
  average_overall_rating: number;
  average_cost_rating: number;
  average_internet_rating: number;
  average_safety_rating: number;
  average_community_rating: number;
  average_weather_rating: number;
  average_food_rating: number;
  average_transport_rating: number;
  dynamic_nomad_score: number;
  last_calculated: string;
}

export interface RatingCriteria {
  overall: number;
  cost: number;
  internet: number;
  safety: number;
  community: number;
  weather: number;
  food: number;
  transport: number;
}

export class CityRatingService {
  // Cache for city statistics
  private static statisticsCache: Map<string, CityStatistics> = new Map();
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Get city statistics
  static async getCityStatistics(cityId: string): Promise<CityStatistics | null> {
    // Check cache first
    if (this.statisticsCache.has(cityId) && Date.now() < this.cacheExpiry) {
      return this.statisticsCache.get(cityId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('city_statistics')
        .select('*')
        .eq('city_id', cityId)
        .single();

      if (error) {
        console.error('Error fetching city statistics:', error);
        return null;
      }

      // Cache the result
      if (data) {
        this.statisticsCache.set(cityId, data);
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return data;
    } catch (error) {
      console.error('Error in getCityStatistics:', error);
      return null;
    }
  }

  // Get user's rating for a city
  static async getUserRating(cityId: string, userId: string): Promise<CityRating | null> {
    try {
      const { data, error } = await supabase
        .from('city_ratings')
        .select('*')
        .eq('city_id', cityId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user rating:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserRating:', error);
      return null;
    }
  }

  // Submit or update user rating
  static async submitRating(cityId: string, userId: string, ratings: RatingCriteria): Promise<CityRating | null> {
    try {
      const ratingData = {
        city_id: cityId,
        user_id: userId,
        overall_rating: ratings.overall,
        cost_rating: ratings.cost,
        internet_rating: ratings.internet,
        safety_rating: ratings.safety,
        community_rating: ratings.community,
        weather_rating: ratings.weather,
        food_rating: ratings.food,
        transport_rating: ratings.transport,
      };

      const { data, error } = await supabase
        .from('city_ratings')
        .upsert(ratingData, { onConflict: 'city_id,user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error submitting rating:', error);
        return null;
      }

      // Clear cache for this city
      this.statisticsCache.delete(cityId);

      return data;
    } catch (error) {
      console.error('Error in submitRating:', error);
      return null;
    }
  }

  // Get city reviews
  static async getCityReviews(cityId: string, limit: number = 10, offset: number = 0): Promise<CityReview[]> {
    try {
      const { data, error } = await supabase
        .from('city_reviews')
        .select(`
          *,
          user:users(nickname, avatar_url)
        `)
        .eq('city_id', cityId)
        .order('helpful_votes', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching city reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCityReviews:', error);
      return [];
    }
  }

  // Submit city review
  static async submitReview(
    cityId: string,
    userId: string,
    review: {
      title?: string;
      content: string;
      pros: string[];
      cons: string[];
      visit_duration?: string;
      visit_date?: string;
    }
  ): Promise<CityReview | null> {
    try {
      const reviewData = {
        city_id: cityId,
        user_id: userId,
        ...review,
      };

      const { data, error } = await supabase
        .from('city_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting review:', error);
        return null;
      }

      // Clear cache for this city
      this.statisticsCache.delete(cityId);

      return data;
    } catch (error) {
      console.error('Error in submitReview:', error);
      return null;
    }
  }

  // Vote on review helpfulness
  static async voteReview(reviewId: string, userId: string, isHelpful: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('city_review_votes')
        .upsert({
          review_id: reviewId,
          user_id: userId,
          is_helpful: isHelpful,
        }, { onConflict: 'review_id,user_id' });

      if (error) {
        console.error('Error voting on review:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in voteReview:', error);
      return false;
    }
  }

  // Get top rated cities
  static async getTopRatedCities(limit: number = 10): Promise<CityStatistics[]> {
    try {
      const { data, error } = await supabase
        .from('city_statistics')
        .select('*')
        .gte('total_ratings', 3) // Only cities with at least 3 ratings
        .order('dynamic_nomad_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top rated cities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTopRatedCities:', error);
      return [];
    }
  }

  // Get recent reviews
  static async getRecentReviews(limit: number = 10): Promise<CityReview[]> {
    try {
      const { data, error } = await supabase
        .from('city_reviews')
        .select(`
          *,
          user:users(nickname, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentReviews:', error);
      return [];
    }
  }

  // Clear cache
  static clearCache(): void {
    this.statisticsCache.clear();
    this.cacheExpiry = 0;
  }
}

export default CityRatingService;
