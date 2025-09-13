'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/GlobalStateContext'
import { cityFavoritesService } from '@/lib/cityFavoritesService'
import { cityTrajectoryService } from '@/lib/cityTrajectoryService'
import { cityReviewsService } from '@/lib/cityReviewsService'
import { searchHistoryService } from '@/lib/searchHistoryService'
import { userLocationService } from '@/lib/userLocationService'
import { userConnectionsService } from '@/lib/userConnectionsService'

export default function TestHighPriorityServices() {
  const { user } = useUser()
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    if (!user.isAuthenticated || !user.profile?.id) {
      alert('请先登录')
      return
    }

    setIsLoading(true)
    const results: any = {}

    try {
      // Test City Favorites Service
      console.log('Testing City Favorites Service...')
      const favorites = await cityFavoritesService.getUserFavorites(user.profile.id)
      results.cityFavorites = {
        status: 'success',
        count: favorites.length,
        data: favorites
      }

      // Test City Trajectory Service
      console.log('Testing City Trajectory Service...')
      const trajectory = await cityTrajectoryService.getUserTrajectory(user.profile.id)
      results.cityTrajectory = {
        status: 'success',
        count: trajectory.length,
        data: trajectory
      }

      // Test City Reviews Service
      console.log('Testing City Reviews Service...')
      const reviews = await cityReviewsService.getUserReviews(user.profile.id)
      results.cityReviews = {
        status: 'success',
        count: reviews.length,
        data: reviews
      }

      // Test Search History Service
      console.log('Testing Search History Service...')
      const searchHistory = await searchHistoryService.getUserSearchHistory(user.profile.id)
      results.searchHistory = {
        status: 'success',
        count: searchHistory.length,
        data: searchHistory
      }

      // Test User Location Service
      console.log('Testing User Location Service...')
      const location = await userLocationService.getCurrentLocation(user.profile.id)
      results.userLocation = {
        status: 'success',
        hasLocation: !!location,
        data: location
      }

      // Test User Connections Service
      console.log('Testing User Connections Service...')
      const connections = await userConnectionsService.getUserConnections(user.profile.id)
      results.userConnections = {
        status: 'success',
        count: connections.length,
        data: connections
      }

      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      results.error = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      setTestResults(results)
    } finally {
      setIsLoading(false)
    }
  }

  const testAddData = async () => {
    if (!user.isAuthenticated || !user.profile?.id) {
      alert('请先登录')
      return
    }

    setIsLoading(true)
    try {
      // Add a test city favorite
      await cityFavoritesService.addFavorite(user.profile.id, {
        city_id: 'test-bali',
        city_name: 'Bali',
        country: 'Indonesia',
        coordinates: { lat: -8.3405, lng: 115.0920 }
      })

      // Add a test search history entry
      await searchHistoryService.addSearchEntry(user.profile.id, {
        search_query: 'Bali digital nomad',
        search_type: 'city',
        results_count: 5
      })

      // Add a test location
      await userLocationService.updateLocation(user.profile.id, {
        latitude: -8.3405,
        longitude: 115.0920,
        city: 'Bali',
        country: 'Indonesia',
        accuracy: 100
      })

      alert('测试数据添加成功！')
      runTests() // Refresh the results
    } catch (error) {
      console.error('Failed to add test data:', error)
      alert('添加测试数据失败: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            高优先级数据服务测试
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              测试所有高优先级数据服务是否正常工作
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={runTests}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '测试中...' : '运行测试'}
              </button>
              
              <button
                onClick={testAddData}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? '添加中...' : '添加测试数据'}
              </button>
            </div>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">测试结果</h2>
              
              {Object.entries(testResults).map(([service, result]: [string, any]) => (
                <div key={service} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  
                  {result.status === 'success' ? (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ 成功
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        数据条数: {result.count || (result.hasLocation ? '1' : '0')}
                      </p>
                      {result.data && result.data.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer">
                            查看数据详情
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ 失败
                      </span>
                      <p className="text-sm text-red-600 mt-1">
                        {result.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">测试说明</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 运行测试：检查所有服务是否能正常连接数据库</li>
              <li>• 添加测试数据：向数据库添加一些测试数据</li>
              <li>• 确保用户已登录才能进行测试</li>
              <li>• 所有操作都会记录到控制台日志中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
