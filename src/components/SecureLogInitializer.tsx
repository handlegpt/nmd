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
    // 暂时禁用安全日志系统以避免按钮点击问题
    console.log('🔒 Secure logging system temporarily disabled for debugging')
    
    // 简单的初始化，不替换console
    try {
      enhancedLogger.info('Secure logging system initialized (console replacement disabled)', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }, 'SecureLogInitializer')
    } catch (error) {
      console.error('Failed to initialize secure logging:', error)
    }
  }, [])

  // 这个组件不渲染任何内容
  return null
}
