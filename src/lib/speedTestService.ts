import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface SpeedTestResult {
  id: string
  user_id: string
  download_speed: number
  upload_speed: number
  ping_ms: number
  test_location: string
  test_type: string
  created_at: string
}

export interface SpeedTestInput {
  download_speed: number
  upload_speed: number
  ping_ms: number
  test_location?: string
  test_type?: string
}

class SpeedTestService {
  /**
   * 保存速度测试结果
   */
  async saveSpeedTestResult(userId: string, testData: SpeedTestInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_speed_tests')
        .insert({
          user_id: userId,
          download_speed: testData.download_speed,
          upload_speed: testData.upload_speed,
          ping_ms: testData.ping_ms,
          test_location: testData.test_location || 'Unknown',
          test_type: testData.test_type || 'wifi'
        })

      if (error) {
        logError('Failed to save speed test result', error, 'SpeedTestService')
        return false
      }

      logInfo('Speed test result saved successfully', { 
        userId, 
        downloadSpeed: testData.download_speed,
        uploadSpeed: testData.upload_speed,
        ping: testData.ping_ms
      }, 'SpeedTestService')
      return true
    } catch (error) {
      logError('Error saving speed test result', error, 'SpeedTestService')
      return false
    }
  }

  /**
   * 获取用户速度测试历史
   */
  async getUserSpeedTestHistory(userId: string, limit: number = 20): Promise<SpeedTestResult[]> {
    try {
      const { data, error } = await supabase
        .from('user_speed_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch user speed test history', error, 'SpeedTestService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user speed test history', error, 'SpeedTestService')
      return []
    }
  }

  /**
   * 获取用户最新的速度测试结果
   */
  async getLatestSpeedTestResult(userId: string): Promise<SpeedTestResult | null> {
    try {
      const { data, error } = await supabase
        .from('user_speed_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch latest speed test result', error, 'SpeedTestService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching latest speed test result', error, 'SpeedTestService')
      return null
    }
  }

  /**
   * 删除速度测试结果
   */
  async deleteSpeedTestResult(resultId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_speed_tests')
        .delete()
        .eq('id', resultId)

      if (error) {
        logError('Failed to delete speed test result', error, 'SpeedTestService')
        return false
      }

      logInfo('Speed test result deleted successfully', { resultId }, 'SpeedTestService')
      return true
    } catch (error) {
      logError('Error deleting speed test result', error, 'SpeedTestService')
      return false
    }
  }

  /**
   * 清理旧的速度测试结果
   */
  async cleanupOldSpeedTestResults(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await supabase
        .from('user_speed_tests')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) {
        logError('Failed to cleanup old speed test results', error, 'SpeedTestService')
        return 0
      }

      const deletedCount = data?.length || 0
      logInfo('Old speed test results cleaned up successfully', { deletedCount, daysOld }, 'SpeedTestService')
      return deletedCount
    } catch (error) {
      logError('Error cleaning up old speed test results', error, 'SpeedTestService')
      return 0
    }
  }

  /**
   * 获取用户速度测试统计
   */
  async getUserSpeedTestStats(userId: string): Promise<{
    totalTests: number
    averageDownloadSpeed: number
    averageUploadSpeed: number
    averagePing: number
    bestDownloadSpeed: number
    bestUploadSpeed: number
    bestPing: number
    testLocations: string[]
  }> {
    try {
      const { data, error } = await supabase
        .from('user_speed_tests')
        .select('download_speed, upload_speed, ping_ms, test_location')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to fetch user speed test stats', error, 'SpeedTestService')
        return {
          totalTests: 0,
          averageDownloadSpeed: 0,
          averageUploadSpeed: 0,
          averagePing: 0,
          bestDownloadSpeed: 0,
          bestUploadSpeed: 0,
          bestPing: 0,
          testLocations: []
        }
      }

      const totalTests = data.length
      if (totalTests === 0) {
        return {
          totalTests: 0,
          averageDownloadSpeed: 0,
          averageUploadSpeed: 0,
          averagePing: 0,
          bestDownloadSpeed: 0,
          bestUploadSpeed: 0,
          bestPing: 0,
          testLocations: []
        }
      }

      const downloadSpeeds = data.map((test: any) => test.download_speed)
      const uploadSpeeds = data.map((test: any) => test.upload_speed)
      const pings = data.map((test: any) => test.ping_ms)
      const locations = [...new Set(data.map((test: any) => test.test_location))] as string[]

      const averageDownloadSpeed = Math.round((downloadSpeeds.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100
      const averageUploadSpeed = Math.round((uploadSpeeds.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100
      const averagePing = Math.round((pings.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100

      const bestDownloadSpeed = Math.max(...downloadSpeeds)
      const bestUploadSpeed = Math.max(...uploadSpeeds)
      const bestPing = Math.min(...pings)

      return {
        totalTests,
        averageDownloadSpeed,
        averageUploadSpeed,
        averagePing,
        bestDownloadSpeed,
        bestUploadSpeed,
        bestPing,
        testLocations: locations
      }
    } catch (error) {
      logError('Error getting user speed test stats', error, 'SpeedTestService')
      return {
        totalTests: 0,
        averageDownloadSpeed: 0,
        averageUploadSpeed: 0,
        averagePing: 0,
        bestDownloadSpeed: 0,
        bestUploadSpeed: 0,
        bestPing: 0,
        testLocations: []
      }
    }
  }

  /**
   * 获取全局速度测试统计
   */
  async getGlobalSpeedTestStats(): Promise<{
    totalTests: number
    averageDownloadSpeed: number
    averageUploadSpeed: number
    averagePing: number
    topLocations: Array<{ location: string; count: number; avgSpeed: number }>
  }> {
    try {
      const { data, error } = await supabase
        .from('user_speed_tests')
        .select('download_speed, upload_speed, ping_ms, test_location')

      if (error) {
        logError('Failed to fetch global speed test stats', error, 'SpeedTestService')
        return {
          totalTests: 0,
          averageDownloadSpeed: 0,
          averageUploadSpeed: 0,
          averagePing: 0,
          topLocations: []
        }
      }

      const totalTests = data.length
      if (totalTests === 0) {
        return {
          totalTests: 0,
          averageDownloadSpeed: 0,
          averageUploadSpeed: 0,
          averagePing: 0,
          topLocations: []
        }
      }

      const downloadSpeeds = data.map((test: any) => test.download_speed)
      const uploadSpeeds = data.map((test: any) => test.upload_speed)
      const pings = data.map((test: any) => test.ping_ms)

      const averageDownloadSpeed = Math.round((downloadSpeeds.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100
      const averageUploadSpeed = Math.round((uploadSpeeds.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100
      const averagePing = Math.round((pings.reduce((a: number, b: number) => a + b, 0) / totalTests) * 100) / 100

      // Calculate top locations
      const locationStats: { [key: string]: { count: number; totalSpeed: number } } = {}
      data.forEach((test: any) => {
        const location = test.test_location || 'Unknown'
        if (!locationStats[location]) {
          locationStats[location] = { count: 0, totalSpeed: 0 }
        }
        locationStats[location].count++
        locationStats[location].totalSpeed += test.download_speed
      })

      const topLocations = Object.entries(locationStats)
        .map(([location, stats]) => ({
          location,
          count: stats.count,
          avgSpeed: Math.round((stats.totalSpeed / stats.count) * 100) / 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalTests,
        averageDownloadSpeed,
        averageUploadSpeed,
        averagePing,
        topLocations
      }
    } catch (error) {
      logError('Error getting global speed test stats', error, 'SpeedTestService')
      return {
        totalTests: 0,
        averageDownloadSpeed: 0,
        averageUploadSpeed: 0,
        averagePing: 0,
        topLocations: []
      }
    }
  }

  /**
   * 获取速度测试趋势数据
   */
  async getSpeedTestTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    downloadSpeed: number
    uploadSpeed: number
    ping: number
  }>> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('user_speed_tests')
        .select('download_speed, upload_speed, ping_ms, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        logError('Failed to fetch speed test trends', error, 'SpeedTestService')
        return []
      }

      return data.map((test: any) => ({
        date: test.created_at.split('T')[0], // Get date part only
        downloadSpeed: test.download_speed,
        uploadSpeed: test.upload_speed,
        ping: test.ping_ms
      }))
    } catch (error) {
      logError('Error getting speed test trends', error, 'SpeedTestService')
      return []
    }
  }
}

export const speedTestService = new SpeedTestService()
