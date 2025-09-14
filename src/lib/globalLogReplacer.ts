/**
 * Global Log Replacer
 * 全局日志替换工具，用于在应用启动时替换所有console方法
 */

import { enhancedLogger } from './enhancedSecureLogger'
import { getLogConfig } from './productionLogConfig'

interface OriginalConsole {
  log: typeof console.log
  error: typeof console.error
  warn: typeof console.warn
  info: typeof console.info
  debug: typeof console.debug
}

class GlobalLogReplacer {
  private originalConsole: OriginalConsole
  private isReplaced: boolean = false
  private config = getLogConfig()

  constructor() {
    // 保存原始console方法
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    }
  }

  /**
   * 替换全局console方法
   */
  replaceConsole(): void {
    if (this.isReplaced) {
      console.warn('Console methods have already been replaced')
      return
    }

    // 替换console.log
    console.log = (...args: any[]) => {
      this.handleLog('info', args, 'Console')
    }

    // 替换console.error
    console.error = (...args: any[]) => {
      this.handleLog('error', args, 'Console')
    }

    // 替换console.warn
    console.warn = (...args: any[]) => {
      this.handleLog('warn', args, 'Console')
    }

    // 替换console.info
    console.info = (...args: any[]) => {
      this.handleLog('info', args, 'Console')
    }

    // 替换console.debug
    console.debug = (...args: any[]) => {
      this.handleLog('debug', args, 'Console')
    }

    this.isReplaced = true
    console.log('🔒 Global console methods replaced with secure logging')
  }

  /**
   * 恢复原始console方法
   */
  restoreConsole(): void {
    if (!this.isReplaced) {
      console.warn('Console methods have not been replaced')
      return
    }

    console.log = this.originalConsole.log
    console.error = this.originalConsole.error
    console.warn = this.originalConsole.warn
    console.info = this.originalConsole.info
    console.debug = this.originalConsole.debug

    this.isReplaced = false
    console.log('🔄 Original console methods restored')
  }

  /**
   * 处理日志调用
   */
  private handleLog(level: 'info' | 'warn' | 'error' | 'debug', args: any[], component: string): void {
    // 检查是否应该记录此日志
    if (!this.shouldLog(level, args)) {
      return
    }

    // 格式化消息
    const message = this.formatMessage(args)
    
    // 使用增强日志记录器
    enhancedLogger[level](message, this.extractContext(args), component)
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: string, args: any[]): boolean {
    // 在生产环境中，只记录错误和警告
    if (process.env.NODE_ENV === 'production') {
      if (level === 'error' || level === 'warn') {
        return true
      }
      
      // 检查是否启用详细日志
      if (!this.config.enableVerboseLogging && level === 'debug') {
        return false
      }
      
      // 检查是否启用信息日志
      if (!this.config.enableVerboseLogging && level === 'info') {
        return false
      }
    }

    return true
  }

  /**
   * 格式化消息
   */
  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2)
        } catch (error) {
          return '[Circular Object]'
        }
      }
      return String(arg)
    }).join(' ')
  }

  /**
   * 提取上下文信息
   */
  private extractContext(args: any[]): any {
    const context: any = {}
    
    // 查找对象参数作为上下文
    args.forEach((arg, index) => {
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        context[`arg${index}`] = arg
      }
    })

    return Object.keys(context).length > 0 ? context : undefined
  }

  /**
   * 获取替换状态
   */
  getReplacementStatus(): { isReplaced: boolean; config: any } {
    return {
      isReplaced: this.isReplaced,
      config: this.config
    }
  }
}

// 创建全局实例
export const globalLogReplacer = new GlobalLogReplacer()

// 自动替换（仅在客户端）
if (typeof window !== 'undefined') {
  // 延迟替换，确保其他初始化完成
  setTimeout(() => {
    globalLogReplacer.replaceConsole()
  }, 100)
}

// 导出工具函数
export const replaceGlobalConsole = () => globalLogReplacer.replaceConsole()
export const restoreGlobalConsole = () => globalLogReplacer.restoreConsole()
export const getConsoleStatus = () => globalLogReplacer.getReplacementStatus()

// 导出类用于自定义实例
export { GlobalLogReplacer }
