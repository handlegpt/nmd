// 使用原生 EventSource，如果需要 polyfill 则动态导入
let EventSourceClass: any = null

// 只在客户端环境下初始化 EventSource
if (typeof window !== 'undefined') {
  EventSourceClass = window.EventSource
  
  // 如果需要 polyfill 则动态导入
  if (!EventSourceClass) {
    import('event-source-polyfill').then(module => {
      EventSourceClass = module.EventSourcePolyfill
    })
  }
}

export interface RealtimeUpdate {
  type: 'review' | 'photo' | 'vote' | 'favorite'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: string
  userId?: string
}

export interface RealtimeConfig {
  cityId?: string
  userId?: string
  enableNotifications?: boolean
}

class RealtimeUpdateService {
  private eventSource: any = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(update: RealtimeUpdate) => void>> = new Map()
  private isConnected = false
  private config: RealtimeConfig = {}

  constructor() {
    // 在客户端环境下初始化
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
    }
  }

  private setupEventListeners() {
    // 页面可见性变化时重新连接
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isConnected) {
        this.connect()
      } else if (document.visibilityState === 'hidden') {
        this.disconnect()
      }
    })

    // 网络状态变化时重新连接
    window.addEventListener('online', () => {
      if (!this.isConnected) {
        this.connect()
      }
    })

    window.addEventListener('offline', () => {
      this.disconnect()
    })
  }

  connect(config: RealtimeConfig = {}) {
    // 只在客户端环境下连接
    if (typeof window === 'undefined' || !EventSourceClass) {
      console.log('🟡 Realtime service not available in server environment')
      return
    }

    if (this.isConnected) {
      this.disconnect()
    }

    this.config = { ...this.config, ...config }
    
    try {
      // 创建EventSource连接
      const params = new URLSearchParams()
      if (this.config.cityId) params.append('cityId', this.config.cityId)
      if (this.config.userId) params.append('userId', this.config.userId)
      
      const url = `/api/realtime?${params.toString()}`
      
      this.eventSource = new EventSourceClass(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        heartbeatTimeout: 30000,
        withCredentials: true
      })

      this.eventSource.onopen = () => {
        console.log('🟢 Realtime connection established')
        this.isConnected = true
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data)
          this.handleUpdate(update)
        } catch (error) {
          console.error('Error parsing realtime update:', error)
        }
      }

      this.eventSource.onerror = (error: Event) => {
        console.error('🔴 Realtime connection error:', error)
        this.isConnected = false
        this.handleReconnect()
      }

      this.eventSource.addEventListener('ping', () => {
        // 心跳检测
        this.eventSource?.dispatchEvent(new MessageEvent('pong'))
      })

    } catch (error) {
      console.error('Failed to establish realtime connection:', error)
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect(this.config)
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.isConnected = false
    console.log('🔌 Realtime connection closed')
  }

  private handleUpdate(update: RealtimeUpdate) {
    console.log('📡 Received realtime update:', update)
    
    // 通知所有监听器
    this.listeners.forEach((listeners, type) => {
      if (type === 'all' || type === update.type) {
        listeners.forEach(listener => {
          try {
            listener(update)
          } catch (error) {
            console.error('Error in realtime listener:', error)
          }
        })
      }
    })

    // 显示通知（如果启用）
    if (this.config.enableNotifications) {
      this.showNotification(update)
    }
  }

  private showNotification(update: RealtimeUpdate) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    let title = '实时更新'
    let body = ''

    switch (update.type) {
      case 'review':
        title = '新评论'
        body = `${update.data.userName} 对 ${update.data.cityName} 发表了新评论`
        break
      case 'photo':
        title = '新照片'
        body = `${update.data.photographer} 上传了 ${update.data.cityName} 的新照片`
        break
      case 'vote':
        title = '新投票'
        body = `有人对 ${update.data.cityName} 进行了投票`
        break
      case 'favorite':
        title = '新收藏'
        body = `${update.data.userName} 收藏了 ${update.data.cityName}`
        break
    }

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `realtime-${update.type}-${update.data.id}`
    })
  }

  // 订阅特定类型的更新
  subscribe(type: string | 'all', callback: (update: RealtimeUpdate) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(type)
        }
      }
    }
  }

  // 发布更新（模拟其他用户的操作）
  publish(update: Omit<RealtimeUpdate, 'timestamp'>) {
    const fullUpdate: RealtimeUpdate = {
      ...update,
      timestamp: new Date().toISOString()
    }

    // 发送到服务器
    this.sendToServer(fullUpdate)
    
    // 本地处理
    this.handleUpdate(fullUpdate)
  }

  private async sendToServer(update: RealtimeUpdate) {
    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update)
      })
    } catch (error) {
      console.error('Failed to send update to server:', error)
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    }
  }

  // 请求通知权限
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        this.config.enableNotifications = true
        console.log('✅ Notification permission granted')
      }
    }
  }
}

// 创建单例实例
const realtimeService = new RealtimeUpdateService()

export default realtimeService
