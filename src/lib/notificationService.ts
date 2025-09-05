import { logInfo, logError } from './logger'

export interface NotificationData {
  id: string
  type: 'messages' | 'meetups' | 'nearby' | 'activities'
  title: string
  message: string
  data?: any
  timestamp: Date
  read: boolean
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
  }
  types: {
    messages: boolean
    meetups: boolean
    nearby: boolean
    activities: boolean
  }
}

class NotificationService {
  private settings: NotificationSettings
  private notifications: NotificationData[] = []
  private listeners: ((notification: NotificationData) => void)[] = []
  private permission: NotificationPermission = 'default'

  constructor() {
    this.settings = this.loadSettings()
    this.init()
  }

  private loadSettings(): NotificationSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings()
    }

    try {
      const saved = localStorage.getItem('nomad_notification_settings')
      return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings()
    } catch (error) {
      logError('Failed to load notification settings', error, 'notificationService')
      return this.getDefaultSettings()
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      sound: true,
      vibration: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      types: {
        messages: true,
        meetups: true,
        nearby: true,
        activities: true
      }
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('nomad_notification_settings', JSON.stringify(this.settings))
    } catch (error) {
      logError('Failed to save notification settings', error, 'notificationService')
    }
  }

  private async init() {
    if (typeof window === 'undefined') return

    try {
      // 请求通知权限
      if ('Notification' in window) {
        this.permission = await Notification.requestPermission()
        logInfo('Notification permission status', { permission: this.permission }, 'notificationService')
      }

      // 初始化推送通知
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.initPushNotifications()
      }
    } catch (error) {
      logError('Failed to initialize notification service', error, 'notificationService')
    }
  }

  private async initPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      logInfo('Service Worker registered', { registration }, 'notificationService')
    } catch (error) {
      logError('Failed to register service worker', error, 'notificationService')
    }
  }

  // 发送通知
  async sendNotification(
    type: NotificationData['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // 检查是否在免打扰时间
      if (this.isInQuietHours()) {
        logInfo('Notification suppressed during quiet hours', { type, title }, 'notificationService')
        return
      }

      // 检查通知类型是否启用
      if (!this.settings.types[type]) {
        logInfo('Notification type disabled', { type }, 'notificationService')
        return
      }

      const notification: NotificationData = {
        id: this.generateId(),
        type,
        title,
        message,
        data,
        timestamp: new Date(),
        read: false
      }

      // 添加到内部通知列表
      this.notifications.unshift(notification)
      this.notifications = this.notifications.slice(0, 100) // 保留最近100条

      // 触发监听器
      this.listeners.forEach(listener => listener(notification))

      // 发送浏览器通知
      if (this.settings.enabled && this.permission === 'granted') {
        await this.showBrowserNotification(notification)
      }

      // 播放声音
      if (this.settings.sound) {
        this.playNotificationSound()
      }

      // 震动
      if (this.settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(200)
      }

      logInfo('Notification sent', { type, title }, 'notificationService')
    } catch (error) {
      logError('Failed to send notification', error, 'notificationService')
    }
  }

  private async showBrowserNotification(notification: NotificationData) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        data: notification.data,
        requireInteraction: false,
        silent: !this.settings.sound
      })

      // 自动关闭通知
      setTimeout(() => {
        browserNotification.close()
      }, 5000)

      // 点击通知的处理
      browserNotification.onclick = () => {
        this.markAsRead(notification.id)
        browserNotification.close()
        
        // 根据通知类型执行相应操作
        this.handleNotificationClick(notification)
      }
    } catch (error) {
      logError('Failed to show browser notification', error, 'notificationService')
    }
  }

  private handleNotificationClick(notification: NotificationData) {
    switch (notification.type) {
      case 'messages':
        // 打开聊天界面
        window.focus()
        break
      case 'meetups':
        // 打开聚会详情
        window.focus()
        break
      case 'nearby':
        // 打开地图视图
        window.focus()
        break
      case 'activities':
        // 打开活动详情
        window.focus()
        break
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(error => {
        logError('Failed to play notification sound', error, 'notificationService')
      })
    } catch (error) {
      logError('Failed to create notification audio', error, 'notificationService')
    }
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const start = this.settings.quietHours.start
    const end = this.settings.quietHours.end

    if (start <= end) {
      return currentTime >= start && currentTime <= end
    } else {
      // 跨夜的情况
      return currentTime >= start || currentTime <= end
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 公共方法

  // 获取通知列表
  getNotifications(): NotificationData[] {
    return [...this.notifications]
  }

  // 获取未读通知数量
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // 标记通知为已读
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // 标记所有通知为已读
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
  }

  // 删除通知
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
  }

  // 清空所有通知
  clearAllNotifications(): void {
    this.notifications = []
  }

  // 获取通知设置
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  // 更新通知设置
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  // 添加通知监听器
  addListener(listener: (notification: NotificationData) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // 请求通知权限
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    try {
      this.permission = await Notification.requestPermission()
      return this.permission
    } catch (error) {
      logError('Failed to request notification permission', error, 'notificationService')
      return 'denied'
    }
  }

  // 检查通知权限
  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  // 发送特定类型的通知
  async sendMessageNotification(senderName: string, message: string): Promise<void> {
    await this.sendNotification(
      'messages',
      `新消息来自 ${senderName}`,
      message,
      { senderName, message }
    )
  }

  async sendMeetupNotification(inviterName: string, location: string): Promise<void> {
    await this.sendNotification(
      'meetups',
      `${inviterName} 邀请你聚会`,
      `地点: ${location}`,
      { inviterName, location }
    )
  }

  async sendNearbyNotification(userName: string, distance: number): Promise<void> {
    await this.sendNotification(
      'nearby',
      `附近有新游民`,
      `${userName} 在 ${distance.toFixed(1)}km 范围内`,
      { userName, distance }
    )
  }

  async sendActivityNotification(activityName: string, location: string): Promise<void> {
    await this.sendNotification(
      'activities',
      `新活动: ${activityName}`,
      `地点: ${location}`,
      { activityName, location }
    )
  }
}

// 创建单例实例
export const notificationService = new NotificationService()

// 导出便捷方法
export const sendNotification = notificationService.sendNotification.bind(notificationService)
export const getNotifications = notificationService.getNotifications.bind(notificationService)
export const getUnreadCount = notificationService.getUnreadCount.bind(notificationService)
export const markAsRead = notificationService.markAsRead.bind(notificationService)
export const markAllAsRead = notificationService.markAllAsRead.bind(notificationService)
export const getSettings = notificationService.getSettings.bind(notificationService)
export const updateSettings = notificationService.updateSettings.bind(notificationService)
export const requestPermission = notificationService.requestPermission.bind(notificationService)
