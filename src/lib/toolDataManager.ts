/**
 * 通用工具数据管理器
 * 为所有工具提供统一的数据存储、同步和管理功能
 */

import { userDataSync } from './userDataSync'
import { logInfo, logError } from './logger'

export interface ToolDataConfig {
  toolName: string
  dataKeys: readonly string[]
  encryption?: boolean
  autoSync?: boolean
  conflictResolution?: 'server' | 'client' | 'merge'
}

export class ToolDataManager {
  private config: ToolDataConfig
  private userId: string | null = null
  private data: Record<string, any> = {}
  private listeners: Set<(data: Record<string, any>) => void> = new Set()

  constructor(config: ToolDataConfig) {
    this.config = {
      encryption: true,
      autoSync: true,
      conflictResolution: 'server',
      ...config
    }
  }

  /**
   * 初始化工具数据管理器
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId
    await this.loadAllData()
  }

  /**
   * 加载所有工具数据
   */
  private async loadAllData(): Promise<void> {
    if (!this.userId) return

    try {
      logInfo('Loading tool data', { toolName: this.config.toolName, userId: this.userId }, 'ToolDataManager')

      for (const key of this.config.dataKeys) {
        const serverKey = `${this.config.toolName}_${key}`
        const serverData = await userDataSync.loadToolData(serverKey, this.userId)
        
        if (serverData) {
          this.data[key] = serverData
        } else {
          // 尝试从本地加载
          const localData = this.getLocalData(key)
          if (localData) {
            this.data[key] = localData
            // 同步到服务器
            if (this.config.autoSync) {
              await userDataSync.saveToolData(serverKey, this.userId, localData)
            }
          }
        }
      }

      this.notifyListeners()
      logInfo('Tool data loaded successfully', { toolName: this.config.toolName }, 'ToolDataManager')
    } catch (error) {
      logError('Error loading tool data', error, 'ToolDataManager')
    }
  }

  /**
   * 获取数据
   */
  getData<T = any>(key: string): T | null {
    return this.data[key] || null
  }

  /**
   * 设置数据
   */
  async setData(key: string, value: any): Promise<boolean> {
    if (!this.config.dataKeys.includes(key)) {
      logError('Invalid data key', { key, validKeys: Array.from(this.config.dataKeys) }, 'ToolDataManager')
      return false
    }

    try {
      this.data[key] = value
      this.notifyListeners()

      if (this.config.autoSync && this.userId) {
        const serverKey = `${this.config.toolName}_${key}`
        await userDataSync.saveToolData(serverKey, this.userId, value)
      }

      // 保存到本地
      this.saveLocalData(key, value)
      
      return true
    } catch (error) {
      logError('Error setting data', error, 'ToolDataManager')
      return false
    }
  }

  /**
   * 批量设置数据
   */
  async setMultipleData(data: Record<string, any>): Promise<boolean> {
    try {
      const promises: Promise<boolean>[] = []
      
      for (const [key, value] of Object.entries(data)) {
        if (this.config.dataKeys.includes(key)) {
          this.data[key] = value
          this.saveLocalData(key, value)
          
          if (this.config.autoSync && this.userId) {
            const serverKey = `${this.config.toolName}_${key}`
            promises.push(userDataSync.saveToolData(serverKey, this.userId, value))
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }

      this.notifyListeners()
      return true
    } catch (error) {
      logError('Error setting multiple data', error, 'ToolDataManager')
      return false
    }
  }

  /**
   * 获取所有数据
   */
  getAllData(): Record<string, any> {
    return { ...this.data }
  }

  /**
   * 清除数据
   */
  async clearData(key?: string): Promise<boolean> {
    try {
      if (key) {
        if (this.config.dataKeys.includes(key)) {
          delete this.data[key]
          this.clearLocalData(key)
          
          if (this.config.autoSync && this.userId) {
            const serverKey = `${this.config.toolName}_${key}`
            await userDataSync.saveToolData(serverKey, this.userId, null)
          }
        }
      } else {
        // 清除所有数据
        for (const dataKey of this.config.dataKeys) {
          delete this.data[dataKey]
          this.clearLocalData(dataKey)
          
          if (this.config.autoSync && this.userId) {
            const serverKey = `${this.config.toolName}_${dataKey}`
            await userDataSync.saveToolData(serverKey, this.userId, null)
          }
        }
      }

      this.notifyListeners()
      return true
    } catch (error) {
      logError('Error clearing data', error, 'ToolDataManager')
      return false
    }
  }

  /**
   * 手动同步数据
   */
  async syncData(): Promise<boolean> {
    if (!this.userId) return false

    try {
      logInfo('Manual sync started', { toolName: this.config.toolName }, 'ToolDataManager')
      
      for (const key of this.config.dataKeys) {
        const serverKey = `${this.config.toolName}_${key}`
        await userDataSync.saveToolData(serverKey, this.userId, this.data[key])
      }

      logInfo('Manual sync completed', { toolName: this.config.toolName }, 'ToolDataManager')
      return true
    } catch (error) {
      logError('Error during manual sync', error, 'ToolDataManager')
      return false
    }
  }

  /**
   * 添加数据变化监听器
   */
  addListener(listener: (data: Record<string, any>) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllData())
      } catch (error) {
        logError('Error in data listener', error, 'ToolDataManager')
      }
    })
  }

  /**
   * 获取本地数据
   */
  private getLocalData(key: string): any {
    try {
      const localKey = `${this.config.toolName}_${key}`
      const data = localStorage.getItem(localKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logError('Error getting local data', error, 'ToolDataManager')
      return null
    }
  }

  /**
   * 保存本地数据
   */
  private saveLocalData(key: string, value: any): void {
    try {
      const localKey = `${this.config.toolName}_${key}`
      localStorage.setItem(localKey, JSON.stringify(value))
    } catch (error) {
      logError('Error saving local data', error, 'ToolDataManager')
    }
  }

  /**
   * 清除本地数据
   */
  private clearLocalData(key: string): void {
    try {
      const localKey = `${this.config.toolName}_${key}`
      localStorage.removeItem(localKey)
    } catch (error) {
      logError('Error clearing local data', error, 'ToolDataManager')
    }
  }

  /**
   * 获取工具配置
   */
  getConfig(): ToolDataConfig {
    return { ...this.config }
  }

  /**
   * 更新工具配置
   */
  updateConfig(newConfig: Partial<ToolDataConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

/**
 * 创建工具数据管理器的工厂函数
 */
export function createToolDataManager(config: ToolDataConfig): ToolDataManager {
  return new ToolDataManager(config)
}

/**
 * 预定义的工具配置
 */
export const TOOL_CONFIGS = {
  DOMAIN_TRACKER: {
    toolName: 'domain_tracker',
    dataKeys: ['domains', 'transactions', 'stats', 'settings'],
    encryption: true,
    autoSync: true,
    conflictResolution: 'server' as const
  },
  CITY_PREFERENCES: {
    toolName: 'city_preferences',
    dataKeys: ['favorites', 'visited', 'wishlist', 'ratings'],
    encryption: false,
    autoSync: true,
    conflictResolution: 'merge' as const
  },
  TRAVEL_PLANNER: {
    toolName: 'travel_planner',
    dataKeys: ['trips', 'bookmarks', 'notes', 'budgets'],
    encryption: true,
    autoSync: true,
    conflictResolution: 'server' as const
  }
} as const
