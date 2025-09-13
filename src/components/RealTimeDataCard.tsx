'use client'

import { useState, useEffect } from 'react'
import { 
  Cloud, 
  DollarSign, 
  Users, 
  Plane, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { 
  DataIntegrationService, 
  WeatherData, 
  ExchangeRateData, 
  CostOfLivingData, 
  NomadCommunityData 
} from '@/lib/dataIntegrationService'

interface RealTimeDataCardProps {
  city: string
  country: string
  userCurrency?: string
}

export default function RealTimeDataCard({ 
  city, 
  country, 
  userCurrency = 'USD' 
}: RealTimeDataCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null)
  const [costOfLiving, setCostOfLiving] = useState<CostOfLivingData | null>(null)
  const [community, setCommunity] = useState<NomadCommunityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadRealTimeData()
  }, [city, country, userCurrency])

  const loadRealTimeData = async () => {
    setLoading(true)
    try {
      const [weatherData, costData, communityData] = await Promise.all([
        DataIntegrationService.getWeatherData(city, country),
        DataIntegrationService.getCostOfLivingData(city, country),
        DataIntegrationService.getNomadCommunityData(city, country)
      ])

      setWeather(weatherData)
      setCostOfLiving(costData)
      setCommunity(communityData)

      // 获取汇率数据
      if (costData?.currency && costData.currency !== userCurrency) {
        const rateData = await DataIntegrationService.getExchangeRate(userCurrency, costData.currency)
        setExchangeRate(rateData)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading real-time data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    DataIntegrationService.clearCache()
    loadRealTimeData()
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      case 'partly-cloudy': return '⛅'
      default: return '🌤️'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (!exchangeRate || fromCurrency === toCurrency) return amount
    return amount * exchangeRate.rate
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">加载实时数据中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">实时数据</h3>
          <p className="text-sm text-gray-500">{city}, {country}</p>
        </div>
        <button
          onClick={refreshData}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="刷新数据"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather */}
        {weather && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">天气</span>
              </div>
              <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{weather.temperature}°C</div>
            <div className="text-sm text-gray-600 capitalize">{weather.condition}</div>
            <div className="text-xs text-gray-500 mt-1">
              湿度 {weather.humidity}% • 风速 {weather.windSpeed} km/h
            </div>
          </div>
        )}

        {/* Cost of Living */}
        {costOfLiving && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">生活成本</span>
              </div>
              <span className="text-xs text-gray-500">{costOfLiving.currency}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                convertCurrency(costOfLiving.categories.accommodation, costOfLiving.currency, userCurrency),
                userCurrency
              )}
            </div>
            <div className="text-sm text-gray-600">住宿/月</div>
            <div className="text-xs text-gray-500 mt-1">
              食物 {formatCurrency(
                convertCurrency(costOfLiving.categories.food, costOfLiving.currency, userCurrency),
                userCurrency
              )}/月
            </div>
          </div>
        )}

        {/* Community */}
        {community && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">社区</span>
              </div>
              <span className="text-xs text-gray-500">{community.communitySize} 人</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{community.coworkingSpaces}</div>
            <div className="text-sm text-gray-600">联合办公空间</div>
            <div className="text-xs text-gray-500 mt-1">
              {community.meetupFrequency} 聚会 • 平均年龄 {community.averageAge}
            </div>
          </div>
        )}

        {/* Exchange Rate */}
        {exchangeRate && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">汇率</span>
              </div>
              <span className="text-xs text-gray-500">{exchangeRate.from}/{exchangeRate.to}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{exchangeRate.rate.toFixed(2)}</div>
            <div className="text-sm text-gray-600">当前汇率</div>
            <div className="text-xs text-gray-500 mt-1">
              更新于 {new Date(exchangeRate.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      {(costOfLiving || community) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost Breakdown */}
            {costOfLiving && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">成本明细</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>交通</span>
                    <span>{formatCurrency(
                      convertCurrency(costOfLiving.categories.transportation, costOfLiving.currency, userCurrency),
                      userCurrency
                    )}/月</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>娱乐</span>
                    <span>{formatCurrency(
                      convertCurrency(costOfLiving.categories.entertainment, costOfLiving.currency, userCurrency),
                      userCurrency
                    )}/月</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>联合办公</span>
                    <span>{formatCurrency(
                      convertCurrency(costOfLiving.categories.coworking, costOfLiving.currency, userCurrency),
                      userCurrency
                    )}/月</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>网络</span>
                    <span>{formatCurrency(
                      convertCurrency(costOfLiving.categories.internet, costOfLiving.currency, userCurrency),
                      userCurrency
                    )}/月</span>
                  </div>
                </div>
              </div>
            )}

            {/* Community Details */}
            {community && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">社区信息</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>活跃活动</span>
                    <span>{community.activeEvents} 个</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>聚会频率</span>
                    <span>{community.meetupFrequency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>主要国籍</span>
                    <span>{community.topNationalities.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>最后更新: {lastUpdated.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>数据正常</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
