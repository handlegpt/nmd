import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface Notification {
  id: string
  user_id: string
  type: 'meetup_invitation' | 'meetup_reminder' | 'meetup_update' | 'meetup_cancelled' | 'city_update' | 'visa_reminder' | 'weather_alert' | 'social_mention' | 'system_announcement'
  title: string
  message: string
  data: Record<string, any>
  priority: number
  is_read: boolean
  is_actionable: boolean
  action_type?: 'accept' | 'decline' | 'view' | 'reply' | 'dismiss'
  action_data: Record<string, any>
  expires_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationPreference {
  id: string
  user_id: string
  type: string
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  type: string
  title_template: string
  message_template: string
  variables: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GetNotificationsOptions {
  page?: number
  limit?: number
  filter_read?: boolean
  filter_type?: string
}

// 获取用户通知
export async function getUserNotifications(options: GetNotificationsOptions = {}): Promise<{
  notifications: Notification[]
  total: number
  unread: number
  hasMore: boolean
}> {
  try {
    const {
      page = 1,
      limit = 20,
      filter_read,
      filter_type
    } = options

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // 应用筛选条件
    if (filter_read !== undefined) {
      query = query.eq('is_read', filter_read)
    }

    if (filter_type) {
      query = query.eq('type', filter_type)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: notifications, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logError('Failed to fetch notifications', error, 'notificationsApi')
      throw new Error('Failed to fetch notifications')
    }

    // 获取未读数量
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return {
      notifications: notifications || [],
      total: count || 0,
      unread: unreadCount || 0,
      hasMore: (count || 0) > (page * limit)
    }
  } catch (error) {
    logError('Error in getUserNotifications', error, 'notificationsApi')
    throw error
  }
}

// 标记通知为已读
export async function markNotificationsAsRead(notificationIds?: string[]): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds)
    } else {
      query = query.eq('is_read', false)
    }

    const { count, error } = await query

    if (error) {
      logError('Failed to mark notifications as read', error, 'notificationsApi')
      throw new Error('Failed to mark notifications as read')
    }

    logInfo('Notifications marked as read', { count, userId: user.id }, 'notificationsApi')
    return count || 0
  } catch (error) {
    logError('Error in markNotificationsAsRead', error, 'notificationsApi')
    throw error
  }
}

// 删除通知
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      logError('Failed to delete notification', error, 'notificationsApi')
      throw new Error('Failed to delete notification')
    }

    logInfo('Notification deleted', { notificationId, userId: user.id }, 'notificationsApi')
  } catch (error) {
    logError('Error in deleteNotification', error, 'notificationsApi')
    throw error
  }
}

// 获取通知偏好设置
export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      logError('Failed to fetch notification preferences', error, 'notificationsApi')
      throw new Error('Failed to fetch notification preferences')
    }

    return preferences || []
  } catch (error) {
    logError('Error in getNotificationPreferences', error, 'notificationsApi')
    throw error
  }
}

// 更新通知偏好设置
export async function updateNotificationPreference(
  type: string,
  updates: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: preference, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        type,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logError('Failed to update notification preference', error, 'notificationsApi')
      throw new Error('Failed to update notification preference')
    }

    logInfo('Notification preference updated', { type, userId: user.id }, 'notificationsApi')
    return preference
  } catch (error) {
    logError('Error in updateNotificationPreference', error, 'notificationsApi')
    throw error
  }
}

// 创建通知（系统功能）
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data: Record<string, any> = {},
  priority: number = 1,
  actionType?: string,
  actionData: Record<string, any> = {},
  expiresAt?: string
): Promise<string> {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        priority,
        action_type: actionType,
        action_data: actionData,
        expires_at: expiresAt
      })
      .select('id')
      .single()

    if (error) {
      logError('Failed to create notification', error, 'notificationsApi')
      throw new Error('Failed to create notification')
    }

    logInfo('Notification created', { notificationId: notification.id, userId, type }, 'notificationsApi')
    return notification.id
  } catch (error) {
    logError('Error in createNotification', error, 'notificationsApi')
    throw error
  }
}

// 获取通知模板
export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  try {
    const { data: templates, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)

    if (error) {
      logError('Failed to fetch notification templates', error, 'notificationsApi')
      throw new Error('Failed to fetch notification templates')
    }

    return templates || []
  } catch (error) {
    logError('Error in getNotificationTemplates', error, 'notificationsApi')
    throw error
  }
}

// 使用模板创建通知
export async function createNotificationFromTemplate(
  userId: string,
  templateType: string,
  variables: Record<string, any> = {},
  priority: number = 1,
  actionType?: string,
  actionData: Record<string, any> = {},
  expiresAt?: string
): Promise<string> {
  try {
    // 获取模板
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', templateType)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      logError('Template not found', { templateType }, 'notificationsApi')
      throw new Error('Template not found')
    }

    // 替换模板变量
    let title = template.title_template
    let message = template.message_template

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g')
      title = title.replace(regex, String(value))
      message = message.replace(regex, String(value))
    })

    // 创建通知
    return await createNotification(
      userId,
      templateType as Notification['type'],
      title,
      message,
      variables,
      priority,
      actionType,
      actionData,
      expiresAt
    )
  } catch (error) {
    logError('Error in createNotificationFromTemplate', error, 'notificationsApi')
    throw error
  }
}

// 获取通知统计信息
export async function getNotificationStats(): Promise<{
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // 获取基本统计
    const { count: total } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: unread } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // 按类型统计
    const { data: typeStats } = await supabase
      .from('notifications')
      .select('type')
      .eq('user_id', user.id)

    const byType: Record<string, number> = {}
    typeStats?.forEach((item: any) => {
      byType[item.type] = (byType[item.type] || 0) + 1
    })

    // 按优先级统计
    const { data: priorityStats } = await supabase
      .from('notifications')
      .select('priority')
      .eq('user_id', user.id)

    const byPriority: Record<string, number> = {}
    priorityStats?.forEach((item: any) => {
      byPriority[`priority_${item.priority}`] = (byPriority[`priority_${item.priority}`] || 0) + 1
    })

    return {
      total: total || 0,
      unread: unread || 0,
      byType,
      byPriority
    }
  } catch (error) {
    logError('Error in getNotificationStats', error, 'notificationsApi')
    throw error
  }
}

// 批量操作通知
export async function batchNotificationAction(
  action: 'mark_read' | 'delete',
  notificationIds: string[]
): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (action === 'mark_read') {
      return await markNotificationsAsRead(notificationIds)
    } else if (action === 'delete') {
      const { count, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .in('id', notificationIds)

      if (error) {
        logError('Failed to delete notifications', error, 'notificationsApi')
        throw new Error('Failed to delete notifications')
      }

      logInfo('Notifications deleted', { count, userId: user.id }, 'notificationsApi')
      return count || 0
    }

    return 0
  } catch (error) {
    logError('Error in batchNotificationAction', error, 'notificationsApi')
    throw error
  }
}
