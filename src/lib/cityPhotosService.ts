import { supabase } from './supabase';

export interface CityPhoto {
  id: string;
  user_id: string;
  city_id: string;
  city_name: string;
  photo_url: string;
  photo_description?: string;
  file_size?: number;
  file_type?: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCityPhotoData {
  city_id: string;
  city_name: string;
  photo_url: string;
  photo_description?: string;
  file_size?: number;
  file_type?: string;
}

export interface UpdateCityPhotoData {
  photo_description?: string;
  photo_url?: string;
}

export interface CityPhotoStats {
  total_photos: number;
  total_size: number;
  photos_by_city: { [city: string]: number };
  photos_by_type: { [type: string]: number };
  recent_uploads: number;
}

class CityPhotosService {
  /**
   * 获取用户的所有城市照片
   */
  async getUserCityPhotos(userId: string): Promise<CityPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching user city photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserCityPhotos:', error);
      return [];
    }
  }

  /**
   * 获取指定城市的照片
   */
  async getCityPhotos(userId: string, cityId: string): Promise<CityPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .select('*')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching city photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCityPhotos:', error);
      return [];
    }
  }

  /**
   * 添加城市照片
   */
  async addCityPhoto(userId: string, photoData: CreateCityPhotoData): Promise<CityPhoto | null> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .insert({
          user_id: userId,
          ...photoData
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding city photo:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addCityPhoto:', error);
      return null;
    }
  }

  /**
   * 批量添加城市照片
   */
  async addCityPhotos(userId: string, photosData: CreateCityPhotoData[]): Promise<CityPhoto[]> {
    try {
      const photosWithUserId = photosData.map(photo => ({
        user_id: userId,
        ...photo
      }));

      const { data, error } = await supabase
        .from('user_city_photos')
        .insert(photosWithUserId)
        .select();

      if (error) {
        console.error('Error adding city photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in addCityPhotos:', error);
      return [];
    }
  }

  /**
   * 更新城市照片
   */
  async updateCityPhoto(userId: string, photoId: string, updateData: UpdateCityPhotoData): Promise<CityPhoto | null> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .update(updateData)
        .eq('id', photoId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating city photo:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCityPhoto:', error);
      return null;
    }
  }

  /**
   * 删除城市照片
   */
  async deleteCityPhoto(userId: string, photoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting city photo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCityPhoto:', error);
      return false;
    }
  }

  /**
   * 删除指定城市的所有照片
   */
  async deleteCityPhotos(userId: string, cityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_photos')
        .delete()
        .eq('user_id', userId)
        .eq('city_id', cityId);

      if (error) {
        console.error('Error deleting city photos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCityPhotos:', error);
      return false;
    }
  }

  /**
   * 获取用户照片统计信息
   */
  async getUserPhotoStats(userId: string): Promise<CityPhotoStats> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching photo stats:', error);
        return {
          total_photos: 0,
          total_size: 0,
          photos_by_city: {},
          photos_by_type: {},
          recent_uploads: 0
        };
      }

      const photos = data || [];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: CityPhotoStats = {
        total_photos: photos.length,
        total_size: photos.reduce((sum: number, photo: any) => sum + (photo.file_size || 0), 0),
        photos_by_city: {},
        photos_by_type: {},
        recent_uploads: photos.filter((photo: any) => new Date(photo.upload_date) > oneWeekAgo).length
      };

      // 按城市分组
      photos.forEach((photo: any) => {
        const city = photo.city_name;
        stats.photos_by_city[city] = (stats.photos_by_city[city] || 0) + 1;
      });

      // 按文件类型分组
      photos.forEach((photo: any) => {
        const type = photo.file_type || 'unknown';
        stats.photos_by_type[type] = (stats.photos_by_type[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getUserPhotoStats:', error);
      return {
        total_photos: 0,
        total_size: 0,
        photos_by_city: {},
        photos_by_type: {},
        recent_uploads: 0
      };
    }
  }

  /**
   * 搜索照片
   */
  async searchPhotos(userId: string, query: string): Promise<CityPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .select('*')
        .eq('user_id', userId)
        .or(`city_name.ilike.%${query}%,photo_description.ilike.%${query}%`)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error searching photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchPhotos:', error);
      return [];
    }
  }

  /**
   * 获取最近上传的照片
   */
  async getRecentPhotos(userId: string, limit: number = 10): Promise<CityPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_photos')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentPhotos:', error);
      return [];
    }
  }
}

export const cityPhotosService = new CityPhotosService();
