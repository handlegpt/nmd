import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface UserSettings {
  id: string
  user_id: string
  settings: { [key: string]: any }
  created_at: string
  updated_at: string
}

export interface UserSettingsInput {
  [key: string]: any
}

class UserSettingsService {
  /**
   * 获取用户设置
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch user settings', error, 'UserSettingsService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching user settings', error, 'UserSettingsService')
      return null
    }
  }

  /**
   * 创建或更新用户设置
   */
  async upsertUserSettings(userId: string, settings: UserSettingsInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: settings
        })

      if (error) {
        logError('Failed to upsert user settings', error, 'UserSettingsService')
        return false
      }

      logInfo('User settings upserted successfully', { userId }, 'UserSettingsService')
      return true
    } catch (error) {
      logError('Error upserting user settings', error, 'UserSettingsService')
      return false
    }
  }

  /**
   * 更新特定设置项
   */
  async updateSetting(userId: string, key: string, value: any): Promise<boolean> {
    try {
      // 先获取现有设置
      const existingSettings = await this.getUserSettings(userId)
      const currentSettings = existingSettings?.settings || {}

      // 更新特定设置项
      const updatedSettings = {
        ...currentSettings,
        [key]: value
      }

      return await this.upsertUserSettings(userId, updatedSettings)
    } catch (error) {
      logError('Error updating user setting', error, 'UserSettingsService')
      return false
    }
  }

  /**
   * 获取特定设置项
   */
  async getSetting(userId: string, key: string, defaultValue: any = null): Promise<any> {
    try {
      const settings = await this.getUserSettings(userId)
      if (!settings) {
        return defaultValue
      }

      return settings.settings[key] !== undefined ? settings.settings[key] : defaultValue
    } catch (error) {
      logError('Error getting user setting', error, 'UserSettingsService')
      return defaultValue
    }
  }

  /**
   * 删除特定设置项
   */
  async deleteSetting(userId: string, key: string): Promise<boolean> {
    try {
      const existingSettings = await this.getUserSettings(userId)
      if (!existingSettings) {
        return true // Nothing to delete
      }

      const updatedSettings = { ...existingSettings.settings }
      delete updatedSettings[key]

      return await this.upsertUserSettings(userId, updatedSettings)
    } catch (error) {
      logError('Error deleting user setting', error, 'UserSettingsService')
      return false
    }
  }

  /**
   * 重置用户设置
   */
  async resetUserSettings(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logError('Failed to reset user settings', error, 'UserSettingsService')
        return false
      }

      logInfo('User settings reset successfully', { userId }, 'UserSettingsService')
      return true
    } catch (error) {
      logError('Error resetting user settings', error, 'UserSettingsService')
      return false
    }
  }

  /**
   * 获取默认设置
   */
  getDefaultSettings(): UserSettingsInput {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      units: 'metric',
      notifications: {
        email: true,
        push: true,
        browser: true
      },
      privacy: {
        profileVisibility: 'public',
        showLocation: true,
        showOnlineStatus: true
      },
      display: {
        itemsPerPage: 20,
        showImages: true,
        compactMode: false
      }
    }
  }

  /**
   * 获取用户设置或默认设置
   */
  async getUserSettingsWithDefaults(userId: string): Promise<UserSettingsInput> {
    try {
      const settings = await this.getUserSettings(userId)
      const defaultSettings = this.getDefaultSettings()

      if (!settings) {
        // 创建默认设置
        await this.upsertUserSettings(userId, defaultSettings)
        return defaultSettings
      }

      // 合并用户设置和默认设置
      return {
        ...defaultSettings,
        ...settings.settings
      }
    } catch (error) {
      logError('Error getting user settings with defaults', error, 'UserSettingsService')
      return this.getDefaultSettings()
    }
  }

  /**
   * 批量更新设置
   */
  async updateMultipleSettings(userId: string, settings: UserSettingsInput): Promise<boolean> {
    try {
      const existingSettings = await this.getUserSettings(userId)
      const currentSettings = existingSettings?.settings || {}

      const updatedSettings = {
        ...currentSettings,
        ...settings
      }

      return await this.upsertUserSettings(userId, updatedSettings)
    } catch (error) {
      logError('Error updating multiple user settings', error, 'UserSettingsService')
      return false
    }
  }

  /**
   * 获取设置统计
   */
  async getSettingsStats(): Promise<{
    totalUsers: number
    usersWithSettings: number
    mostCommonSettings: { [key: string]: any }
  }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')

      if (error) {
        logError('Failed to fetch settings stats', error, 'UserSettingsService')
        return { totalUsers: 0, usersWithSettings: 0, mostCommonSettings: {} }
      }

      const usersWithSettings = data.length
      
      // Calculate most common settings
      const settingCounts: { [key: string]: { [key: string]: number } } = {}
      data.forEach((record: any) => {
        Object.entries(record.settings).forEach(([key, value]) => {
          if (!settingCounts[key]) {
            settingCounts[key] = {}
          }
          const valueKey = String(value)
          settingCounts[key][valueKey] = (settingCounts[key][valueKey] || 0) + 1
        })
      })

      // Find most common values for each setting
      const mostCommonSettings: { [key: string]: any } = {}
      Object.entries(settingCounts).forEach(([settingKey, valueCounts]) => {
        const mostCommon = Object.entries(valueCounts).reduce((a, b) => 
          valueCounts[a[0]] > valueCounts[b[0]] ? a : b
        )
        mostCommonSettings[settingKey] = mostCommon[0]
      })

      return {
        totalUsers: usersWithSettings, // This would need a separate query to get total users
        usersWithSettings,
        mostCommonSettings
      }
    } catch (error) {
      logError('Error getting settings stats', error, 'UserSettingsService')
      return { totalUsers: 0, usersWithSettings: 0, mostCommonSettings: {} }
    }
  }
}

export const userSettingsService = new UserSettingsService()
