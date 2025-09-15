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
    // 完全禁用安全日志系统以避免无限递归问题
    console.log('🔒 Secure logging system completely disabled to prevent infinite recursion')
  }, [])

  // 这个组件不渲染任何内容
  return null
}
