'use client'

/**
 * Storage Security Monitor
 * 存储安全监控组件，用于监控和管理本地存储的安全状态
 */

import { useState, useEffect } from 'react'
import { secureStorage, StorageDataType } from '@/lib/secureStorage'
import { storageMigration } from '@/lib/storageMigration'
import { Shield, AlertTriangle, CheckCircle, Database, Lock, Clock, Trash2 } from 'lucide-react'

interface StorageStats {
  totalItems: number
  totalSize: number
  expiredItems: number
  encryptedItems: number
  sensitiveItems: number
}

interface MigrationResult {
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
}

export default function StorageSecurityMonitor() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const storageStats = secureStorage.getStorageStats()
    setStats(storageStats)
  }

  const handleMigration = async () => {
    setIsMigrating(true)
    try {
      const result = await storageMigration.migrateAll()
      setMigrationResult(result)
      loadStats() // 重新加载统计信息
    } catch (error) {
      console.error('Migration failed:', error)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleCleanup = () => {
    // 清理过期数据
    secureStorage.clear()
    loadStats()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSecurityLevel = () => {
    if (!stats) return 'unknown'
    
    const encryptedRatio = stats.encryptedItems / stats.totalItems
    const sensitiveRatio = stats.sensitiveItems / stats.totalItems
    
    if (encryptedRatio > 0.8 && sensitiveRatio < 0.3) return 'high'
    if (encryptedRatio > 0.5 && sensitiveRatio < 0.5) return 'medium'
    return 'low'
  }

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'low': return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default: return <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  const securityLevel = getSecurityLevel()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          存储安全监控
        </h2>
        <div className="flex items-center space-x-2">
          {getSecurityIcon(securityLevel)}
          <span className={`font-medium ${getSecurityColor(securityLevel)}`}>
            安全级别: {securityLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">总项目</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">已加密</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.encryptedItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">敏感数据</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.sensitiveItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">已过期</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.expiredItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 存储大小 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">存储大小</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatBytes(stats.totalSize)}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleMigration}
          disabled={isMigrating}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMigrating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              迁移中...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              迁移到安全存储
            </>
          )}
        </button>

        <button
          onClick={handleCleanup}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清理过期数据
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showDetails ? '隐藏详情' : '显示详情'}
        </button>
      </div>

      {/* 迁移结果 */}
      {migrationResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            迁移完成
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">总计: </span>
              <span className="font-semibold">{migrationResult.total}</span>
            </div>
            <div>
              <span className="text-green-700 dark:text-green-300">已迁移: </span>
              <span className="font-semibold">{migrationResult.migrated}</span>
            </div>
            <div>
              <span className="text-yellow-700 dark:text-yellow-300">已跳过: </span>
              <span className="font-semibold">{migrationResult.skipped}</span>
            </div>
            <div>
              <span className="text-red-700 dark:text-red-300">错误: </span>
              <span className="font-semibold">{migrationResult.errors}</span>
            </div>
          </div>
        </div>
      )}

      {/* 详细信息 */}
      {showDetails && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            详细信息
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">加密比例:</span>
              <span className="font-medium">
                {((stats.encryptedItems / stats.totalItems) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">敏感数据比例:</span>
              <span className="font-medium">
                {((stats.sensitiveItems / stats.totalItems) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">过期数据比例:</span>
              <span className="font-medium">
                {((stats.expiredItems / stats.totalItems) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
