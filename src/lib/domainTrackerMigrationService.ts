import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface DomainTrackerData {
  domains: any[]
  transactions: any[]
  stats: any
}

export interface DomainTrackerMigrationResult {
  success: boolean
  domainsMigrated: number
  transactionsMigrated: number
  statsMigrated: boolean
  errors: string[]
}

class DomainTrackerMigrationService {
  /**
   * 从 localStorage 获取域名追踪器数据
   */
  private getLocalStorageData(): DomainTrackerData {
    try {
      const domains = localStorage.getItem('domainTracker_domains')
      const transactions = localStorage.getItem('domainTracker_transactions')
      const stats = localStorage.getItem('domainTracker_stats')

      return {
        domains: domains ? JSON.parse(domains) : [],
        transactions: transactions ? JSON.parse(transactions) : [],
        stats: stats ? JSON.parse(stats) : {}
      }
    } catch (error) {
      logError('Error reading domain tracker data from localStorage', error, 'DomainTrackerMigrationService')
      return {
        domains: [],
        transactions: [],
        stats: {}
      }
    }
  }

  /**
   * 迁移域名追踪器数据到数据库
   */
  async migrateDomainTrackerData(userId: string): Promise<DomainTrackerMigrationResult> {
    const result: DomainTrackerMigrationResult = {
      success: false,
      domainsMigrated: 0,
      transactionsMigrated: 0,
      statsMigrated: false,
      errors: []
    }

    try {
      // 获取 localStorage 数据
      const localData = this.getLocalStorageData()

      if (localData.domains.length === 0 && localData.transactions.length === 0 && Object.keys(localData.stats).length === 0) {
        result.errors.push('No domain tracker data found in localStorage')
        return result
      }

      // 准备要存储的数据
      const toolData = {
        domains: localData.domains,
        transactions: localData.transactions,
        stats: localData.stats,
        migrated_at: new Date().toISOString(),
        migration_version: '1.0'
      }

      // 保存到数据库
      const { error } = await supabase
        .from('user_tool_data')
        .upsert({
          user_id: userId,
          tool_name: 'domain_tracker',
          data: toolData,
          version: 1
        })

      if (error) {
        result.errors.push(`Database error: ${error.message}`)
        return result
      }

      // 更新结果
      result.success = true
      result.domainsMigrated = localData.domains.length
      result.transactionsMigrated = localData.transactions.length
      result.statsMigrated = Object.keys(localData.stats).length > 0

      logInfo('Domain tracker data migrated successfully', {
        userId,
        domainsCount: result.domainsMigrated,
        transactionsCount: result.transactionsMigrated,
        statsMigrated: result.statsMigrated
      }, 'DomainTrackerMigrationService')

      return result
    } catch (error) {
      result.errors.push(`Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logError('Error migrating domain tracker data', error, 'DomainTrackerMigrationService')
      return result
    }
  }

  /**
   * 从数据库获取域名追踪器数据
   */
  async getDomainTrackerData(userId: string): Promise<DomainTrackerData | null> {
    try {
      const { data, error } = await supabase
        .from('user_tool_data')
        .select('data')
        .eq('user_id', userId)
        .eq('tool_name', 'domain_tracker')
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null
        }
        logError('Error fetching domain tracker data', error, 'DomainTrackerMigrationService')
        return null
      }

      return data.data as DomainTrackerData
    } catch (error) {
      logError('Error fetching domain tracker data', error, 'DomainTrackerMigrationService')
      return null
    }
  }

  /**
   * 保存域名追踪器数据到数据库
   */
  async saveDomainTrackerData(userId: string, data: DomainTrackerData): Promise<boolean> {
    try {
      const toolData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_tool_data')
        .upsert({
          user_id: userId,
          tool_name: 'domain_tracker',
          data: toolData,
          version: 1
        })

      if (error) {
        logError('Error saving domain tracker data', error, 'DomainTrackerMigrationService')
        return false
      }

      logInfo('Domain tracker data saved successfully', { userId }, 'DomainTrackerMigrationService')
      return true
    } catch (error) {
      logError('Error saving domain tracker data', error, 'DomainTrackerMigrationService')
      return false
    }
  }

  /**
   * 清理 localStorage 中的域名追踪器数据
   */
  async cleanupLocalStorageData(): Promise<boolean> {
    try {
      localStorage.removeItem('domainTracker_domains')
      localStorage.removeItem('domainTracker_transactions')
      localStorage.removeItem('domainTracker_stats')

      logInfo('Domain tracker localStorage data cleaned up successfully', {}, 'DomainTrackerMigrationService')
      return true
    } catch (error) {
      logError('Error cleaning up domain tracker localStorage data', error, 'DomainTrackerMigrationService')
      return false
    }
  }

  /**
   * 检查是否有需要迁移的数据
   */
  hasDataToMigrate(): boolean {
    try {
      const domains = localStorage.getItem('domainTracker_domains')
      const transactions = localStorage.getItem('domainTracker_transactions')
      const stats = localStorage.getItem('domainTracker_stats')

      return !!(domains || transactions || stats)
    } catch (error) {
      logError('Error checking for domain tracker data to migrate', error, 'DomainTrackerMigrationService')
      return false
    }
  }

  /**
   * 获取迁移状态
   */
  async getMigrationStatus(userId: string): Promise<{
    hasLocalData: boolean
    hasDatabaseData: boolean
    needsMigration: boolean
  }> {
    try {
      const hasLocalData = this.hasDataToMigrate()
      const databaseData = await this.getDomainTrackerData(userId)
      const hasDatabaseData = !!databaseData

      return {
        hasLocalData,
        hasDatabaseData,
        needsMigration: hasLocalData && !hasDatabaseData
      }
    } catch (error) {
      logError('Error getting migration status', error, 'DomainTrackerMigrationService')
      return {
        hasLocalData: false,
        hasDatabaseData: false,
        needsMigration: false
      }
    }
  }
}

export const domainTrackerMigrationService = new DomainTrackerMigrationService()
