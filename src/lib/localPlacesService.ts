import { supabase } from './supabase';

export interface LocalPlace {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  city: string;
  country?: string;
  place_type?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocalPlaceData {
  place_id: string;
  place_name: string;
  city: string;
  country?: string;
  place_type?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateLocalPlaceData {
  place_name?: string;
  place_type?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  notes?: string;
}

export interface LocalPlaceStats {
  total_places: number;
  places_by_city: { [city: string]: number };
  places_by_type: { [type: string]: number };
  average_rating: number;
  recent_additions: number;
}

export interface PlaceSearchFilters {
  city?: string;
  place_type?: string;
  min_rating?: number;
  has_coordinates?: boolean;
}

class LocalPlacesService {
  /**
   * 获取用户的所有本地地点
   */
  async getUserLocalPlaces(userId: string): Promise<LocalPlace[]> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user local places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserLocalPlaces:', error);
      return [];
    }
  }

  /**
   * 获取指定城市的地点
   */
  async getCityPlaces(userId: string, city: string): Promise<LocalPlace[]> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .eq('city', city)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching city places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCityPlaces:', error);
      return [];
    }
  }

  /**
   * 添加本地地点
   */
  async addLocalPlace(userId: string, placeData: CreateLocalPlaceData): Promise<LocalPlace | null> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .insert({
          user_id: userId,
          ...placeData
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding local place:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addLocalPlace:', error);
      return null;
    }
  }

  /**
   * 批量添加本地地点
   */
  async addLocalPlaces(userId: string, placesData: CreateLocalPlaceData[]): Promise<LocalPlace[]> {
    try {
      const placesWithUserId = placesData.map(place => ({
        user_id: userId,
        ...place
      }));

      const { data, error } = await supabase
        .from('user_local_places')
        .insert(placesWithUserId)
        .select();

      if (error) {
        console.error('Error adding local places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in addLocalPlaces:', error);
      return [];
    }
  }

  /**
   * 更新本地地点
   */
  async updateLocalPlace(userId: string, placeId: string, updateData: UpdateLocalPlaceData): Promise<LocalPlace | null> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .update(updateData)
        .eq('id', placeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating local place:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateLocalPlace:', error);
      return null;
    }
  }

  /**
   * 删除本地地点
   */
  async deleteLocalPlace(userId: string, placeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_local_places')
        .delete()
        .eq('id', placeId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting local place:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteLocalPlace:', error);
      return false;
    }
  }

  /**
   * 删除指定城市的所有地点
   */
  async deleteCityPlaces(userId: string, city: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_local_places')
        .delete()
        .eq('user_id', userId)
        .eq('city', city);

      if (error) {
        console.error('Error deleting city places:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCityPlaces:', error);
      return false;
    }
  }

  /**
   * 获取用户地点统计信息
   */
  async getUserPlaceStats(userId: string): Promise<LocalPlaceStats> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching place stats:', error);
        return {
          total_places: 0,
          places_by_city: {},
          places_by_type: {},
          average_rating: 0,
          recent_additions: 0
        };
      }

      const places = data || [];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: LocalPlaceStats = {
        total_places: places.length,
        places_by_city: {},
        places_by_type: {},
        average_rating: 0,
        recent_additions: places.filter((place: any) => new Date(place.created_at) > oneWeekAgo).length
      };

      // 按城市分组
      places.forEach((place: any) => {
        const city = place.city;
        stats.places_by_city[city] = (stats.places_by_city[city] || 0) + 1;
      });

      // 按类型分组
      places.forEach((place: any) => {
        const type = place.place_type || 'unknown';
        stats.places_by_type[type] = (stats.places_by_type[type] || 0) + 1;
      });

      // 计算平均评分
      const ratedPlaces = places.filter((place: any) => place.rating && place.rating > 0);
      if (ratedPlaces.length > 0) {
        const totalRating = ratedPlaces.reduce((sum: number, place: any) => sum + place.rating, 0);
        stats.average_rating = Math.round((totalRating / ratedPlaces.length) * 100) / 100;
      }

      return stats;
    } catch (error) {
      console.error('Error in getUserPlaceStats:', error);
      return {
        total_places: 0,
        places_by_city: {},
        places_by_type: {},
        average_rating: 0,
        recent_additions: 0
      };
    }
  }

  /**
   * 搜索地点
   */
  async searchPlaces(userId: string, query: string, filters?: PlaceSearchFilters): Promise<LocalPlace[]> {
    try {
      let queryBuilder = supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .or(`place_name.ilike.%${query}%,address.ilike.%${query}%,notes.ilike.%${query}%`);

      // 应用过滤器
      if (filters?.city) {
        queryBuilder = queryBuilder.eq('city', filters.city);
      }
      if (filters?.place_type) {
        queryBuilder = queryBuilder.eq('place_type', filters.place_type);
      }
      if (filters?.min_rating) {
        queryBuilder = queryBuilder.gte('rating', filters.min_rating);
      }
      if (filters?.has_coordinates) {
        queryBuilder = queryBuilder.not('coordinates', 'is', null);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchPlaces:', error);
      return [];
    }
  }

  /**
   * 获取最近添加的地点
   */
  async getRecentPlaces(userId: string, limit: number = 10): Promise<LocalPlace[]> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentPlaces:', error);
      return [];
    }
  }

  /**
   * 获取高评分地点
   */
  async getTopRatedPlaces(userId: string, minRating: number = 4.0, limit: number = 10): Promise<LocalPlace[]> {
    try {
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .gte('rating', minRating)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top rated places:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTopRatedPlaces:', error);
      return [];
    }
  }

  /**
   * 获取附近地点（基于坐标）
   */
  async getNearbyPlaces(userId: string, lat: number, lng: number, radiusKm: number = 5): Promise<LocalPlace[]> {
    try {
      // 获取所有有坐标的地点
      const { data, error } = await supabase
        .from('user_local_places')
        .select('*')
        .eq('user_id', userId)
        .not('coordinates', 'is', null);

      if (error) {
        console.error('Error fetching nearby places:', error);
        return [];
      }

      const places = data || [];
      
      // 计算距离并过滤
      const nearbyPlaces = places.filter((place: any) => {
        if (!place.coordinates) return false;
        
        const placeLat = place.coordinates.lat;
        const placeLng = place.coordinates.lng;
        
        const distance = this.calculateDistance(lat, lng, placeLat, placeLng);
        return distance <= radiusKm;
      });

      // 按距离排序
      nearbyPlaces.sort((a: any, b: any) => {
        const distanceA = this.calculateDistance(lat, lng, a.coordinates.lat, a.coordinates.lng);
        const distanceB = this.calculateDistance(lat, lng, b.coordinates.lat, b.coordinates.lng);
        return distanceA - distanceB;
      });

      return nearbyPlaces;
    } catch (error) {
      console.error('Error in getNearbyPlaces:', error);
      return [];
    }
  }

  /**
   * 计算两点间距离（公里）
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  /**
   * 角度转弧度
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const localPlacesService = new LocalPlacesService();
