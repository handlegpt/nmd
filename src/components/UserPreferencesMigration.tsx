'use client'

import React, { useState, useEffect } from 'react'
import { userPreferencesMigration, MigrationResult } from '@/lib/migrateUserPreferences'
import { useAuth } from '@/contexts/AuthContext'
import { logInfo, logError } from '@/lib/logger'

interface MigrationStats {
  hasLocalData: boolean
  localFavoritesCount: number
  localHiddenUsersCount: number
  lastModified?: number
}

export default function UserPreferencesMigration() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MigrationStats>({
    hasLocalData: false,
    localFavoritesCount: 0,
    localHiddenUsersCount: 0
  })
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [showMigration, setShowMigration] = useState(false)

  useEffect(() => {
    // 检查是否有需要迁移的数据
    const migrationStats = userPreferencesMigration.getMigrationStats()
    setStats(migrationStats)
    setShowMigration(migrationStats.hasLocalData)
  }, [])

  const handleMigrate = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const result = await userPreferencesMigration.migrateCurrentUser()
      setMigrationResult(result)

      if (result.success) {
        // 更新统计信息
        const newStats = userPreferencesMigration.getMigrationStats()
        setStats(newStats)
        setShowMigration(newStats.hasLocalData)
      }
    } catch (error) {
      logError('Migration failed', error, 'UserPreferencesMigration')
      setMigrationResult({
        success: false,
        migrated: { favorites: 0, hiddenUsers: 0, totalUsers: 0 },
        errors: ['迁移过程中发生错误']
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleCleanup = async () => {
    if (!migrationResult?.success) {
      alert('请先完成数据迁移')
      return
    }

    const confirmed = confirm('确定要清理本地存储的数据吗？此操作不可撤销。')
    if (!confirmed) return

    try {
      const success = await userPreferencesMigration.cleanupLocalStorage()
      if (success) {
        setShowMigration(false)
        setStats({
          hasLocalData: false,
          localFavoritesCount: 0,
          localHiddenUsersCount: 0
        })
        alert('本地数据已清理完成')
      } else {
        alert('清理失败，请重试')
      }
    } catch (error) {
      logError('Cleanup failed', error, 'UserPreferencesMigration')
      alert('清理过程中发生错误')
    }
  }

  const handleDismiss = () => {
    setShowMigration(false)
  }

  if (!showMigration || !user) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            数据迁移提醒
          </h3>
          <p className="text-blue-800 mb-3">
            检测到您的本地存储中有用户偏好数据，建议迁移到云端以确保数据安全。
          </p>
          
          <div className="text-sm text-blue-700 mb-3">
            <p>本地数据统计：</p>
            <ul className="list-disc list-inside ml-4">
              <li>收藏用户：{stats.localFavoritesCount} 个</li>
              <li>隐藏用户：{stats.localHiddenUsersCount} 个</li>
            </ul>
          </div>

          {migrationResult && (
            <div className={`p-3 rounded-md mb-3 ${
              migrationResult.success 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-red-100 border border-red-200'
            }`}>
              <h4 className={`font-medium ${
                migrationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {migrationResult.success ? '迁移成功' : '迁移失败'}
              </h4>
              
              {migrationResult.success && (
                <div className="text-green-700 text-sm mt-1">
                  <p>已迁移：</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>收藏用户：{migrationResult.migrated.favorites} 个</li>
                    <li>隐藏用户：{migrationResult.migrated.hiddenUsers} 个</li>
                  </ul>
                </div>
              )}
              
              {migrationResult.errors.length > 0 && (
                <div className="text-red-700 text-sm mt-1">
                  <p>错误信息：</p>
                  <ul className="list-disc list-inside ml-4">
                    {migrationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {!migrationResult?.success && (
              <button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMigrating ? '迁移中...' : '开始迁移'}
              </button>
            )}
            
            {migrationResult?.success && (
              <button
                onClick={handleCleanup}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                清理本地数据
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              稍后处理
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
