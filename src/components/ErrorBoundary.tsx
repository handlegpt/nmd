'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error)
    console.error('🚨 Error info:', errorInfo)
    
    // 记录错误到状态
    this.setState({
      error,
      errorInfo
    })

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 发送错误到监控服务（如果有的话）
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // 记录到 localStorage 用于调试
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      const existingLogs = JSON.parse(localStorage.getItem('react_errors') || '[]')
      existingLogs.push(errorLog)
      
      // 只保留最近 10 个错误
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10)
      }
      
      localStorage.setItem('react_errors', JSON.stringify(existingLogs))
    } catch (e) {
      console.error('Failed to log error to localStorage:', e)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      // 这里可以发送错误报告到服务器
      console.log('Reporting error:', {
        error: this.state.error,
        errorInfo: this.state.errorInfo
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                应用遇到错误
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                很抱歉，应用遇到了一个意外错误。我们的团队已经收到通知。
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-red-600 font-medium">
                    错误详情 (开发模式)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 font-mono">
                    <div><strong>错误:</strong> {this.state.error.message}</div>
                    <div><strong>组件栈:</strong></div>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                重试
              </button>
              <button
                onClick={this.handleReportError}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                报告错误
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 函数式错误边界 Hook
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught:', event.error)
      setError(event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason)
      setError(new Error(`Unhandled promise rejection: ${event.reason}`))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return error
}
