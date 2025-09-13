/**
 * 单用户数据迁移工具
 * 用于迁移特定用户的 localStorage 数据到数据库
 */

import { userPreferencesService } from './userPreferencesService'
import { logInfo, logError } from './logger'

export interface SingleUserMigrationResult {
  success: boolean
  userId: string
  migrated: {
    favorites: number
    hiddenUsers: number
  }
  errors: string[]
}

export class SingleUserMigration {
  private static instance: SingleUserMigration

  static getInstance(): SingleUserMigration {
    if (!SingleUserMigration.instance) {
      SingleUserMigration.instance = new SingleUserMigration()
    }
    return SingleUserMigration.instance
  }

  /**
   * 获取 localStorage 中的用户偏好数据
   */
  private getLocalStorageData(): {
    favorites: string[]
    hiddenUsers: string[]
  } {
    try {
      const favorites: string[] = [] // REMOVED: localStorage usage for nomadFavorites
      const hiddenUsers: string[] = [] // REMOVED: localStorage usage for hidden_nomad_users
      
      return {
        favorites: Array.isArray(favorites) ? favorites : [],
        hiddenUsers: Array.isArray(hiddenUsers) ? hiddenUsers : []
      }
    } catch (error) {
      logError('Error parsing localStorage data', error, 'SingleUserMigration')
      return {
        favorites: [],
        hiddenUsers: []
      }
    }
  }

  /**
   * 迁移单个用户的偏好数据
   */
  async migrateUser(userId: string): Promise<SingleUserMigrationResult> {
    const result: SingleUserMigrationResult = {
      success: false,
      userId,
      migrated: {
        favorites: 0,
        hiddenUsers: 0
      },
      errors: []
    }

    try {
      logInfo('Starting single user migration', { userId }, 'SingleUserMigration')

      // 获取 localStorage 中的数据
      const localData = this.getLocalStorageData()
      
      if (localData.favorites.length === 0 && localData.hiddenUsers.length === 0) {
        result.errors.push('No data found in localStorage to migrate')
        return result
      }

      // 迁移数据到数据库
      const migrationSuccess = await userPreferencesService.updateUserPreferences(
        userId,
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

        logInfo('Successfully migrated user preferences', {
          userId,
          favorites: localData.favorites.length,
          hiddenUsers: localData.hiddenUsers.length
        }, 'SingleUserMigration')
      } else {
        result.errors.push('Failed to update user preferences in database')
      }

    } catch (error) {
      logError('Error migrating user preferences', error, 'SingleUserMigration')
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
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
      logError('Error verifying migration', error, 'SingleUserMigration')
      return {
        success: false,
        databaseData: { favorites: [], hiddenUsers: [] },
        localData: { favorites: [], hiddenUsers: [] },
        matches: false
      }
    }
  }

  /**
   * 清理 localStorage 数据（迁移完成后）
   */
  async cleanupLocalStorage(): Promise<boolean> {
    try {
      // REMOVED: localStorage usage for nomadFavorites
      // REMOVED: localStorage usage for hidden_nomad_users
      
      logInfo('Successfully cleaned up localStorage user preferences', {}, 'SingleUserMigration')
      return true
    } catch (error) {
      logError('Error cleaning up localStorage', error, 'SingleUserMigration')
      return false
    }
  }

  /**
   * 获取迁移统计信息
   */
  getMigrationStats(): {
    hasLocalData: boolean
    localFavoritesCount: number
    localHiddenUsersCount: number
  } {
    try {
      const localData = this.getLocalStorageData()
      
      return {
        hasLocalData: localData.favorites.length > 0 || localData.hiddenUsers.length > 0,
        localFavoritesCount: localData.favorites.length,
        localHiddenUsersCount: localData.hiddenUsers.length
      }
    } catch (error) {
      logError('Error getting migration stats', error, 'SingleUserMigration')
      return {
        hasLocalData: false,
        localFavoritesCount: 0,
        localHiddenUsersCount: 0
      }
    }
  }
}

export const singleUserMigration = SingleUserMigration.getInstance()
