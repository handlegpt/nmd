import { supabase } from './supabase'
import { logInfo, logError, logWarn } from './logger'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface CommunityRealtimeEvent {
  type: 'new_message' | 'message_updated' | 'message_deleted' | 'message_liked' | 'new_reply' | 'user_online' | 'user_offline'
  data: any
  timestamp: string
}

export interface CommunityRealtimeConfig {
  enableRealtime: boolean
  reconnectAttempts: number
  heartbeatInterval: number
}

const defaultConfig: CommunityRealtimeConfig = {
  enableRealtime: true,
  reconnectAttempts: 5,
  heartbeatInterval: 30000
}

export class CommunityRealtimeService {
  private static instance: CommunityRealtimeService
  private channel: RealtimeChannel | null = null
  private config: CommunityRealtimeConfig
  private eventListeners: Map<string, ((event: CommunityRealtimeEvent) => void)[]> = new Map()
  private reconnectAttempts = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnected = false

  constructor(config: Partial<CommunityRealtimeConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  static getInstance(config?: Partial<CommunityRealtimeConfig>): CommunityRealtimeService {
    if (!CommunityRealtimeService.instance) {
      CommunityRealtimeService.instance = new CommunityRealtimeService(config)
    }
    return CommunityRealtimeService.instance
  }

  // 连接实时通信
  async connect(): Promise<void> {
    if (!this.config.enableRealtime) {
      logInfo('Realtime disabled, skipping connection', null, 'CommunityRealtimeService')
      return
    }

    if (this.isConnected && this.channel) {
      logInfo('Already connected to realtime', null, 'CommunityRealtimeService')
      return
    }

    try {
      logInfo('Connecting to community realtime...', null, 'CommunityRealtimeService')

      // 订阅社区消息频道
      this.channel = supabase
        .channel('community-chat')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        }, (payload: any) => {
          this.handleNewMessage(payload)
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages'
        }, (payload: any) => {
          this.handleMessageUpdate(payload)
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'community_messages'
        }, (payload: any) => {
          this.handleMessageDelete(payload)
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'message_likes'
        }, (payload: any) => {
          this.handleMessageLike(payload)
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'message_likes'
        }, (payload: any) => {
          this.handleMessageUnlike(payload)
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies'
        }, (payload: any) => {
          this.handleNewReply(payload)
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'message_notifications'
        }, (payload: any) => {
          this.handleNewNotification(payload)
        })
        .subscribe((status: string) => {
          this.handleConnectionStatus(status)
        })

      this.isConnected = true
      this.reconnectAttempts = 0
      this.startHeartbeat()
      
      logInfo('Connected to community realtime', { status: 'connected' }, 'CommunityRealtimeService')
    } catch (error) {
      logError('Failed to connect to community realtime', error, 'CommunityRealtimeService')
      this.handleReconnect()
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
    
    this.isConnected = false
    this.stopHeartbeat()
    
    logInfo('Disconnected from community realtime', null, 'CommunityRealtimeService')
  }

  // 添加事件监听器
  addEventListener(eventType: string, listener: (event: CommunityRealtimeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  // 移除事件监听器
  removeEventListener(eventType: string, listener: (event: CommunityRealtimeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // 触发事件
  private emitEvent(eventType: string, data: any): void {
    const event: CommunityRealtimeEvent = {
      type: eventType as any,
      data,
      timestamp: new Date().toISOString()
    }

    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          logError(`Error in event listener for ${eventType}`, error, 'CommunityRealtimeService')
        }
      })
    }
  }

  // 处理新消息
  private handleNewMessage(payload: any): void {
    logInfo('New message received', { messageId: payload.new.id }, 'CommunityRealtimeService')
    this.emitEvent('new_message', payload.new)
  }

  // 处理消息更新
  private handleMessageUpdate(payload: any): void {
    logInfo('Message updated', { messageId: payload.new.id }, 'CommunityRealtimeService')
    this.emitEvent('message_updated', payload.new)
  }

  // 处理消息删除
  private handleMessageDelete(payload: any): void {
    logInfo('Message deleted', { messageId: payload.old.id }, 'CommunityRealtimeService')
    this.emitEvent('message_deleted', payload.old)
  }

  // 处理消息点赞
  private handleMessageLike(payload: any): void {
    logInfo('Message liked', { messageId: payload.new.message_id }, 'CommunityRealtimeService')
    this.emitEvent('message_liked', payload.new)
  }

  // 处理消息取消点赞
  private handleMessageUnlike(payload: any): void {
    logInfo('Message unliked', { messageId: payload.old.message_id }, 'CommunityRealtimeService')
    this.emitEvent('message_liked', { ...payload.old, action: 'unlike' })
  }

  // 处理新回复
  private handleNewReply(payload: any): void {
    logInfo('New reply received', { replyId: payload.new.id }, 'CommunityRealtimeService')
    this.emitEvent('new_reply', payload.new)
  }

  // 处理新通知
  private handleNewNotification(payload: any): void {
    logInfo('New notification received', { notificationId: payload.new.id }, 'CommunityRealtimeService')
    this.emitEvent('new_notification', payload.new)
  }

  // 处理连接状态
  private handleConnectionStatus(status: string): void {
    logInfo('Connection status changed', { status }, 'CommunityRealtimeService')
    
    if (status === 'SUBSCRIBED') {
      this.isConnected = true
      this.reconnectAttempts = 0
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      this.isConnected = false
      this.handleReconnect()
    }
  }

  // 处理重连
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      logWarn('Max reconnection attempts reached', { attempts: this.reconnectAttempts }, 'CommunityRealtimeService')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // 指数退避，最大30秒

    logInfo('Attempting to reconnect', { attempt: this.reconnectAttempts, delay }, 'CommunityRealtimeService')

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  // 启动心跳
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.channel) {
        // 发送心跳包
        this.channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { timestamp: Date.now() }
        })
      }
    }, this.config.heartbeatInterval)
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 获取连接状态
  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // 发送自定义事件
  sendCustomEvent(event: string, payload: any): void {
    if (this.isConnected && this.channel) {
      this.channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }
}

// 导出单例实例
export const communityRealtimeService = CommunityRealtimeService.getInstance()
