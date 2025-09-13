import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface ErrorLog {
  id: string
  user_id?: string
  error_type: string
  error_message: string
  error_stack?: string
  error_context: { [key: string]: any }
  user_agent?: string
  url?: string
  created_at: string
}

export interface ErrorLogInput {
  user_id?: string
  error_type: string
  error_message: string
  error_stack?: string
  error_context?: { [key: string]: any }
  user_agent?: string
  url?: string
}

class ErrorMonitoringService {
  /**
   * 记录错误日志
   */
  async logError(errorData: ErrorLogInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_error_logs')
        .insert({
          user_id: errorData.user_id,
          error_type: errorData.error_type,
          error_message: errorData.error_message,
          error_stack: errorData.error_stack,
          error_context: errorData.error_context || {},
          user_agent: errorData.user_agent,
          url: errorData.url
        })

      if (error) {
        logError('Failed to log error to database', error, 'ErrorMonitoringService')
        return false
      }

      logInfo('Error logged successfully', { errorType: errorData.error_type }, 'ErrorMonitoringService')
      return true
    } catch (error) {
      logError('Error logging error to database', error, 'ErrorMonitoringService')
      return false
    }
  }

  /**
   * 获取用户错误日志
   */
  async getUserErrorLogs(userId: string, limit: number = 50): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_error_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch user error logs', error, 'ErrorMonitoringService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user error logs', error, 'ErrorMonitoringService')
      return []
    }
  }

  /**
   * 获取所有错误日志（管理员功能）
   */
  async getAllErrorLogs(limit: number = 100): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch all error logs', error, 'ErrorMonitoringService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching all error logs', error, 'ErrorMonitoringService')
      return []
    }
  }

  /**
   * 按错误类型获取错误日志
   */
  async getErrorLogsByType(errorType: string, limit: number = 50): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_error_logs')
        .select('*')
        .eq('error_type', errorType)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch error logs by type', error, 'ErrorMonitoringService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching error logs by type', error, 'ErrorMonitoringService')
      return []
    }
  }

  /**
   * 删除错误日志
   */
  async deleteErrorLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_error_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        logError('Failed to delete error log', error, 'ErrorMonitoringService')
        return false
      }

      logInfo('Error log deleted successfully', { logId }, 'ErrorMonitoringService')
      return true
    } catch (error) {
      logError('Error deleting error log', error, 'ErrorMonitoringService')
      return false
    }
  }

  /**
   * 清理旧错误日志
   */
  async cleanupOldErrorLogs(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await supabase
        .from('user_error_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) {
        logError('Failed to cleanup old error logs', error, 'ErrorMonitoringService')
        return 0
      }

      const deletedCount = data?.length || 0
      logInfo('Old error logs cleaned up successfully', { deletedCount, daysOld }, 'ErrorMonitoringService')
      return deletedCount
    } catch (error) {
      logError('Error cleaning up old error logs', error, 'ErrorMonitoringService')
      return 0
    }
  }

  /**
   * 获取错误统计
   */
  async getErrorStats(): Promise<{
    totalErrors: number
    errorsByType: { [key: string]: number }
    errorsByUser: { [key: string]: number }
    recentErrors: number
  }> {
    try {
      const { data, error } = await supabase
        .from('user_error_logs')
        .select('error_type, user_id, created_at')

      if (error) {
        logError('Failed to fetch error stats', error, 'ErrorMonitoringService')
        return { totalErrors: 0, errorsByType: {}, errorsByUser: {}, recentErrors: 0 }
      }

      const totalErrors = data.length
      const errorsByType: { [key: string]: number } = {}
      const errorsByUser: { [key: string]: number } = {}
      
      // Calculate recent errors (last 24 hours)
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      let recentErrors = 0

      data.forEach((error: any) => {
        // Count by type
        errorsByType[error.error_type] = (errorsByType[error.error_type] || 0) + 1
        
        // Count by user
        if (error.user_id) {
          errorsByUser[error.user_id] = (errorsByUser[error.user_id] || 0) + 1
        }

        // Count recent errors
        if (new Date(error.created_at) > oneDayAgo) {
          recentErrors++
        }
      })

      return {
        totalErrors,
        errorsByType,
        errorsByUser,
        recentErrors
      }
    } catch (error) {
      logError('Error getting error stats', error, 'ErrorMonitoringService')
      return { totalErrors: 0, errorsByType: {}, errorsByUser: {}, recentErrors: 0 }
    }
  }

  /**
   * 获取用户错误统计
   */
  async getUserErrorStats(userId: string): Promise<{
    totalErrors: number
    errorsByType: { [key: string]: number }
    recentErrors: number
    lastErrorDate?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('user_error_logs')
        .select('error_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user error stats', error, 'ErrorMonitoringService')
        return { totalErrors: 0, errorsByType: {}, recentErrors: 0 }
      }

      const totalErrors = data.length
      const errorsByType: { [key: string]: number } = {}
      
      // Calculate recent errors (last 24 hours)
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      let recentErrors = 0

      data.forEach((error: any) => {
        errorsByType[error.error_type] = (errorsByType[error.error_type] || 0) + 1
        
        if (new Date(error.created_at) > oneDayAgo) {
          recentErrors++
        }
      })

      const lastErrorDate = data.length > 0 ? data[0].created_at : undefined

      return {
        totalErrors,
        errorsByType,
        recentErrors,
        lastErrorDate
      }
    } catch (error) {
      logError('Error getting user error stats', error, 'ErrorMonitoringService')
      return { totalErrors: 0, errorsByType: {}, recentErrors: 0 }
    }
  }

  /**
   * 记录 React 错误
   */
  async logReactError(error: Error, errorInfo: any, userId?: string): Promise<boolean> {
    return await this.logError({
      user_id: userId,
      error_type: 'react_error',
      error_message: error.message,
      error_stack: error.stack,
      error_context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary
      },
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    })
  }

  /**
   * 记录 API 错误
   */
  async logApiError(error: any, endpoint: string, userId?: string): Promise<boolean> {
    return await this.logError({
      user_id: userId,
      error_type: 'api_error',
      error_message: error.message || 'Unknown API error',
      error_stack: error.stack,
      error_context: {
        endpoint,
        status: error.status,
        response: error.response
      },
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    })
  }

  /**
   * 记录数据库错误
   */
  async logDatabaseError(error: any, operation: string, userId?: string): Promise<boolean> {
    return await this.logError({
      user_id: userId,
      error_type: 'database_error',
      error_message: error.message || 'Unknown database error',
      error_stack: error.stack,
      error_context: {
        operation,
        code: error.code,
        details: error.details
      }
    })
  }
}

export const errorMonitoringService = new ErrorMonitoringService()
