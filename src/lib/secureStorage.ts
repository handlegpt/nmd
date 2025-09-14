/**
 * Secure Storage Service
 * 安全存储服务，提供加密、验证和过期机制的本地存储
 */

import { encryptData, decryptData } from './encryption'

// 存储数据类型枚举
export enum StorageDataType {
  PUBLIC = 'public',      // 公开数据，无需加密
  INTERNAL = 'internal',  // 内部数据，需要验证
  SENSITIVE = 'sensitive', // 敏感数据，需要加密
  CONFIDENTIAL = 'confidential' // 机密数据，需要强加密
}

// 存储项接口
interface StorageItem<T = any> {
  data: T
  type: StorageDataType
  encrypted: boolean
  timestamp: number
  expiresAt?: number
  checksum: string
  version: string
}

// 存储配置接口
interface StorageConfig {
  encryptSensitive: boolean
  validateIntegrity: boolean
  enableExpiration: boolean
  defaultExpirationHours: number
  maxStorageSize: number
  enableCompression: boolean
}

// 默认配置
const DEFAULT_CONFIG: StorageConfig = {
  encryptSensitive: true,
  validateIntegrity: true,
  enableExpiration: true,
  defaultExpirationHours: 24,
  maxStorageSize: 5 * 1024 * 1024, // 5MB
  enableCompression: false
}

/**
 * 安全存储服务类
 */
export class SecureStorageService {
  private config: StorageConfig
  private storage: Storage
  private encryptionKey: string

  constructor(config: Partial<StorageConfig> = {}, useSessionStorage: boolean = false) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.storage = useSessionStorage ? sessionStorage : localStorage
    this.encryptionKey = this.generateEncryptionKey()
    
    // 初始化时清理过期数据
    this.cleanupExpiredItems()
  }

  /**
   * 生成加密密钥
   */
  private generateEncryptionKey(): string {
    // 使用用户代理和当前域名生成唯一密钥
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const timestamp = Date.now().toString()
    
    return btoa(`${userAgent}-${domain}-${timestamp}`).substring(0, 32)
  }

  /**
   * 计算数据校验和
   */
  private calculateChecksum(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(16)
  }

  /**
   * 验证数据完整性
   */
  private validateIntegrity(item: StorageItem, originalData: string): boolean {
    if (!this.config.validateIntegrity) return true
    
    const expectedChecksum = this.calculateChecksum(originalData)
    return item.checksum === expectedChecksum
  }

  /**
   * 检查存储项是否过期
   */
  private isExpired(item: StorageItem): boolean {
    if (!this.config.enableExpiration || !item.expiresAt) return false
    return Date.now() > item.expiresAt
  }

  /**
   * 检查存储空间
   */
  private checkStorageSpace(): boolean {
    try {
      const testKey = '__storage_test__'
      const testData = 'x'.repeat(1024) // 1KB测试数据
      
      this.storage.setItem(testKey, testData)
      this.storage.removeItem(testKey)
      
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 清理过期数据
   */
  private cleanupExpiredItems(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (!key) continue
      
      try {
        const itemStr = this.storage.getItem(key)
        if (!itemStr) continue
        
        const item: StorageItem = JSON.parse(itemStr)
        if (this.isExpired(item)) {
          keysToRemove.push(key)
        }
      } catch (error) {
        // 如果解析失败，可能是旧格式数据，也删除
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => this.storage.removeItem(key))
  }

  /**
   * 安全存储数据
   */
  async setItem<T>(
    key: string, 
    data: T, 
    type: StorageDataType = StorageDataType.INTERNAL,
    expirationHours?: number
  ): Promise<boolean> {
    try {
      // 检查存储空间
      if (!this.checkStorageSpace()) {
        console.warn('Storage space is full, cleaning up...')
        this.cleanupExpiredItems()
        if (!this.checkStorageSpace()) {
          throw new Error('Storage space is full')
        }
      }

      const dataStr = JSON.stringify(data)
      const checksum = this.calculateChecksum(dataStr)
      
      // 计算过期时间
      const expiresAt = expirationHours 
        ? Date.now() + (expirationHours * 60 * 60 * 1000)
        : this.config.enableExpiration 
          ? Date.now() + (this.config.defaultExpirationHours * 60 * 60 * 1000)
          : undefined

      // 创建存储项
      const item: StorageItem<T> = {
        data,
        type,
        encrypted: false,
        timestamp: Date.now(),
        expiresAt,
        checksum,
        version: '1.0'
      }

      // 根据数据类型决定是否加密
      if (type === StorageDataType.SENSITIVE || type === StorageDataType.CONFIDENTIAL) {
        if (this.config.encryptSensitive) {
          item.data = encryptData(dataStr) as any
          item.encrypted = true
        }
      }

      // 存储到localStorage
      this.storage.setItem(key, JSON.stringify(item))
      
      return true
    } catch (error) {
      console.error('Failed to store data securely:', error)
      return false
    }
  }

  /**
   * 安全获取数据
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const itemStr = this.storage.getItem(key)
      if (!itemStr) return null

      const item: StorageItem<T> = JSON.parse(itemStr)
      
      // 检查是否过期
      if (this.isExpired(item)) {
        this.storage.removeItem(key)
        return null
      }

      // 解密数据
      let data = item.data
      if (item.encrypted) {
        const decryptedData = decryptData<string>(data as string)
        if (!decryptedData) {
          console.error('Failed to decrypt data')
          return null
        }
        data = JSON.parse(decryptedData)
      }

      // 验证数据完整性
      const dataStr = JSON.stringify(data)
      if (!this.validateIntegrity(item, dataStr)) {
        console.error('Data integrity check failed')
        this.storage.removeItem(key)
        return null
      }

      return data
    } catch (error) {
      console.error('Failed to retrieve data securely:', error)
      return null
    }
  }

  /**
   * 删除存储项
   */
  removeItem(key: string): boolean {
    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove item:', error)
      return false
    }
  }

  /**
   * 清空所有存储
   */
  clear(): boolean {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats(): {
    totalItems: number
    totalSize: number
    expiredItems: number
    encryptedItems: number
    sensitiveItems: number
  } {
    let totalItems = 0
    let totalSize = 0
    let expiredItems = 0
    let encryptedItems = 0
    let sensitiveItems = 0

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (!key) continue

      try {
        const itemStr = this.storage.getItem(key)
        if (!itemStr) continue

        totalItems++
        totalSize += itemStr.length

        const item: StorageItem = JSON.parse(itemStr)
        
        if (this.isExpired(item)) {
          expiredItems++
        }
        
        if (item.encrypted) {
          encryptedItems++
        }
        
        if (item.type === StorageDataType.SENSITIVE || item.type === StorageDataType.CONFIDENTIAL) {
          sensitiveItems++
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    return {
      totalItems,
      totalSize,
      expiredItems,
      encryptedItems,
      sensitiveItems
    }
  }

  /**
   * 导出存储数据（用于备份）
   */
  exportData(): string {
    const exportData: Record<string, any> = {}
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (!key) continue
      
      try {
        const itemStr = this.storage.getItem(key)
        if (itemStr) {
          exportData[key] = JSON.parse(itemStr)
        }
      } catch (error) {
        // 忽略解析错误
      }
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导入存储数据（用于恢复）
   */
  async importData(dataStr: string): Promise<boolean> {
    try {
      const importData = JSON.parse(dataStr)
      
      for (const [key, value] of Object.entries(importData)) {
        this.storage.setItem(key, JSON.stringify(value))
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
}

// 创建默认实例
export const secureStorage = new SecureStorageService()
export const secureSessionStorage = new SecureStorageService({}, true)

// 便捷方法
export const secureSetItem = <T>(
  key: string, 
  data: T, 
  type: StorageDataType = StorageDataType.INTERNAL,
  expirationHours?: number
) => secureStorage.setItem(key, data, type, expirationHours)

export const secureGetItem = <T>(key: string) => secureStorage.getItem<T>(key)
export const secureRemoveItem = (key: string) => secureStorage.removeItem(key)
export const secureClear = () => secureStorage.clear()

// 导出类型
export type { StorageItem, StorageConfig }
