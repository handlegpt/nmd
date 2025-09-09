/**
 * 统一用户数据同步服务
 * 处理用户资料、工具数据等的跨浏览器同步
 */

import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface UserProfileData {
  id: string
  name: string
  email: string
  avatar_url: string
  bio: string
  current_city: string
  profession: string
  company: string
  skills: string[]
  interests: string[]
  social_links: {
    website?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    github?: string
  }
  contact: {
    phone?: string
    whatsapp?: string
  }
  travel_preferences: {
    budget_range: 'budget' | 'moderate' | 'luxury'
    preferred_climate: 'tropical' | 'temperate' | 'cold'
    travel_style: 'backpacker' | 'digital_nomad' | 'luxury_traveler'
    accommodation_type: 'hostel' | 'hotel' | 'apartment' | 'any'
  }
  created_at: string
  updated_at: string
}

export interface ToolData {
  tool_name: string
  user_id: string
  data: any
  version: number
  last_synced: string
}

class UserDataSyncService {
  private static instance: UserDataSyncService
  private syncInProgress = new Set<string>()

  static getInstance(): UserDataSyncService {
    if (!UserDataSyncService.instance) {
      UserDataSyncService.instance = new UserDataSyncService()
    }
    return UserDataSyncService.instance
  }

  /**
   * 保存用户资料到服务器和本地
   */
  async saveUserProfile(userId: string, profileData: UserProfileData): Promise<boolean> {
    try {
      logInfo('Saving user profile to server', { userId }, 'UserDataSync')

      // 1. 保存到服务器
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          profile_data: profileData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Failed to save user profile to server', error, 'UserDataSync')
        return false
      }

      // 2. 保存到本地作为缓存
      localStorage.setItem('user_profile_details', JSON.stringify(profileData))
      
      logInfo('User profile saved successfully', { userId }, 'UserDataSync')
      return true
    } catch (error) {
      logError('Error saving user profile', error, 'UserDataSync')
      return false
    }
  }

  /**
   * 从服务器加载用户资料
   */
  async loadUserProfile(userId: string): Promise<UserProfileData | null> {
    try {
      logInfo('Loading user profile from server', { userId }, 'UserDataSync')

      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 用户资料不存在，返回null
          logInfo('User profile not found on server', { userId }, 'UserDataSync')
          return null
        }
        logError('Failed to load user profile from server', error, 'UserDataSync')
        return null
      }

      // 同时更新本地缓存
      localStorage.setItem('user_profile_details', JSON.stringify(data.profile_data))
      
      logInfo('User profile loaded successfully', { userId }, 'UserDataSync')
      return data.profile_data
    } catch (error) {
      logError('Error loading user profile', error, 'UserDataSync')
      return null
    }
  }

  /**
   * 保存工具数据到服务器和本地
   */
  async saveToolData(toolName: string, userId: string, data: any): Promise<boolean> {
    const syncKey = `${toolName}_${userId}`
    
    // 防止重复同步
    if (this.syncInProgress.has(syncKey)) {
      logInfo('Sync already in progress, skipping', { toolName, userId }, 'UserDataSync')
      return false
    }

    this.syncInProgress.add(syncKey)

    try {
      logInfo('Saving tool data to server', { toolName, userId }, 'UserDataSync')

      const toolData: ToolData = {
        tool_name: toolName,
        user_id: userId,
        data: data,
        version: Date.now(),
        last_synced: new Date().toISOString()
      }

      // 1. 保存到服务器
      const { error } = await supabase
        .from('user_tool_data')
        .upsert({
          user_id: userId,
          tool_name: toolName,
          data: toolData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tool_name'
        })

      if (error) {
        logError('Failed to save tool data to server', error, 'UserDataSync')
        return false
      }

      // 2. 保存到本地作为缓存
      const localKey = `${toolName}_${userId}`
      localStorage.setItem(localKey, JSON.stringify(data))
      
      logInfo('Tool data saved successfully', { toolName, userId }, 'UserDataSync')
      return true
    } catch (error) {
      logError('Error saving tool data', error, 'UserDataSync')
      return false
    } finally {
      this.syncInProgress.delete(syncKey)
    }
  }

  /**
   * 从服务器加载工具数据
   */
  async loadToolData(toolName: string, userId: string): Promise<any | null> {
    try {
      logInfo('Loading tool data from server', { toolName, userId }, 'UserDataSync')

      const { data, error } = await supabase
        .from('user_tool_data')
        .select('data')
        .eq('user_id', userId)
        .eq('tool_name', toolName)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 工具数据不存在，返回null
          logInfo('Tool data not found on server', { toolName, userId }, 'UserDataSync')
          return null
        }
        logError('Failed to load tool data from server', error, 'UserDataSync')
        return null
      }

      // 同时更新本地缓存
      const localKey = `${toolName}_${userId}`
      localStorage.setItem(localKey, JSON.stringify(data.data.data))
      
      logInfo('Tool data loaded successfully', { toolName, userId }, 'UserDataSync')
      return data.data.data
    } catch (error) {
      logError('Error loading tool data', error, 'UserDataSync')
      return null
    }
  }

  /**
   * 获取本地缓存的工具数据
   */
  getLocalToolData(toolName: string, userId: string): any | null {
    try {
      const localKey = `${toolName}_${userId}`
      const data = localStorage.getItem(localKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logError('Error getting local tool data', error, 'UserDataSync')
      return null
    }
  }

  /**
   * 获取本地缓存的用户资料
   */
  getLocalUserProfile(): UserProfileData | null {
    try {
      const data = localStorage.getItem('user_profile_details')
      return data ? JSON.parse(data) : null
    } catch (error) {
      logError('Error getting local user profile', error, 'UserDataSync')
      return null
    }
  }

  /**
   * 同步所有用户数据（登录时调用）
   */
  async syncAllUserData(userId: string): Promise<void> {
    try {
      logInfo('Starting full user data sync', { userId }, 'UserDataSync')

      // 1. 同步用户资料
      await this.loadUserProfile(userId)

      // 2. 同步已知的工具数据
      const knownTools = ['domain_tracker', 'city_preferences', 'travel_planner']
      
      for (const toolName of knownTools) {
        await this.loadToolData(toolName, userId)
      }

      logInfo('Full user data sync completed', { userId }, 'UserDataSync')
    } catch (error) {
      logError('Error during full user data sync', error, 'UserDataSync')
    }
  }

  /**
   * 清理本地缓存
   */
  clearLocalCache(userId: string): void {
    try {
      // 清理用户资料
      localStorage.removeItem('user_profile_details')

      // 清理工具数据
      const knownTools = ['domain_tracker', 'city_preferences', 'travel_planner']
      knownTools.forEach(toolName => {
        const localKey = `${toolName}_${userId}`
        localStorage.removeItem(localKey)
      })

      logInfo('Local cache cleared', { userId }, 'UserDataSync')
    } catch (error) {
      logError('Error clearing local cache', error, 'UserDataSync')
    }
  }
}

export const userDataSync = UserDataSyncService.getInstance()
