'use client'

import { useState, useEffect } from 'react'
import { expatistanScraper } from '@/lib/expatistanScraperService'
import { expatistanCache } from '@/lib/expatistanCacheService'

interface CacheStats {
  type: string
  size: number
  hitRate: number
  lastCleanup: Date
}

interface ScrapingStats {
  lastRequestTime: Date
  rateLimitDelay: number
  cacheEnabled: boolean
}

export default function ExpatistanManagerPage() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [scrapingStats, setScrapingStats] = useState<ScrapingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [scrapedData, setScrapedData] = useState<any>(null)

  // 预定义的城市列表
  const popularCities = [
    { city: 'Bangkok', country: 'Thailand' },
    { city: 'Lisbon', country: 'Portugal' },
    { city: 'Berlin', country: 'Germany' },
    { city: 'Mexico City', country: 'Mexico' },
    { city: 'Barcelona', country: 'Spain' },
    { city: 'Prague', country: 'Czech Republic' },
    { city: 'Budapest', country: 'Hungary' },
    { city: 'Tallinn', country: 'Estonia' },
    { city: 'Chiang Mai', country: 'Thailand' },
    { city: 'Medellin', country: 'Colombia' },
    { city: 'Buenos Aires', country: 'Argentina' },
    { city: 'Sofia', country: 'Bulgaria' }
  ]

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [cacheStatsData, scrapingStatsData] = await Promise.all([
        expatistanCache.getStats(),
        expatistanScraper.getScrapingStats()
      ])
      
      setCacheStats(cacheStatsData)
      setScrapingStats(scrapingStatsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleManualScrape = async () => {
    if (!selectedCity || !selectedCountry) {
      setMessage('请选择城市和国家')
      return
    }

    setIsLoading(true)
    setMessage('')
    setScrapedData(null)

    try {
      console.log(`开始手动抓取: ${selectedCity}, ${selectedCountry}`)
      const data = await expatistanScraper.getExpatistanData(selectedCity, selectedCountry)
      
      if (data) {
        setScrapedData(data)
        setMessage(`✅ 成功抓取 ${selectedCity}, ${selectedCountry} 的数据`)
        await loadStats() // 刷新统计信息
      } else {
        setMessage(`❌ 抓取失败: ${selectedCity}, ${selectedCountry}`)
      }
    } catch (error) {
      console.error('Scraping error:', error)
      setMessage(`❌ 抓取错误: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async () => {
    setIsLoading(true)
    try {
      await expatistanScraper.clearCache()
      setMessage('✅ 缓存已清理')
      await loadStats()
    } catch (error) {
      setMessage(`❌ 清理缓存失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchScrape = async () => {
    setIsLoading(true)
    setMessage('开始批量抓取...')
    
    let successCount = 0
    let failCount = 0

    for (const { city, country } of popularCities) {
      try {
        console.log(`批量抓取: ${city}, ${country}`)
        const data = await expatistanScraper.getExpatistanData(city, country)
        
        if (data) {
          successCount++
          console.log(`✅ 成功: ${city}, ${country}`)
        } else {
          failCount++
          console.log(`❌ 失败: ${city}, ${country}`)
        }
        
        // 添加延迟避免过于频繁的请求
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        failCount++
        console.error(`错误: ${city}, ${country}`, error)
      }
    }

    setMessage(`批量抓取完成: 成功 ${successCount} 个，失败 ${failCount} 个`)
    await loadStats()
    setIsLoading(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN')
  }

  const formatTTL = (ttl: number) => {
    const months = Math.floor(ttl / (30 * 24 * 60 * 60 * 1000))
    const days = Math.floor((ttl % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
    return `${months}个月${days}天`
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Expatistan数据管理</h1>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">缓存统计</h2>
            {cacheStats ? (
              <div className="space-y-2">
                <p><span className="font-medium">缓存类型:</span> {cacheStats.type}</p>
                <p><span className="font-medium">缓存大小:</span> {cacheStats.size} 条目</p>
                <p><span className="font-medium">命中率:</span> {cacheStats.hitRate}%</p>
                <p><span className="font-medium">最后清理:</span> {formatDate(cacheStats.lastCleanup)}</p>
                <p><span className="font-medium">缓存时长:</span> 6个月</p>
              </div>
            ) : (
              <p>加载中...</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">抓取统计</h2>
            {scrapingStats ? (
              <div className="space-y-2">
                <p><span className="font-medium">最后请求:</span> {formatDate(scrapingStats.lastRequestTime)}</p>
                <p><span className="font-medium">请求间隔:</span> {scrapingStats.rateLimitDelay}ms</p>
                <p><span className="font-medium">缓存启用:</span> {scrapingStats.cacheEnabled ? '是' : '否'}</p>
                <p><span className="font-medium">状态:</span> <span className="text-green-500">正常</span></p>
              </div>
            ) : (
              <p>加载中...</p>
            )}
          </div>
        </div>

        {/* 手动抓取 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">手动抓取</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                城市
              </label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入城市名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                国家
              </label>
              <input
                type="text"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入国家名称"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleManualScrape}
              disabled={isLoading || !selectedCity || !selectedCountry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '抓取中...' : '手动抓取'}
            </button>
            
            <button
              onClick={handleBatchScrape}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? '批量抓取中...' : '批量抓取热门城市'}
            </button>
            
            <button
              onClick={handleClearCache}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              清理缓存
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>

        {/* 快速选择城市 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">快速选择城市</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularCities.map(({ city, country }, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedCity(city)
                  setSelectedCountry(country)
                }}
                className="p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {city}, {country}
              </button>
            ))}
          </div>
        </div>

        {/* 抓取结果显示 */}
        {scrapedData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">抓取结果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">基本信息</h3>
                <p><span className="font-medium">城市:</span> {scrapedData.city}</p>
                <p><span className="font-medium">国家:</span> {scrapedData.country}</p>
                <p><span className="font-medium">数据质量:</span> {scrapedData.dataQuality}</p>
                <p><span className="font-medium">更新时间:</span> {formatDate(scrapedData.lastUpdated)}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">生活成本</h3>
                <p><span className="font-medium">住宿:</span> ${scrapedData.accommodation.monthly}/月</p>
                <p><span className="font-medium">餐饮:</span> ${scrapedData.food.monthly}/月</p>
                <p><span className="font-medium">交通:</span> ${scrapedData.transport.monthly}/月</p>
                <p><span className="font-medium">娱乐:</span> ${scrapedData.entertainment.monthly}/月</p>
                <p><span className="font-medium">总计:</span> ${scrapedData.total.monthly}/月</p>
              </div>
            </div>
            
            {scrapedData.rawData && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">原始数据</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(scrapedData.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">使用说明</h2>
          <div className="text-blue-700 dark:text-blue-300 space-y-2">
            <p>• <strong>缓存策略:</strong> 数据抓取成功后缓存6个月，避免频繁请求</p>
            <p>• <strong>手动抓取:</strong> 可以手动抓取特定城市的数据</p>
            <p>• <strong>批量抓取:</strong> 一次性抓取所有热门城市的数据</p>
            <p>• <strong>请求间隔:</strong> 每次请求间隔2秒，避免过于频繁</p>
            <p>• <strong>数据更新:</strong> 6个月后自动过期，可手动刷新</p>
          </div>
        </div>
      </div>
    </div>
  )
}
