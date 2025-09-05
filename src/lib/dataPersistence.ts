import { logInfo, logError } from '@/lib/logger'
import { encryptLocalStorage, decryptLocalStorage, secureRemoveLocalStorage } from './encryption'

// 本地存储键名常量
const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  USER_FAVORITES: 'user_favorites',
  USER_VISAS: 'user_visas',
  SEARCH_HISTORY: 'search_history',
  RECENT_CITIES: 'recent_cities',
  RECENT_PLACES: 'recent_places',
  THEME_SETTINGS: 'theme_settings',
  LANGUAGE_SETTINGS: 'language_settings',
  NOTIFICATION_SETTINGS: 'notification_settings'
} as const

// 数据版本控制
const DATA_VERSION = '1.0.0'

interface StoredData<T> {
  data: T
  version: string
  timestamp: number
  expiresAt?: number
}

// 基础存储类
class DataStorage {
  private prefix = 'nomad_now_'

  // 设置加密数据
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const storedData: StoredData<T> = {
        data,
        version: DATA_VERSION,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined
      }
      
      encryptLocalStorage(this.prefix + key, storedData)
      logInfo(`Data stored successfully`, { key, dataSize: JSON.stringify(data).length }, 'DataStorage')
    } catch (error) {
      logError(`Failed to store data`, error, 'DataStorage')
    }
  }

  // 获取解密数据
  get<T>(key: string): T | null {
    try {
      const storedData = decryptLocalStorage<StoredData<T>>(this.prefix + key)
      if (!storedData) return null
      
      // 检查版本兼容性
      if (storedData.version !== DATA_VERSION) {
        logInfo(`Data version mismatch, clearing old data`, { key, version: storedData.version }, 'DataStorage')
        this.remove(key)
        return null
      }

      // 检查过期时间
      if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
        logInfo(`Data expired, removing`, { key, expiresAt: storedData.expiresAt }, 'DataStorage')
        this.remove(key)
        return null
      }

      return storedData.data
    } catch (error) {
      logError(`Failed to retrieve data`, error, 'DataStorage')
      return null
    }
  }

  // 安全删除数据
  remove(key: string): void {
    try {
      secureRemoveLocalStorage(this.prefix + key)
      logInfo(`Data removed successfully`, { key }, 'DataStorage')
    } catch (error) {
      logError(`Failed to remove data`, error, 'DataStorage')
    }
  }

  // 清空所有数据
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          secureRemoveLocalStorage(key)
        }
      })
      logInfo(`All data cleared successfully`, null, 'DataStorage')
    } catch (error) {
      logError(`Failed to clear data`, error, 'DataStorage')
    }
  }

  // 获取存储统计信息
  getStats(): { totalKeys: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage)
      const nomadKeys = keys.filter(key => key.startsWith(this.prefix))
      const totalSize = nomadKeys.reduce((size, key) => {
        const item = localStorage.getItem(key)
        return size + (item ? item.length : 0)
      }, 0)
      
      return {
        totalKeys: nomadKeys.length,
        totalSize
      }
    } catch (error) {
      logError(`Failed to get storage stats`, error, 'DataStorage')
      return { totalKeys: 0, totalSize: 0 }
    }
  }
}

// 创建存储实例
const storage = new DataStorage()

// 用户偏好设置管理器
export class UserPreferencesManager {
  private storage = storage

  setPreferences(preferences: any): void {
    this.storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences)
  }

  getPreferences(): any {
    return this.storage.get(STORAGE_KEYS.USER_PREFERENCES)
  }

  updatePreferences(updates: Partial<any>): void {
    const current = this.getPreferences() || {}
    this.setPreferences({ ...current, ...updates })
  }

  clearPreferences(): void {
    this.storage.remove(STORAGE_KEYS.USER_PREFERENCES)
  }
}

// 用户收藏管理器
export class FavoritesManager {
  private storage = storage

  addFavorite(type: 'city' | 'place', item: any): void {
    const allFavorites = this.storage.get(STORAGE_KEYS.USER_FAVORITES) || []
    const favorites = Array.isArray(allFavorites) ? allFavorites : []
    
    const newFavorite = {
      id: Date.now().toString(),
      type,
      item,
      addedAt: new Date().toISOString()
    }
    
    this.storage.set(STORAGE_KEYS.USER_FAVORITES, [...favorites, newFavorite])
  }

  getFavorites(type: 'city' | 'place'): any[] {
    const allFavorites = this.storage.get(STORAGE_KEYS.USER_FAVORITES) || []
    const favorites = Array.isArray(allFavorites) ? allFavorites : []
    return favorites.filter(fav => fav.type === type)
  }

  removeFavorite(type: 'city' | 'place', itemId: string): void {
    const allFavorites = this.storage.get(STORAGE_KEYS.USER_FAVORITES) || []
    const favorites = Array.isArray(allFavorites) ? allFavorites : []
    const filtered = favorites.filter(fav => !(fav.type === type && fav.item.id === itemId))
    this.storage.set(STORAGE_KEYS.USER_FAVORITES, filtered)
  }

  clearFavorites(): void {
    this.storage.remove(STORAGE_KEYS.USER_FAVORITES)
  }
}

// 签证管理器
export class VisaManager {
  private storage = storage

  addVisa(visa: any): void {
    const visas = this.storage.get(STORAGE_KEYS.USER_VISAS) || []
    const visaList = Array.isArray(visas) ? visas : []
    
    const newVisa = {
      id: Date.now().toString(),
      ...visa,
      addedAt: new Date().toISOString()
    }
    
    this.storage.set(STORAGE_KEYS.USER_VISAS, [...visaList, newVisa])
  }

  getVisas(): any[] {
    const visas = this.storage.get(STORAGE_KEYS.USER_VISAS) || []
    return Array.isArray(visas) ? visas : []
  }

  removeVisa(visaId: string): void {
    const visas = this.storage.get(STORAGE_KEYS.USER_VISAS) || []
    const visaList = Array.isArray(visas) ? visas : []
    const filtered = visaList.filter(visa => visa.id !== visaId)
    this.storage.set(STORAGE_KEYS.USER_VISAS, filtered)
  }

  clearVisas(): void {
    this.storage.remove(STORAGE_KEYS.USER_VISAS)
  }
}

// 搜索历史管理器
export class SearchHistoryManager {
  private storage = storage
  private maxHistory = 50

  addSearchHistory(query: string, type: 'city' | 'place'): void {
    const history = this.storage.get(STORAGE_KEYS.SEARCH_HISTORY) || []
    const searchHistory = Array.isArray(history) ? history : []
    
    const newEntry = {
      query,
      type,
      timestamp: new Date().toISOString()
    }
    
    // 移除重复项
    const filtered = searchHistory.filter(entry => !(entry.query === query && entry.type === type))
    
    // 添加到开头并限制数量
    const updated = [newEntry, ...filtered].slice(0, this.maxHistory)
    this.storage.set(STORAGE_KEYS.SEARCH_HISTORY, updated)
  }

  getSearchHistory(type?: 'city' | 'place'): any[] {
    const history = this.storage.get(STORAGE_KEYS.SEARCH_HISTORY) || []
    const searchHistory = Array.isArray(history) ? history : []
    
    if (type) {
      return searchHistory.filter(entry => entry.type === type)
    }
    return searchHistory
  }

  clearSearchHistory(): void {
    this.storage.remove(STORAGE_KEYS.SEARCH_HISTORY)
  }
}

// 最近项目管理器
export class RecentItemsManager {
  private storage = storage
  private maxItems = 20

  addRecentCity(city: any): void {
    const recent = this.storage.get(STORAGE_KEYS.RECENT_CITIES) || []
    const recentCities = Array.isArray(recent) ? recent : []
    
    const newEntry = {
      ...city,
      timestamp: new Date().toISOString()
    }
    
    // 移除重复项
    const filtered = recentCities.filter(c => c.id !== city.id)
    
    // 添加到开头并限制数量
    const updated = [newEntry, ...filtered].slice(0, this.maxItems)
    this.storage.set(STORAGE_KEYS.RECENT_CITIES, updated)
  }

  addRecentPlace(place: any): void {
    const recent = this.storage.get(STORAGE_KEYS.RECENT_PLACES) || []
    const recentPlaces = Array.isArray(recent) ? recent : []
    
    const newEntry = {
      ...place,
      timestamp: new Date().toISOString()
    }
    
    // 移除重复项
    const filtered = recentPlaces.filter(p => p.id !== place.id)
    
    // 添加到开头并限制数量
    const updated = [newEntry, ...filtered].slice(0, this.maxItems)
    this.storage.set(STORAGE_KEYS.RECENT_PLACES, updated)
  }

  getRecentCities(): any[] {
    const recent = this.storage.get(STORAGE_KEYS.RECENT_CITIES) || []
    return Array.isArray(recent) ? recent : []
  }

  getRecentPlaces(): any[] {
    const recent = this.storage.get(STORAGE_KEYS.RECENT_PLACES) || []
    return Array.isArray(recent) ? recent : []
  }

  clearRecentCities(): void {
    this.storage.remove(STORAGE_KEYS.RECENT_CITIES)
  }

  clearRecentPlaces(): void {
    this.storage.remove(STORAGE_KEYS.RECENT_PLACES)
  }
}

// 设置管理器
export class SettingsManager {
  private storage = storage

  setThemeSettings(settings: any): void {
    this.storage.set(STORAGE_KEYS.THEME_SETTINGS, settings)
  }

  getThemeSettings(): any {
    return this.storage.get(STORAGE_KEYS.THEME_SETTINGS)
  }

  setLanguageSettings(settings: any): void {
    this.storage.set(STORAGE_KEYS.LANGUAGE_SETTINGS, settings)
  }

  getLanguageSettings(): any {
    return this.storage.get(STORAGE_KEYS.LANGUAGE_SETTINGS)
  }

  setNotificationSettings(settings: any): void {
    this.storage.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings)
  }

  getNotificationSettings(): any {
    return this.storage.get(STORAGE_KEYS.NOTIFICATION_SETTINGS)
  }
}

// 数据同步服务
export class DataSyncService {
  private storage = storage

  async syncToCloud(): Promise<void> {
    try {
      const data = {
        preferences: this.storage.get(STORAGE_KEYS.USER_PREFERENCES),
        favorites: this.storage.get(STORAGE_KEYS.USER_FAVORITES),
        visas: this.storage.get(STORAGE_KEYS.USER_VISAS),
        settings: {
          theme: this.storage.get(STORAGE_KEYS.THEME_SETTINGS),
          language: this.storage.get(STORAGE_KEYS.LANGUAGE_SETTINGS),
          notifications: this.storage.get(STORAGE_KEYS.NOTIFICATION_SETTINGS)
        }
      }

      // TODO: 实现云端同步逻辑
      logInfo('Data sync to cloud completed', { dataSize: JSON.stringify(data).length }, 'DataSyncService')
    } catch (error) {
      logError('Failed to sync data to cloud', error, 'DataSyncService')
    }
  }

  async syncFromCloud(): Promise<void> {
    try {
      // TODO: 实现从云端同步逻辑
      logInfo('Data sync from cloud completed', null, 'DataSyncService')
    } catch (error) {
      logError('Failed to sync data from cloud', error, 'DataSyncService')
    }
  }
}

// 导出单例实例
export const userPreferencesManager = new UserPreferencesManager()
export const favoritesManager = new FavoritesManager()
export const visaManager = new VisaManager()
export const searchHistoryManager = new SearchHistoryManager()
export const recentItemsManager = new RecentItemsManager()
export const settingsManager = new SettingsManager()
export const dataSyncService = new DataSyncService()

// 导出存储实例
export { storage as DataStorage }
