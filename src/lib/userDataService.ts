import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface UserPreferences {
  wifi: number
  cost: number
  climate: number
  social: number
  visa: number
}

export interface UserFavorite {
  id: string
  name: string
  country: string
  countryCode: string
  addedDate: string
}

export interface UserVisa {
  id: string
  country: string
  type: string
  expiryDate: string
  daysLeft: number
  status: 'active' | 'expired' | 'expiring'
}

class UserDataService {
  // 本地存储键名
  private static readonly STORAGE_KEYS = {
    PREFERENCES: 'user_preferences',
    FAVORITES: 'user_favorites',
    VISAS: 'user_visas',
    LAST_SYNC: 'user_data_last_sync'
  }

  // 获取用户偏好设置
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      // 首先尝试从本地存储获取
      const localData = this.getFromLocalStorage<UserPreferences>(UserDataService.STORAGE_KEYS.PREFERENCES)
      if (localData) {
        return localData
      }

      // 如果本地没有，尝试从云端获取
      const user = await getCurrentUser()
      if (!user) {
        return null
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        return null
      }

      const preferences: UserPreferences = {
        wifi: data.wifi_quality || 20,
        cost: data.cost_of_living || 25,
        climate: data.climate_comfort || 20,
        social: data.social_atmosphere || 15,
        visa: data.visa_convenience || 20
      }

      // 保存到本地存储
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.PREFERENCES, preferences)
      return preferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  // 保存用户偏好设置
  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      // 保存到本地存储
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.PREFERENCES, preferences)

      // 尝试同步到云端
      const user = await getCurrentUser()
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            wifi_quality: preferences.wifi,
            cost_of_living: preferences.cost,
            climate_comfort: preferences.climate,
            social_atmosphere: preferences.social,
            visa_convenience: preferences.visa,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error syncing preferences to cloud:', error)
          // 即使云端同步失败，本地数据仍然有效
        }
      }

      return true
    } catch (error) {
      console.error('Error saving user preferences:', error)
      return false
    }
  }

  // 获取用户收藏
  async getUserFavorites(): Promise<UserFavorite[]> {
    try {
      // 首先尝试从本地存储获取
      const localData = this.getFromLocalStorage<UserFavorite[]>(UserDataService.STORAGE_KEYS.FAVORITES)
      if (localData) {
        return localData
      }

      // 如果本地没有，尝试从云端获取
      const user = await getCurrentUser()
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          cities (
            id,
            name,
            country,
            country_code
          )
        `)
        .eq('user_id', user.id)

      if (error || !data) {
        return []
      }

      const favorites: UserFavorite[] = data.map((item: any) => ({
        id: item.cities.id,
        name: item.cities.name,
        country: item.cities.country,
        countryCode: item.cities.country_code,
        addedDate: new Date(item.created_at).toLocaleDateString()
      }))

      // 保存到本地存储
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.FAVORITES, favorites)
      return favorites
    } catch (error) {
      console.error('Error getting user favorites:', error)
      return []
    }
  }

  // 添加收藏
  async addFavorite(cityId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return false
      }

      // 添加到云端
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          city_id: cityId
        })

      if (error) {
        console.error('Error adding favorite to cloud:', error)
        return false
      }

      // 更新本地存储
      const currentFavorites = await this.getUserFavorites()
      // 这里需要获取城市信息，暂时简化处理
      // 在实际应用中，应该从城市数据中获取详细信息
      
      return true
    } catch (error) {
      console.error('Error adding favorite:', error)
      return false
    }
  }

  // 移除收藏
  async removeFavorite(cityId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return false
      }

      // 从云端移除
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('city_id', cityId)

      if (error) {
        console.error('Error removing favorite from cloud:', error)
        return false
      }

      // 更新本地存储
      const currentFavorites = await this.getUserFavorites()
      const updatedFavorites = currentFavorites.filter(fav => fav.id !== cityId)
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.FAVORITES, updatedFavorites)

      return true
    } catch (error) {
      console.error('Error removing favorite:', error)
      return false
    }
  }

  // 获取用户签证信息
  async getUserVisas(): Promise<UserVisa[]> {
    try {
      // 首先尝试从本地存储获取
      const localData = this.getFromLocalStorage<UserVisa[]>(UserDataService.STORAGE_KEYS.VISAS)
      if (localData) {
        return localData
      }

      // 如果本地没有，尝试从云端获取
      const user = await getCurrentUser()
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('user_visas')
        .select('*')
        .eq('user_id', user.id)

      if (error || !data) {
        return []
      }

      const visas: UserVisa[] = data.map((item: any) => ({
        id: item.id,
        country: item.country,
        type: item.visa_type,
        expiryDate: item.expiry_date,
        daysLeft: Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        status: item.status
      }))

      // 保存到本地存储
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.VISAS, visas)
      return visas
    } catch (error) {
      console.error('Error getting user visas:', error)
      return []
    }
  }

  // 添加签证信息
  async addVisa(visaData: Omit<UserVisa, 'id' | 'daysLeft'>): Promise<boolean> {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return false
      }

      // 添加到云端
      const { error } = await supabase
        .from('user_visas')
        .insert({
          user_id: user.id,
          country: visaData.country,
          visa_type: visaData.type,
          expiry_date: visaData.expiryDate,
          status: visaData.status
        })

      if (error) {
        console.error('Error adding visa to cloud:', error)
        return false
      }

      // 更新本地存储
      const currentVisas = await this.getUserVisas()
      const newVisa: UserVisa = {
        id: Date.now().toString(), // 临时ID
        ...visaData,
        daysLeft: Math.ceil((new Date(visaData.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.VISAS, [...currentVisas, newVisa])

      return true
    } catch (error) {
      console.error('Error adding visa:', error)
      return false
    }
  }

  // 同步所有用户数据
  async syncUserData(): Promise<boolean> {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return false
      }

      // 同步偏好设置
      const preferences = await this.getUserPreferences()
      if (preferences) {
        await this.saveUserPreferences(preferences)
      }

      // 同步收藏
      await this.getUserFavorites()

      // 同步签证信息
      await this.getUserVisas()

      // 记录同步时间
      this.saveToLocalStorage(UserDataService.STORAGE_KEYS.LAST_SYNC, new Date().toISOString())

      return true
    } catch (error) {
      console.error('Error syncing user data:', error)
      return false
    }
  }

  // 清除所有用户数据
  clearUserData(): void {
    Object.values(UserDataService.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // 私有方法：从本地存储获取数据
  private getFromLocalStorage<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }
      
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error getting data from localStorage (${key}):`, error)
      return null
    }
  }

  // 私有方法：保存数据到本地存储
  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      if (typeof window === 'undefined') {
        return
      }
      
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error)
    }
  }
}

// 导出单例实例
export const userDataService = new UserDataService()
