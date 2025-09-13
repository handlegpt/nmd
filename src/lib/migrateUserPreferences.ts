/**
 * 用户偏好数据迁移工具
 * 将 localStorage 中的用户偏好数据迁移到数据库
 */

import { supabase } from './supabase'
import { userPreferencesService } from './userPreferencesService'
import { logInfo, logError } from './logger'

export interface MigrationResult {
  success: boolean
  migrated: {
    favorites: number
    hiddenUsers: number
    totalUsers: number
  }
  errors: string[]
}

export class UserPreferencesMigration {
  private static instance: UserPreferencesMigration

  static getInstance(): UserPreferencesMigration {
    if (!UserPreferencesMigration.instance) {
      UserPreferencesMigration.instance = new UserPreferencesMigration()
    }
    return UserPreferencesMigration.instance
  }

  /**
   * 检查是否有需要迁移的数据
   */
  hasDataToMigrate(): boolean {
    try {
      const favorites = null // REMOVED: localStorage usage for nomadFavorites
      const hiddenUsers = null // REMOVED: localStorage usage for hidden_nomad_users
      
      const hasFavorites = favorites && favorites !== '[]' && favorites !== 'null'
      const hasHiddenUsers = hiddenUsers && hiddenUsers !== '[]' && hiddenUsers !== 'null'
      
      return !!(hasFavorites || hasHiddenUsers)
    } catch (error) {
      logError('Error checking migration data', error, 'UserPreferencesMigration')
      return false
    }
  }

  /**
   * 获取 localStorage 中的用户偏好数据
   */
  private getLocalStorageData(): {
    favorites: string[]
    hiddenUsers: string[]
  } {
    try {
      const favorites: any[] = [] // REMOVED: localStorage usage for nomadFavorites
      const hiddenUsers: any[] = [] // REMOVED: localStorage usage for hidden_nomad_users
      
      return {
        favorites: Array.isArray(favorites) ? favorites : [],
        hiddenUsers: Array.isArray(hiddenUsers) ? hiddenUsers : []
      }
    } catch (error) {
      logError('Error parsing localStorage data', error, 'UserPreferencesMigration')
      return {
        favorites: [],
        hiddenUsers: []
      }
    }
  }

  /**
   * 迁移当前用户的偏好数据
   */
  async migrateCurrentUser(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrated: {
        favorites: 0,
        hiddenUsers: 0,
        totalUsers: 0
      },
      errors: []
    }

    try {
      // 获取当前用户
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        result.errors.push('用户未登录，无法迁移数据')
        return result
      }

      // 获取 localStorage 中的数据
      const localData = this.getLocalStorageData()
      
      if (localData.favorites.length === 0 && localData.hiddenUsers.length === 0) {
        result.success = true
        result.errors.push('没有需要迁移的数据')
        return result
      }

      // 迁移数据到数据库
      const migrationSuccess = await userPreferencesService.updateUserPreferences(
        user.id,
        {
          favorites: localData.favorites,
          hidden_users: localData.hiddenUsers,
          blocked_users: [],
          preferences: {}
        }
      )

      if (migrationSuccess) {
        result.success = true
        result.migrated.favorites = localData.favorites.length
        result.migrated.hiddenUsers = localData.hiddenUsers.length
        result.migrated.totalUsers = 1

        // 迁移成功后，可以选择清理 localStorage 数据
        // 这里我们保留数据作为备份，直到用户确认迁移成功
        logInfo('Successfully migrated user preferences', {
          userId: user.id,
          favorites: localData.favorites.length,
          hiddenUsers: localData.hiddenUsers.length
        }, 'UserPreferencesMigration')
      } else {
        result.errors.push('数据库更新失败')
      }

    } catch (error) {
      logError('Error migrating user preferences', error, 'UserPreferencesMigration')
      result.errors.push(`迁移失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    return result
  }

  /**
   * 清理 localStorage 中的用户偏好数据（迁移完成后）
   */
  async cleanupLocalStorage(): Promise<boolean> {
    try {
      // REMOVED: localStorage usage for nomadFavorites
      // REMOVED: localStorage usage for hidden_nomad_users
      
      logInfo('Successfully cleaned up localStorage user preferences', {}, 'UserPreferencesMigration')
      return true
    } catch (error) {
      logError('Error cleaning up localStorage', error, 'UserPreferencesMigration')
      return false
    }
  }

  /**
   * 验证迁移结果
   */
  async verifyMigration(userId: string): Promise<{
    success: boolean
    databaseData: {
      favorites: string[]
      hiddenUsers: string[]
    }
    localData: {
      favorites: string[]
      hiddenUsers: string[]
    }
    matches: boolean
  }> {
    try {
      // 获取数据库中的数据
      const dbPreferences = await userPreferencesService.getUserPreferences(userId)
      
      // 获取 localStorage 中的数据
      const localData = this.getLocalStorageData()
      
      const databaseData = {
        favorites: dbPreferences.favorites,
        hiddenUsers: dbPreferences.hidden_users
      }

      // 比较数据是否匹配
      const favoritesMatch = JSON.stringify(databaseData.favorites.sort()) === 
                            JSON.stringify(localData.favorites.sort())
      const hiddenUsersMatch = JSON.stringify(databaseData.hiddenUsers.sort()) === 
                              JSON.stringify(localData.hiddenUsers.sort())
      
      const matches = favoritesMatch && hiddenUsersMatch

      return {
        success: true,
        databaseData,
        localData,
        matches
      }
    } catch (error) {
      logError('Error verifying migration', error, 'UserPreferencesMigration')
      return {
        success: false,
        databaseData: { favorites: [], hiddenUsers: [] },
        localData: { favorites: [], hiddenUsers: [] },
        matches: false
      }
    }
  }

  /**
   * 获取迁移统计信息
   */
  getMigrationStats(): {
    hasLocalData: boolean
    localFavoritesCount: number
    localHiddenUsersCount: number
    lastModified?: number
  } {
    try {
      const localData = this.getLocalStorageData()
      
      // 尝试获取最后修改时间
      let lastModified: number | undefined
      try {
        const favoritesItem = null // REMOVED: localStorage usage for nomadFavorites
        if (favoritesItem) {
          // 这里我们无法直接获取 localStorage 项的修改时间
          // 但可以检查数据是否存在
          lastModified = Date.now()
        }
      } catch (error) {
        // 忽略错误
      }

      return {
        hasLocalData: localData.favorites.length > 0 || localData.hiddenUsers.length > 0,
        localFavoritesCount: localData.favorites.length,
        localHiddenUsersCount: localData.hiddenUsers.length,
        lastModified
      }
    } catch (error) {
      logError('Error getting migration stats', error, 'UserPreferencesMigration')
      return {
        hasLocalData: false,
        localFavoritesCount: 0,
        localHiddenUsersCount: 0
      }
    }
  }
}

export const userPreferencesMigration = UserPreferencesMigration.getInstance()
