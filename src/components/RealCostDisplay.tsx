'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  DollarSign, 
  Home, 
  Utensils, 
  Car, 
  Briefcase,
  TrendingUp,
  TrendingDown,
  Info,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { availableCostDataService, AvailableCostData } from '@/lib/availableCostDataService'

interface RealCostDisplayProps {
  city: string
  country: string
  className?: string
}

export default function RealCostDisplay({ 
  city, 
  country, 
  className = '' 
}: RealCostDisplayProps) {
  const { t } = useTranslation()
  const [costData, setCostData] = useState<AvailableCostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    fetchCostData()
  }, [city, country])

  const fetchCostData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await availableCostDataService.getCostData(city, country)
      setCostData(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to fetch cost data')
      console.error('Error fetching cost data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getDataQualityIcon = (quality: string) => {
    switch (quality) {
      case 'high': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'low': return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default: return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Numbeo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Benchmark': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Exchange-based': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (error || !costData) {
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">Data Unavailable</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unable to fetch cost data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        {/* 主要成本信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${costData.total.monthly.toLocaleString()}
              </p>
              <div className="flex items-center space-x-2">
                {getDataQualityIcon(costData.dataQuality)}
                <span className={`text-xs font-medium capitalize ${getDataQualityColor(costData.dataQuality)}`}>
                  {costData.dataQuality} quality
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchCostData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* 成本分解 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Accommodation</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(costData.accommodation.source)}`}>
                    {costData.accommodation.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(costData.accommodation.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                ${costData.accommodation.monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${costData.accommodation.daily.toFixed(0)}/day
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Food & Dining</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(costData.food.source)}`}>
                    {costData.food.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(costData.food.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                ${costData.food.monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${costData.food.daily.toFixed(0)}/day
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Transportation</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(costData.transport.source)}`}>
                    {costData.transport.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(costData.transport.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                ${costData.transport.monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${costData.transport.daily.toFixed(0)}/day
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500 text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Coworking</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(costData.coworking.source)}`}>
                    {costData.coworking.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(costData.coworking.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                ${costData.coworking.monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${costData.coworking.daily.toFixed(0)}/day
              </p>
            </div>
          </div>
        </div>

        {/* 数据来源信息 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>
                Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="h-3 w-3" />
              <span>
                Data sources: {costData.dataSources?.join(', ') || 'Multiple'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
