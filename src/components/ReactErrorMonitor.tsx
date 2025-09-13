'use client'

import { useEffect, useState } from 'react'

interface ReactError {
  id: string
  timestamp: string
  errorCode: string
  errorMessage: string
  stackTrace: string
  componentStack?: string
  url: string
  userAgent: string
}

export function ReactErrorMonitor() {
  const [errors, setErrors] = useState<ReactError[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (isMonitoring) return

    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    // 重写 console.error 来捕获 React 错误
    console.error = (...args) => {
      // 调用原始方法
      originalConsoleError.apply(console, args)
      
      // 检查是否是 React 错误
      const message = args.join(' ')
      if (message.includes('React error #418') || message.includes('React error #423')) {
        const errorCode = message.includes('#418') ? '418' : '423'
        
        const reactError: ReactError = {
          id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          errorCode,
          errorMessage: message,
          stackTrace: new Error().stack || 'No stack trace',
          url: window.location.href,
          userAgent: navigator.userAgent
        }

        console.log('🚨 React Error Captured:', reactError)
        setErrors(prev => [...prev, reactError])

        // 保存到 localStorage
        const existingErrors: any[] = [] // TODO: Replace localStorage with database API for react_errors_detailed
        existingErrors.push(reactError)
        
        if (existingErrors.length > 50) {
          existingErrors.splice(0, existingErrors.length - 50)
        }
        
        // TODO: Replace localStorage with database API for react_errors_detailed)

        // 尝试发送到服务器
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: new Error(message),
            errorInfo: { componentStack: 'React error captured via console' },
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }).catch(e => console.log('Failed to send error to server:', e))
      }
    }

    // 重写 console.warn 来捕获 React 警告
    console.warn = (...args) => {
      // 调用原始方法
      originalConsoleWarn.apply(console, args)
      
      // 检查是否是 React 相关警告
      const message = args.join(' ')
      if (message.includes('React') || message.includes('Warning')) {
        console.log('⚠️ React Warning:', message)
      }
    }

    // 监听全局错误事件
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || 'Unknown error'
      
      if (message.includes('React') || message.includes('Minified React error')) {
        const errorCode = message.match(/#(\d+)/)?.[1] || 'unknown'
        
        const reactError: ReactError = {
          id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          errorCode,
          errorMessage: message,
          stackTrace: event.error?.stack || 'No stack trace',
          url: window.location.href,
          userAgent: navigator.userAgent
        }

        console.log('🚨 React Error via Global Handler:', reactError)
        setErrors(prev => [...prev, reactError])
      }
    }

    // 监听未处理的 Promise 拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || String(reason)
      
      if (message.includes('React') || message.includes('Minified React error')) {
        console.log('🚨 React Error via Promise Rejection:', message)
      }
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    setIsMonitoring(true)

    // 清理函数
    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      setIsMonitoring(false)
    }
  }, [isMonitoring])

  const clearErrors = () => {
    setErrors([])
    // TODO: Replace localStorage with database API for react_errors_detailed
  }

  const exportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `react_errors_${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 只在开发环境或错误存在时显示
  if (process.env.NODE_ENV === 'production' && errors.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          React 错误监控
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={clearErrors}
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
          >
            清除
          </button>
          <button
            onClick={exportErrors}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            导出
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        状态: {isMonitoring ? '监控中' : '未监控'} | 错误: {errors.length}
      </div>

      {errors.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          {errors.slice(-5).map((error) => (
            <div key={error.id} className="mb-2 p-2 bg-red-50 rounded text-xs">
              <div className="font-medium text-red-800">
                错误 #{error.errorCode}
              </div>
              <div className="text-red-600 truncate">
                {error.errorMessage}
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.length === 0 && (
        <div className="text-xs text-gray-500">
          暂无 React 错误
        </div>
      )}
    </div>
  )
}

// 简化的监控 Hook
export function useReactErrorMonitor() {
  const [reactErrors, setReactErrors] = useState<ReactError[]>([])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || ''
      
      if (message.includes('React error #418') || message.includes('React error #423')) {
        const errorCode = message.match(/#(\d+)/)?.[1] || 'unknown'
        
        const reactError: ReactError = {
          id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          errorCode,
          errorMessage: message,
          stackTrace: event.error?.stack || 'No stack trace',
          url: window.location.href,
          userAgent: navigator.userAgent
        }

        setReactErrors(prev => [...prev, reactError])
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return reactErrors
}
