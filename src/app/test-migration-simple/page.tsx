'use client'

import React, { useState } from 'react'
import { singleUserMigration } from '@/lib/singleUserMigration'
import { useUser } from '@/contexts/GlobalStateContext'

export default function TestMigrationSimplePage() {
  const { user } = useUser()
  const [testData, setTestData] = useState({
    favorites: ['test-user-1', 'test-user-2'],
    hiddenUsers: ['test-user-3']
  })
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 添加测试数据到 localStorage
  const addTestData = () => {
    localStorage.setItem('nomadFavorites', JSON.stringify(testData.favorites))
    localStorage.setItem('hidden_nomad_users', JSON.stringify(testData.hiddenUsers))
    alert('测试数据已添加到 localStorage！')
  }

  // 清理测试数据
  const clearTestData = () => {
    localStorage.removeItem('nomadFavorites')
    localStorage.removeItem('hidden_nomad_users')
    alert('测试数据已清理！')
  }

  // 执行迁移
  const handleMigration = async () => {
    if (!user?.profile?.id) {
      alert('请先登录')
      return
    }

    setIsLoading(true)
    try {
      const result = await singleUserMigration.migrateUser(user.profile.id)
      setMigrationResult(result)
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationResult({ success: false, errors: ['Migration failed'] })
    } finally {
      setIsLoading(false)
    }
  }

  // 验证迁移结果
  const handleVerify = async () => {
    if (!user?.profile?.id) {
      alert('请先登录')
      return
    }

    try {
      const verification = await singleUserMigration.verifyMigration(user.profile.id)
      alert(`验证结果: ${verification.matches ? '成功' : '失败'}\n数据库数据: ${JSON.stringify(verification.databaseData)}\n本地数据: ${JSON.stringify(verification.localData)}`)
    } catch (error) {
      alert('验证失败')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">简单迁移测试</h1>
      
      <div className="grid gap-6">
        {/* 用户信息 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          <p><strong>用户ID:</strong> {user?.profile?.id || '未登录'}</p>
          <p><strong>登录状态:</strong> {user?.isAuthenticated ? '已登录' : '未登录'}</p>
        </div>

        {/* 测试数据控制 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">测试数据控制</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">收藏用户:</label>
              <input
                type="text"
                value={testData.favorites.join(', ')}
                onChange={(e) => setTestData({
                  ...testData,
                  favorites: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="user1, user2, user3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">隐藏用户:</label>
              <input
                type="text"
                value={testData.hiddenUsers.join(', ')}
                onChange={(e) => setTestData({
                  ...testData,
                  hiddenUsers: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="user4, user5"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTestData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加测试数据到 localStorage
              </button>
              <button
                onClick={clearTestData}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                清理测试数据
              </button>
            </div>
          </div>
        </div>

        {/* 迁移操作 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">迁移操作</h2>
          <div className="flex gap-2">
            <button
              onClick={handleMigration}
              disabled={isLoading || !user?.profile?.id}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '迁移中...' : '执行迁移'}
            </button>
            <button
              onClick={handleVerify}
              disabled={!user?.profile?.id}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              验证迁移结果
            </button>
          </div>
        </div>

        {/* 迁移结果 */}
        {migrationResult && (
          <div className={`p-6 rounded-lg shadow ${
            migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">
              迁移结果: {migrationResult.success ? '成功' : '失败'}
            </h2>
            
            {migrationResult.success && (
              <div className="space-y-2">
                <p><strong>迁移的收藏用户:</strong> {migrationResult.migrated.favorites} 个</p>
                <p><strong>迁移的隐藏用户:</strong> {migrationResult.migrated.hiddenUsers} 个</p>
              </div>
            )}
            
            {migrationResult.errors && migrationResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-800">错误信息:</h3>
                <ul className="list-disc list-inside mt-2">
                  {migrationResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>确保您已登录</li>
            <li>添加一些测试数据到 localStorage</li>
            <li>点击"执行迁移"将数据迁移到数据库</li>
            <li>点击"验证迁移结果"确认数据是否正确迁移</li>
            <li>测试完成后可以清理测试数据</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
