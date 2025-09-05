import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface CommunityMessage {
  id: string
  user_id: string
  content: string
  message_type: 'general' | 'question' | 'info' | 'help'
  location?: string
  tags: string[]
  likes_count: number
  replies_count: number
  parent_message_id?: string
  is_edited: boolean
  edited_at?: string
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at: string
  // 用户信息
  user_name?: string
  user_avatar?: string
  user_location?: string
  is_liked_by_current_user?: boolean
}

export interface MessageReply {
  id: string
  parent_message_id: string
  user_id: string
  content: string
  is_edited: boolean
  edited_at?: string
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at: string
  // 用户信息
  user_name?: string
  user_avatar?: string
}

export interface MessageNotification {
  id: string
  user_id: string
  message_id: string
  notification_type: 'like' | 'reply' | 'mention'
  from_user_id: string
  is_read: boolean
  created_at: string
}

export interface GetMessagesOptions {
  page?: number
  limit?: number
  message_type?: string
  location?: string
  search?: string
  parent_message_id?: string
}

// 获取消息列表
export async function getCommunityMessages(options: GetMessagesOptions = {}): Promise<{
  messages: CommunityMessage[]
  total: number
  hasMore: boolean
}> {
  try {
    const {
      page = 1,
      limit = 20,
      message_type,
      location,
      search,
      parent_message_id
    } = options

    let query = supabase
      .from('community_messages_with_user_info')
      .select('*', { count: 'exact' })

    // 应用筛选条件
    if (message_type && message_type !== 'all') {
      query = query.eq('message_type', message_type)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,user_name.ilike.%${search}%,tags.cs.{${search}}`)
    }

    if (parent_message_id) {
      query = query.eq('parent_message_id', parent_message_id)
    } else {
      // 只获取主消息（非回复）
      query = query.is('parent_message_id', null)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: messages, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logError('Failed to fetch community messages', error, 'communityChatApi')
      throw new Error('Failed to fetch messages')
    }

    return {
      messages: messages || [],
      total: count || 0,
      hasMore: (count || 0) > (page * limit)
    }
  } catch (error) {
    logError('Error in getCommunityMessages', error, 'communityChatApi')
    throw error
  }
}

// 发送新消息
export async function sendCommunityMessage(messageData: {
  content: string
  message_type: 'general' | 'question' | 'info' | 'help'
  location?: string
  tags?: string[]
  parent_message_id?: string
}): Promise<CommunityMessage> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: message, error } = await supabase
      .from('community_messages')
      .insert({
        user_id: user.id,
        content: messageData.content,
        message_type: messageData.message_type,
        location: messageData.location,
        tags: messageData.tags || [],
        parent_message_id: messageData.parent_message_id
      })
      .select('*')
      .single()

    if (error) {
      logError('Failed to send community message', error, 'communityChatApi')
      throw new Error('Failed to send message')
    }

    // 获取完整的消息信息（包括用户信息）
    const { data: fullMessage } = await supabase
      .from('community_messages_with_user_info')
      .select('*')
      .eq('id', message.id)
      .single()

    logInfo('Community message sent successfully', { messageId: message.id }, 'communityChatApi')
    return fullMessage
  } catch (error) {
    logError('Error in sendCommunityMessage', error, 'communityChatApi')
    throw error
  }
}

// 点赞/取消点赞消息
export async function toggleMessageLike(messageId: string): Promise<{
  isLiked: boolean
  likesCount: number
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('message_likes')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // 取消点赞
      const { error } = await supabase
        .from('message_likes')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)

      if (error) {
        logError('Failed to unlike message', error, 'communityChatApi')
        throw new Error('Failed to unlike message')
      }

      // 获取更新后的点赞数
      const { data: message } = await supabase
        .from('community_messages')
        .select('likes_count')
        .eq('id', messageId)
        .single()

      logInfo('Message unliked successfully', { messageId }, 'communityChatApi')
      return {
        isLiked: false,
        likesCount: message?.likes_count || 0
      }
    } else {
      // 添加点赞
      const { error } = await supabase
        .from('message_likes')
        .insert({
          message_id: messageId,
          user_id: user.id
        })

      if (error) {
        logError('Failed to like message', error, 'communityChatApi')
        throw new Error('Failed to like message')
      }

      // 获取更新后的点赞数
      const { data: message } = await supabase
        .from('community_messages')
        .select('likes_count')
        .eq('id', messageId)
        .single()

      logInfo('Message liked successfully', { messageId }, 'communityChatApi')
      return {
        isLiked: true,
        likesCount: message?.likes_count || 0
      }
    }
  } catch (error) {
    logError('Error in toggleMessageLike', error, 'communityChatApi')
    throw error
  }
}

// 获取消息的回复
export async function getMessageReplies(messageId: string): Promise<MessageReply[]> {
  try {
    const { data: replies, error } = await supabase
      .from('message_replies')
      .select(`
        *,
        users!inner(name, avatar)
      `)
      .eq('parent_message_id', messageId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) {
      logError('Failed to fetch message replies', error, 'communityChatApi')
      throw new Error('Failed to fetch replies')
    }

    return replies?.map((reply: any) => ({
      ...reply,
      user_name: reply.users?.name,
      user_avatar: reply.users?.avatar_url
    })) || []
  } catch (error) {
    logError('Error in getMessageReplies', error, 'communityChatApi')
    throw error
  }
}

// 发送回复
export async function sendMessageReply(messageId: string, content: string): Promise<MessageReply> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: reply, error } = await supabase
      .from('message_replies')
      .insert({
        parent_message_id: messageId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        users!inner(name, avatar)
      `)
      .single()

    if (error) {
      logError('Failed to send message reply', error, 'communityChatApi')
      throw new Error('Failed to send reply')
    }

    logInfo('Message reply sent successfully', { replyId: reply.id }, 'communityChatApi')
    return {
      ...reply,
      user_name: reply.users?.name,
      user_avatar: reply.users?.avatar_url
    }
  } catch (error) {
    logError('Error in sendMessageReply', error, 'communityChatApi')
    throw error
  }
}

// 编辑消息
export async function editCommunityMessage(messageId: string, content: string): Promise<CommunityMessage> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: message, error } = await supabase
      .from('community_messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      logError('Failed to edit community message', error, 'communityChatApi')
      throw new Error('Failed to edit message')
    }

    logInfo('Community message edited successfully', { messageId }, 'communityChatApi')
    return message
  } catch (error) {
    logError('Error in editCommunityMessage', error, 'communityChatApi')
    throw error
  }
}

// 删除消息
export async function deleteCommunityMessage(messageId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('community_messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (error) {
      logError('Failed to delete community message', error, 'communityChatApi')
      throw new Error('Failed to delete message')
    }

    logInfo('Community message deleted successfully', { messageId }, 'communityChatApi')
  } catch (error) {
    logError('Error in deleteCommunityMessage', error, 'communityChatApi')
    throw error
  }
}

// 获取用户的通知
export async function getUserNotifications(): Promise<MessageNotification[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: notifications, error } = await supabase
      .from('message_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logError('Failed to fetch user notifications', error, 'communityChatApi')
      throw new Error('Failed to fetch notifications')
    }

    return notifications || []
  } catch (error) {
    logError('Error in getUserNotifications', error, 'communityChatApi')
    throw error
  }
}

// 标记通知为已读
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('message_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      logError('Failed to mark notification as read', error, 'communityChatApi')
      throw new Error('Failed to mark notification as read')
    }
  } catch (error) {
    logError('Error in markNotificationAsRead', error, 'communityChatApi')
    throw error
  }
}
