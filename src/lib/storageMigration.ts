/**
 * Storage Migration Tool
 * 存储迁移工具，将现有的localStorage使用迁移到安全存储
 */

import { secureStorage, StorageDataType } from './secureStorage'

// 存储项映射配置
interface StorageMapping {
  key: string
  type: StorageDataType
  expirationHours?: number
  migrate: boolean
}

// 预定义的存储项映射
const STORAGE_MAPPINGS: StorageMapping[] = [
  // 用户相关数据 - 敏感
  { key: 'user_profile_details', type: StorageDataType.SENSITIVE, expirationHours: 24, migrate: true },
  { key: 'session_token', type: StorageDataType.CONFIDENTIAL, expirationHours: 8, migrate: true },
  { key: 'login_email', type: StorageDataType.SENSITIVE, expirationHours: 24, migrate: true },
  
  // 应用设置 - 内部
  { key: 'theme', type: StorageDataType.INTERNAL, expirationHours: 168, migrate: true }, // 7天
  { key: 'language', type: StorageDataType.INTERNAL, expirationHours: 168, migrate: true },
  { key: 'locale', type: StorageDataType.INTERNAL, expirationHours: 168, migrate: true },
  
  // 缓存数据 - 公开
  { key: 'cache_', type: StorageDataType.PUBLIC, expirationHours: 1, migrate: true },
  { key: 'places_', type: StorageDataType.PUBLIC, expirationHours: 6, migrate: true },
  { key: 'ratings_', type: StorageDataType.INTERNAL, expirationHours: 24, migrate: true },
  { key: 'reviews_', type: StorageDataType.INTERNAL, expirationHours: 24, migrate: true },
  
  // 临时数据 - 不迁移
  { key: 'temp_', type: StorageDataType.PUBLIC, migrate: false },
  { key: 'debug_', type: StorageDataType.PUBLIC, migrate: false },
]

/**
 * 存储迁移服务
 */
export class StorageMigrationService {
  private migrationLog: Array<{
    key: string
    action: 'migrated' | 'skipped' | 'error'
    reason?: string
    timestamp: number
  }> = []

  /**
   * 检查键名是否匹配映射规则
   */
  private matchesMapping(key: string, mapping: StorageMapping): boolean {
    if (mapping.key.endsWith('_')) {
      return key.startsWith(mapping.key)
    }
    return key === mapping.key
  }

  /**
   * 获取键名对应的存储类型
   */
  private getStorageType(key: string): StorageDataType {
    const mapping = STORAGE_MAPPINGS.find(m => this.matchesMapping(key, m))
    return mapping?.type || StorageDataType.INTERNAL
  }

  /**
   * 检查是否应该迁移
   */
  private shouldMigrate(key: string): boolean {
    const mapping = STORAGE_MAPPINGS.find(m => this.matchesMapping(key, m))
    return mapping?.migrate ?? true
  }

  /**
   * 获取过期时间
   */
  private getExpirationHours(key: string): number | undefined {
    const mapping = STORAGE_MAPPINGS.find(m => this.matchesMapping(key, m))
    return mapping?.expirationHours
  }

  /**
   * 迁移单个存储项
   */
  private async migrateItem(key: string): Promise<boolean> {
    try {
      // 检查是否应该迁移
      if (!this.shouldMigrate(key)) {
        this.migrationLog.push({
          key,
          action: 'skipped',
          reason: 'Not configured for migration',
          timestamp: Date.now()
        })
        return true
      }

      // 获取原始数据
      const originalData = localStorage.getItem(key)
      if (!originalData) {
        this.migrationLog.push({
          key,
          action: 'skipped',
          reason: 'No data found',
          timestamp: Date.now()
        })
        return true
      }

      // 解析数据
      let parsedData: any
      try {
        parsedData = JSON.parse(originalData)
      } catch {
        parsedData = originalData
      }

      // 获取存储配置
      const type = this.getStorageType(key)
      const expirationHours = this.getExpirationHours(key)

      // 迁移到安全存储
      const success = await secureStorage.setItem(key, parsedData, type, expirationHours)
      
      if (success) {
        // 迁移成功后删除原始数据
        localStorage.removeItem(key)
        this.migrationLog.push({
          key,
          action: 'migrated',
          timestamp: Date.now()
        })
        return true
      } else {
        this.migrationLog.push({
          key,
          action: 'error',
          reason: 'Failed to store in secure storage',
          timestamp: Date.now()
        })
        return false
      }
    } catch (error) {
      this.migrationLog.push({
        key,
        action: 'error',
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      })
      return false
    }
  }

  /**
   * 执行完整迁移
   */
  async migrateAll(): Promise<{
    total: number
    migrated: number
    skipped: number
    errors: number
    log: Array<{
      key: string
      action: 'migrated' | 'skipped' | 'error'
      reason?: string
      timestamp: number
    }>
  }> {
    this.migrationLog = []
    
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const key of keys) {
      const result = await this.migrateItem(key)
      if (result) {
        const logEntry = this.migrationLog[this.migrationLog.length - 1]
        if (logEntry.action === 'migrated') {
          migrated++
        } else {
          skipped++
        }
      } else {
        errors++
      }
    }

    return {
      total: keys.length,
      migrated,
      skipped,
      errors,
      log: this.migrationLog
    }
  }

  /**
   * 获取迁移报告
   */
  getMigrationReport(): string {
    const stats = this.migrationLog.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return `
# 🔄 存储迁移报告

## 📊 迁移统计
- **总计**: ${this.migrationLog.length}
- **已迁移**: ${stats.migrated || 0}
- **已跳过**: ${stats.skipped || 0}
- **错误**: ${stats.error || 0}

## 📋 详细日志
${this.migrationLog.map(entry => `
### ${entry.key}
- **操作**: ${entry.action}
- **时间**: ${new Date(entry.timestamp).toISOString()}
${entry.reason ? `- **原因**: ${entry.reason}` : ''}
`).join('\n')}

---
生成时间: ${new Date().toISOString()}
    `
  }
}

// 创建全局迁移服务实例
export const storageMigration = new StorageMigrationService()

// 便捷方法
export const migrateStorage = () => storageMigration.migrateAll()
export const getMigrationReport = () => storageMigration.getMigrationReport()
