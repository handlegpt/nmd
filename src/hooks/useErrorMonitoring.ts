import { useEffect, useCallback, useState } from 'react'

interface ErrorInfo {
  componentStack: string
  [key: string]: any
}

interface ErrorReport {
  error: Error
  errorInfo: ErrorInfo
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
  timestamp: string
}

export function useErrorMonitoring() {
  const [errors, setErrors] = useState<ErrorReport[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 报告错误到服务器
  const reportError = useCallback(async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport: ErrorReport = {
        error,
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: undefined, // TODO: Replace localStorage with database API for user_id
        sessionId: sessionStorage.getItem('session_id') || undefined,
        timestamp: new Date().toISOString()
      }

      // 添加到本地状态
      setErrors(prev => [...prev, errorReport])

      // 发送到服务器
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      })

      if (!response.ok) {
        console.error('Failed to report error to server:', response.statusText)
      }

      // 同时记录到 localStorage 作为备份
      const existingErrors: any[] = [] // TODO: Replace localStorage with database API for react_errors
      existingErrors.push(errorReport)
      
      // 只保留最近 20 个错误
      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20)
      }
      
      // TODO: Replace localStorage with database API for react_errors)

    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }, [])

  // 启动错误监控
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return

    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught by monitoring:', event.error)
      
      // 创建 ErrorInfo 对象
      const errorInfo: ErrorInfo = {
        componentStack: 'Global error - no component stack available',
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }

      reportError(event.error, errorInfo)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection caught:', event.reason)
      
      // 将 rejection 转换为 Error 对象
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(`Unhandled promise rejection: ${event.reason}`)

      const errorInfo: ErrorInfo = {
        componentStack: 'Promise rejection - no component stack available',
        reason: event.reason
      }

      reportError(error, errorInfo)
    }

    // 添加全局错误监听器
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // 重写 console.error 来捕获更多错误信息
    const originalConsoleError = console.error
    console.error = (...args) => {
      // 调用原始方法
      originalConsoleError.apply(console, args)
      
      // 检查是否是 React 错误
      const message = args.join(' ')
      if (message.includes('React error #418') || message.includes('React error #423')) {
        const error = new Error(message)
        const errorInfo: ErrorInfo = {
          componentStack: 'Console error - no component stack available',
          consoleArgs: args
        }
        reportError(error, errorInfo)
      }
    }

    setIsMonitoring(true)

    // 返回清理函数
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      console.error = originalConsoleError
      setIsMonitoring(false)
    }
  }, [isMonitoring, reportError])

  // 停止错误监控
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return
    setIsMonitoring(false)
  }, [isMonitoring])

  // 获取错误统计
  const getErrorStats = useCallback(() => {
    const totalErrors = errors.length
    const errorTypes = errors.reduce((acc, err) => {
      const type = err.error.name || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const recentErrors = errors.slice(-5).map(err => ({
      timestamp: err.timestamp,
      message: err.error.message,
      type: err.error.name,
      url: err.url
    }))

    return {
      totalErrors,
      errorTypes,
      recentErrors,
      isMonitoring
    }
  }, [errors, isMonitoring])

  // 清除错误记录
  const clearErrors = useCallback(() => {
    setErrors([])
    // TODO: Replace localStorage with database API for react_errors
  }, [])

  // 自动启动监控
  useEffect(() => {
    const cleanup = startMonitoring()
    return cleanup
  }, [startMonitoring])

  return {
    errors,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getErrorStats,
    clearErrors,
    reportError
  }
}

// 简化的错误监控 Hook
export function useSimpleErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}
