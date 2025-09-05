'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function DebugReactPage() {
  const { t, locale, changeLocale } = useTranslation()
  const [count, setCount] = useState(0)
  const [errors, setErrors] = useState<any[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 启动错误监控
  useEffect(() => {
    if (isMonitoring) return

    const handleError = (event: ErrorEvent) => {
      console.log('🚨 Error caught:', event)
      setErrors(prev => [...prev, {
        type: 'error',
        message: event.message,
        error: event.error,
        timestamp: new Date().toISOString()
      }])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('🚨 Unhandled rejection:', event)
      setErrors(prev => [...prev, {
        type: 'unhandledrejection',
        reason: event.reason,
        timestamp: new Date().toISOString()
      }])
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    setIsMonitoring(true)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [isMonitoring])

  // 测试useEffect依赖
  useEffect(() => {
    console.log('🔍 Debug useEffect executed, count:', count)
  }, [count])

  const testLanguageSwitch = async (lang: string) => {
    console.log('🔍 Testing language switch to:', lang)
    try {
      await changeLocale(lang as any)
      console.log('✅ Language switch completed')
    } catch (error) {
      console.error('❌ Language switch failed:', error)
    }
  }

  const testStateUpdate = () => {
    console.log('🔍 Testing state update, current count:', count)
    setCount(prev => {
      const newCount = prev + 1
      console.log('🔄 State update:', prev, '->', newCount)
      return newCount
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">React Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本功能测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">基本功能测试</h2>
            <div className="space-y-4">
              <div>
                <p><strong>当前语言:</strong> {locale}</p>
                <p><strong>计数器:</strong> {count}</p>
              </div>
              
              <button
                onClick={testStateUpdate}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                测试状态更新
              </button>
              
              <div className="space-y-2">
                <p className="font-semibold">语言切换测试:</p>
                {['en', 'zh', 'es', 'ja'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => testLanguageSwitch(lang)}
                    className={`block w-full px-3 py-2 rounded ${
                      locale === lang ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {lang.toUpperCase()} {locale === lang ? '(当前)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 错误监控 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">错误监控</h2>
            <div className="space-y-4">
              <div>
                <p><strong>监控状态:</strong> {isMonitoring ? '✅ 已启动' : '❌ 未启动'}</p>
                <p><strong>错误数量:</strong> {errors.length}</p>
              </div>
              
              <button
                onClick={() => setErrors([])}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                清除错误记录
              </button>
              
              {errors.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  <h3 className="font-semibold mb-2">错误详情:</h3>
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 p-2 rounded mb-2">
                      <p><strong>类型:</strong> {error.type}</p>
                      <p><strong>时间:</strong> {error.timestamp}</p>
                      <p><strong>消息:</strong> {error.message || error.reason || 'N/A'}</p>
                      {error.error && (
                        <details className="mt-2">
                          <summary className="cursor-pointer">错误详情</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(error.error, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 翻译测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">翻译测试</h2>
            <div className="space-y-2">
              <p><strong>测试键:</strong> common.home</p>
              <p><strong>翻译结果:</strong> {t('common.home')}</p>
              
              <p><strong>测试键:</strong> navigation.places</p>
              <p><strong>翻译结果:</strong> {t('navigation.places')}</p>
              
              <p><strong>测试键:</strong> home.title</p>
              <p><strong>翻译结果:</strong> {t('home.title')}</p>
            </div>
          </div>

          {/* 性能监控 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">性能监控</h2>
            <div className="space-y-2">
              <p><strong>渲染时间:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>内存使用:</strong> {(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'}</p>
              <p><strong>页面加载时间:</strong> {(performance as any).timing ? `${(performance as any).timing.loadEventEnd - (performance as any).timing.navigationStart}ms` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
