import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface NotificationSettings {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  meetup_notifications: boolean
  message_notifications: boolean
  city_updates: boolean
  connection_requests: boolean
  created_at: string
  updated_at: string
}

export interface NotificationSettingsInput {
  email_notifications?: boolean
  push_notifications?: boolean
  meetup_notifications?: boolean
  message_notifications?: boolean
  city_updates?: boolean
  connection_requests?: boolean
}

class NotificationSettingsService {
  /**
   * 获取用户通知设置
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch notification settings', error, 'NotificationSettingsService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching notification settings', error, 'NotificationSettingsService')
      return null
    }
  }

  /**
   * 创建或更新通知设置
   */
  async upsertNotificationSettings(userId: string, settings: NotificationSettingsInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          meetup_notifications: settings.meetup_notifications,
          message_notifications: settings.message_notifications,
          city_updates: settings.city_updates,
          connection_requests: settings.connection_requests
        })

      if (error) {
        logError('Failed to upsert notification settings', error, 'NotificationSettingsService')
        return false
      }

      logInfo('Notification settings upserted successfully', { userId }, 'NotificationSettingsService')
      return true
    } catch (error) {
      logError('Error upserting notification settings', error, 'NotificationSettingsService')
      return false
    }
  }

  /**
   * 更新特定通知设置
   */
  async updateNotificationSetting(userId: string, setting: keyof NotificationSettingsInput, value: boolean): Promise<boolean> {
    try {
      const updateData: any = { user_id: userId }
      updateData[setting] = value

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(updateData)

      if (error) {
        logError('Failed to update notification setting', error, 'NotificationSettingsService')
        return false
      }

      logInfo('Notification setting updated successfully', { userId, setting, value }, 'NotificationSettingsService')
      return true
    } catch (error) {
      logError('Error updating notification setting', error, 'NotificationSettingsService')
      return false
    }
  }

  /**
   * 获取默认通知设置
   */
  getDefaultNotificationSettings(): NotificationSettingsInput {
    return {
      email_notifications: true,
      push_notifications: true,
      meetup_notifications: true,
      message_notifications: true,
      city_updates: true,
      connection_requests: true
    }
  }

  /**
   * 获取用户通知设置或默认设置
   */
  async getNotificationSettingsWithDefaults(userId: string): Promise<NotificationSettingsInput> {
    try {
      const settings = await this.getNotificationSettings(userId)
      const defaultSettings = this.getDefaultNotificationSettings()

      if (!settings) {
        // 创建默认设置
        await this.upsertNotificationSettings(userId, defaultSettings)
        return defaultSettings
      }

      return {
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        meetup_notifications: settings.meetup_notifications,
        message_notifications: settings.message_notifications,
        city_updates: settings.city_updates,
        connection_requests: settings.connection_requests
      }
    } catch (error) {
      logError('Error getting notification settings with defaults', error, 'NotificationSettingsService')
      return this.getDefaultNotificationSettings()
    }
  }

  /**
   * 重置通知设置为默认值
   */
  async resetNotificationSettings(userId: string): Promise<boolean> {
    try {
      const defaultSettings = this.getDefaultNotificationSettings()
      return await this.upsertNotificationSettings(userId, defaultSettings)
    } catch (error) {
      logError('Error resetting notification settings', error, 'NotificationSettingsService')
      return false
    }
  }

  /**
   * 批量更新通知设置
   */
  async updateMultipleNotificationSettings(userId: string, settings: NotificationSettingsInput): Promise<boolean> {
    try {
      const existingSettings = await this.getNotificationSettings(userId)
      const currentSettings = existingSettings ? {
        email_notifications: existingSettings.email_notifications,
        push_notifications: existingSettings.push_notifications,
        meetup_notifications: existingSettings.meetup_notifications,
        message_notifications: existingSettings.message_notifications,
        city_updates: existingSettings.city_updates,
        connection_requests: existingSettings.connection_requests
      } : this.getDefaultNotificationSettings()

      const updatedSettings = {
        ...currentSettings,
        ...settings
      }

      return await this.upsertNotificationSettings(userId, updatedSettings)
    } catch (error) {
      logError('Error updating multiple notification settings', error, 'NotificationSettingsService')
      return false
    }
  }

  /**
   * 检查特定通知是否启用
   */
  async isNotificationEnabled(userId: string, notificationType: keyof NotificationSettingsInput): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettingsWithDefaults(userId)
      return settings[notificationType] || false
    } catch (error) {
      logError('Error checking notification status', error, 'NotificationSettingsService')
      return false
    }
  }

  /**
   * 获取通知设置统计
   */
  async getNotificationSettingsStats(): Promise<{
    totalUsers: number
    usersWithSettings: number
    notificationPreferences: { [key: string]: { enabled: number; disabled: number } }
  }> {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')

      if (error) {
        logError('Failed to fetch notification settings stats', error, 'NotificationSettingsService')
        return { totalUsers: 0, usersWithSettings: 0, notificationPreferences: {} }
      }

      const usersWithSettings = data.length
      const notificationPreferences: { [key: string]: { enabled: number; disabled: number } } = {}

      // Initialize counters
      const notificationTypes = [
        'email_notifications',
        'push_notifications',
        'meetup_notifications',
        'message_notifications',
        'city_updates',
        'connection_requests'
      ]

      notificationTypes.forEach(type => {
        notificationPreferences[type] = { enabled: 0, disabled: 0 }
      })

      // Count preferences
      data.forEach((record: any) => {
        notificationTypes.forEach(type => {
          if (record[type]) {
            notificationPreferences[type].enabled++
          } else {
            notificationPreferences[type].disabled++
          }
        })
      })

      return {
        totalUsers: usersWithSettings, // This would need a separate query to get total users
        usersWithSettings,
        notificationPreferences
      }
    } catch (error) {
      logError('Error getting notification settings stats', error, 'NotificationSettingsService')
      return { totalUsers: 0, usersWithSettings: 0, notificationPreferences: {} }
    }
  }

  /**
   * 获取用户通知偏好摘要
   */
  async getUserNotificationSummary(userId: string): Promise<{
    totalEnabled: number
    totalDisabled: number
    enabledNotifications: string[]
    disabledNotifications: string[]
  }> {
    try {
      const settings = await this.getNotificationSettingsWithDefaults(userId)
      
      const enabledNotifications: string[] = []
      const disabledNotifications: string[] = []

      Object.entries(settings).forEach(([key, value]) => {
        if (value) {
          enabledNotifications.push(key)
        } else {
          disabledNotifications.push(key)
        }
      })

      return {
        totalEnabled: enabledNotifications.length,
        totalDisabled: disabledNotifications.length,
        enabledNotifications,
        disabledNotifications
      }
    } catch (error) {
      logError('Error getting user notification summary', error, 'NotificationSettingsService')
      return {
        totalEnabled: 0,
        totalDisabled: 0,
        enabledNotifications: [],
        disabledNotifications: []
      }
    }
  }
}

export const notificationSettingsService = new NotificationSettingsService()
