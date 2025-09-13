'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  DollarSign, 
  Home, 
  Utensils, 
  Car, 
  Gamepad2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface CostBreakdownData {
  accommodation: number
  food: number
  transportation: number
  entertainment: number
  total: number
}

interface CostBreakdownChartProps {
  cityData: {
    cost_of_living?: number
    cost_min_usd?: number
    cost_max_usd?: number
    name: string
    country: string
  }
}

export default function CostBreakdownChart({ cityData }: CostBreakdownChartProps) {
  const { t } = useTranslation()
  const [breakdown, setBreakdown] = useState<CostBreakdownData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用获取成本分解数据
    const fetchCostBreakdown = async () => {
      setIsLoading(true)
      
      // 基于总成本计算各项分解（模拟数据）
      const total = cityData.cost_of_living || cityData.cost_min_usd || 0
      const accommodation = Math.round(total * 0.45) // 45% 住宿
      const food = Math.round(total * 0.25) // 25% 餐饮
      const transportation = Math.round(total * 0.15) // 15% 交通
      const entertainment = Math.round(total * 0.15) // 15% 娱乐
      
      setBreakdown({
        accommodation,
        food,
        transportation,
        entertainment,
        total
      })
      
      setIsLoading(false)
    }

    fetchCostBreakdown()
  }, [cityData.cost_of_living, cityData.cost_min_usd])

  const getCostCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation':
        return <Home className="h-5 w-5" />
      case 'food':
        return <Utensils className="h-5 w-5" />
      case 'transportation':
        return <Car className="h-5 w-5" />
      case 'entertainment':
        return <Gamepad2 className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getCostCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation':
        return 'bg-blue-500'
      case 'food':
        return 'bg-green-500'
      case 'transportation':
        return 'bg-purple-500'
      case 'entertainment':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCostCategoryLabel = (category: string) => {
    switch (category) {
      case 'accommodation':
        return t('cityDetail.costBreakdown.accommodation')
      case 'food':
        return t('cityDetail.costBreakdown.food')
      case 'transportation':
        return t('cityDetail.costBreakdown.transportation')
      case 'entertainment':
        return t('cityDetail.costBreakdown.entertainment')
      default:
        return category
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cityDetail.costBreakdown.title')}
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!breakdown) return null

  const categories = [
    { key: 'accommodation', value: breakdown.accommodation },
    { key: 'food', value: breakdown.food },
    { key: 'transportation', value: breakdown.transportation },
    { key: 'entertainment', value: breakdown.entertainment }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('cityDetail.costBreakdown.title')}
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${breakdown.total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('cityDetail.costBreakdown.perMonth')}
          </p>
        </div>
      </div>

      {/* 成本分解图表 */}
      <div className="mb-6">
        <div className="flex h-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {categories.map((category, index) => {
            const percentage = (category.value / breakdown.total) * 100
            return (
              <div
                key={category.key}
                className={`${getCostCategoryColor(category.key)} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
                title={`${getCostCategoryLabel(category.key)}: $${category.value} (${percentage.toFixed(1)}%)`}
              />
            )
          })}
        </div>
      </div>

      {/* 成本详情列表 */}
      <div className="space-y-3">
        {categories.map((category) => {
          const percentage = (category.value / breakdown.total) * 100
          return (
            <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCostCategoryColor(category.key)} text-white`}>
                  {getCostCategoryIcon(category.key)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getCostCategoryLabel(category.key)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {percentage.toFixed(1)}% {t('cityDetail.costBreakdown.ofTotal')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  ${category.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('cityDetail.costBreakdown.perMonth')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 成本趋势提示 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {t('cityDetail.costBreakdown.trend')}
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {t('cityDetail.costBreakdown.trendDescription', { 
            city: cityData.name,
            country: cityData.country 
          })}
        </p>
      </div>
    </div>
  )
}
