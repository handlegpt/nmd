'use client'

/**
 * Secure Log Initializer
 * 客户端安全日志初始化组件
 */

import { useEffect } from 'react'
import { enhancedLogger } from '@/lib/enhancedSecureLogger'
import { replaceGlobalConsole, getConsoleStatus } from '@/lib/globalLogReplacer'

export default function SecureLogInitializer() {
  useEffect(() => {
    // 初始化安全日志系统
    const initializeSecureLogging = () => {
      try {
        // 替换全局console方法
        replaceGlobalConsole()
        
        // 记录初始化成功
        enhancedLogger.info('Secure logging system initialized successfully', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }, 'SecureLogInitializer')
        
        // 检查替换状态
        const status = getConsoleStatus()
        enhancedLogger.debug('Console replacement status', status, 'SecureLogInitializer')
        
      } catch (error) {
        // 如果初始化失败，记录错误但不影响应用运行
        console.error('Failed to initialize secure logging:', error)
      }
    }

    // 延迟初始化，确保其他系统先启动
    const timer = setTimeout(initializeSecureLogging, 1000)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  // 这个组件不渲染任何内容
  return null
}
