/**
 * 用户偏好数据服务
 * 处理用户收藏、隐藏用户等偏好数据的数据库操作
 */

import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface UserPreferences {
  favorites: string[]
  hidden_users: string[]
  blocked_users: string[]
  preferences: Record<string, any>
}

class UserPreferencesService {
  private static instance: UserPreferencesService

  static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService()
    }
    return UserPreferencesService.instance
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      favorites: [],
      hidden_users: [],
      blocked_users: [],
      preferences: {}
    }
  }

  /**
   * 获取用户偏好数据
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      logInfo('Fetching user preferences from database', { userId }, 'UserPreferencesService')

      const { data, error } = await supabase
        .from('user_preferences')
        .select('favorites, hidden_users, blocked_users, preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        logError('Failed to fetch user preferences', error, 'UserPreferencesService')
        throw error
      }

      // 如果没有找到数据，返回默认值
      const result = data || this.getDefaultPreferences()

      logInfo('Successfully fetched user preferences', { userId, favoritesCount: result.favorites.length, hiddenCount: result.hidden_users.length }, 'UserPreferencesService')
      return result
    } catch (error) {
      logError('Error fetching user preferences', error, 'UserPreferencesService')
      
      // 如果数据库失败，返回默认值
      return {
        favorites: [],
        hidden_users: [],
        blocked_users: [],
        preferences: {}
      }
    }
  }

  /**
   * 更新用户偏好数据
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      logInfo('Updating user preferences in database', { userId, preferences }, 'UserPreferencesService')

      // 获取当前偏好数据
      const currentPreferences = await this.getUserPreferences(userId)
      
      // 合并新的偏好数据
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          favorites: updatedPreferences.favorites,
          hidden_users: updatedPreferences.hidden_users,
          blocked_users: updatedPreferences.blocked_users,
          preferences: updatedPreferences.preferences,
          updated_at: updatedPreferences.updated_at
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Failed to update user preferences', error, 'UserPreferencesService')
        return false
      }

      logInfo('Successfully updated user preferences', { userId }, 'UserPreferencesService')
      return true
    } catch (error) {
      logError('Error updating user preferences', error, 'UserPreferencesService')
      return false
    }
  }

  /**
   * 添加用户到收藏列表
   */
  async addToFavorites(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (preferences.favorites.includes(targetUserId)) {
        return true // 已经在收藏列表中
      }

      const newFavorites = [...preferences.favorites, targetUserId]
      return await this.updateUserPreferences(userId, { favorites: newFavorites })
    } catch (error) {
      logError('Error adding user to favorites', error, 'UserPreferencesService')
      return false
    }
  }

  /**
   * 从收藏列表移除用户
   */
  async removeFromFavorites(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId)
      const newFavorites = preferences.favorites.filter(id => id !== targetUserId)
      return await this.updateUserPreferences(userId, { favorites: newFavorites })
    } catch (error) {
      logError('Error removing user from favorites', error, 'UserPreferencesService')
      return false
    }
  }

  /**
   * 隐藏用户
   */
  async hideUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (preferences.hidden_users.includes(targetUserId)) {
        return true // 已经隐藏
      }

      const newHiddenUsers = [...preferences.hidden_users, targetUserId]
      return await this.updateUserPreferences(userId, { hidden_users: newHiddenUsers })
    } catch (error) {
      logError('Error hiding user', error, 'UserPreferencesService')
      return false
    }
  }

  /**
   * 显示用户
   */
  async showUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId)
      const newHiddenUsers = preferences.hidden_users.filter(id => id !== targetUserId)
      return await this.updateUserPreferences(userId, { hidden_users: newHiddenUsers })
    } catch (error) {
      logError('Error showing user', error, 'UserPreferencesService')
      return false
    }
  }

  /**
   * 获取收藏列表
   */
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.favorites
    } catch (error) {
      logError('Error getting favorites', error, 'UserPreferencesService')
      return []
    }
  }

  /**
   * 获取隐藏用户列表
   */
  async getHiddenUsers(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.hidden_users
    } catch (error) {
      logError('Error getting hidden users', error, 'UserPreferencesService')
      return []
    }
  }
}

export const userPreferencesService = UserPreferencesService.getInstance()
