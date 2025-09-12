'use client'

import React, { useState, useEffect } from 'react'
import { singleUserMigration } from '@/lib/singleUserMigration'
import { useUser } from '@/contexts/GlobalStateContext'

export default function TestMigrationPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<any>(null)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 获取迁移统计信息
    const migrationStats = singleUserMigration.getMigrationStats()
    setStats(migrationStats)
  }, [])

  const handleTestMigration = async () => {
    if (!user?.profile?.id) {
      alert('Please login first')
      return
    }

    setIsLoading(true)
    try {
      const result = await singleUserMigration.migrateUser(user.profile.id)
      setMigrationResult(result)
      
      // 更新统计信息
      const newStats = singleUserMigration.getMigrationStats()
      setStats(newStats)
    } catch (error) {
      console.error('Migration test failed:', error)
      setMigrationResult({ success: false, errors: ['Migration test failed'] })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyMigration = async () => {
    if (!user?.profile?.id) {
      alert('Please login first')
      return
    }

    try {
      const verification = await singleUserMigration.verifyMigration(user.profile.id)
      console.log('Migration verification:', verification)
      alert(`Migration verification: ${verification.matches ? 'SUCCESS' : 'FAILED'}`)
    } catch (error) {
      console.error('Verification failed:', error)
      alert('Verification failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Preferences Migration Test</h1>
      
      <div className="grid gap-6">
        {/* Migration Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Migration Statistics</h2>
          {stats && (
            <div className="space-y-2">
              <p><strong>Has Local Data:</strong> {stats.hasLocalData ? 'Yes' : 'No'}</p>
              <p><strong>Local Favorites Count:</strong> {stats.localFavoritesCount}</p>
              <p><strong>Local Hidden Users Count:</strong> {stats.localHiddenUsersCount}</p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <p><strong>User ID:</strong> {user?.profile?.id || 'Not logged in'}</p>
          <p><strong>Is Authenticated:</strong> {user?.isAuthenticated ? 'Yes' : 'No'}</p>
        </div>

        {/* Migration Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Migration Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestMigration}
              disabled={isLoading || !user?.profile?.id}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Migrating...' : 'Test Migration'}
            </button>
            
            <button
              onClick={handleVerifyMigration}
              disabled={!user?.profile?.id}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Verify Migration
            </button>
          </div>
        </div>

        {/* Migration Result */}
        {migrationResult && (
          <div className={`p-6 rounded-lg shadow ${
            migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">
              Migration Result: {migrationResult.success ? 'SUCCESS' : 'FAILED'}
            </h2>
            
            {migrationResult.success && migrationResult.migrated && (
              <div className="space-y-2">
                <p><strong>Migrated Favorites:</strong> {migrationResult.migrated.favorites}</p>
                <p><strong>Migrated Hidden Users:</strong> {migrationResult.migrated.hiddenUsers}</p>
                <p><strong>Total Users:</strong> {migrationResult.migrated.totalUsers}</p>
              </div>
            )}
            
            {migrationResult.errors && migrationResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Errors:</h3>
                <ul className="list-disc list-inside mt-2">
                  {migrationResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure you are logged in</li>
            <li>Add some test data to localStorage (favorites, hidden users)</li>
            <li>Click "Test Migration" to migrate the data</li>
            <li>Click "Verify Migration" to check if data was migrated correctly</li>
            <li>Check the database to confirm data is stored</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
