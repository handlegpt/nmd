'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function TestNoUseEffectPage() {
  const { t, locale, changeLocale } = useTranslation()
  const [count, setCount] = useState(0)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testLanguageSwitch = async (lang: string) => {
    addTestResult(`开始切换语言到: ${lang}`)
    try {
      await changeLocale(lang as any)
      addTestResult(`✅ 语言切换完成: ${lang}`)
    } catch (error) {
      addTestResult(`❌ 语言切换失败: ${error}`)
    }
  }

  const testStateUpdate = () => {
    addTestResult(`测试状态更新，当前计数: ${count}`)
    setCount(prev => {
      const newCount = prev + 1
      addTestResult(`🔄 状态更新: ${prev} -> ${newCount}`)
      return newCount
    })
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">禁用useEffect测试页面</h1>
        
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <strong>测试说明:</strong> 这个页面用于测试是否所有useEffect都被正确禁用。
          如果这里没有React Error #418，说明问题确实在useEffect中。
        </div>
        
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

          {/* 测试结果 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p><strong>结果数量:</strong> {testResults.length}</p>
                <button
                  onClick={clearResults}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                >
                  清除结果
                </button>
              </div>
              
              {testResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无测试结果</p>
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

          {/* 错误监控 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">错误监控</h2>
            <div className="space-y-2">
              <p><strong>页面渲染时间:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>React版本:</strong> {React.version}</p>
              <p><strong>环境:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
