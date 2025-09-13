'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface CostData {
  city: string
  country: string
  accommodation: number
  food: number
  transportation: number
  entertainment: number
  coworking: number
  internet: number
  total: number
}

interface CostComparisonChartProps {
  data: CostData[]
  userCurrency?: string
  showTrends?: boolean
}

export default function CostComparisonChart({ 
  data, 
  userCurrency = 'USD',
  showTrends = true 
}: CostComparisonChartProps) {
  // 计算趋势
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0
    const first = values[0]
    const last = values[values.length - 1]
    return ((last - first) / first) * 100
  }

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // 准备图表数据
  const chartData = data.map(item => ({
    name: item.city,
    country: item.country,
    住宿: item.accommodation,
    食物: item.food,
    交通: item.transportation,
    娱乐: item.entertainment,
    联合办公: item.coworking,
    网络: item.internet,
    total: item.total
  }))

  // 计算平均成本
  const averageCosts = {
    accommodation: data.reduce((sum, item) => sum + item.accommodation, 0) / data.length,
    food: data.reduce((sum, item) => sum + item.food, 0) / data.length,
    transportation: data.reduce((sum, item) => sum + item.transportation, 0) / data.length,
    entertainment: data.reduce((sum, item) => sum + item.entertainment, 0) / data.length,
    coworking: data.reduce((sum, item) => sum + item.coworking, 0) / data.length,
    internet: data.reduce((sum, item) => sum + item.internet, 0) / data.length
  }

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-700 mt-2 border-t pt-2">
            总计: {formatCurrency(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            生活成本对比
          </h3>
          <p className="text-sm text-gray-500">各城市月度生活成本详细对比</p>
        </div>
        {showTrends && (
          <div className="text-right">
            <div className="text-sm text-gray-500">平均总成本</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.total, 0) / data.length)}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="住宿" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="食物" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="交通" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="娱乐" fill="#ef4444" radius={[2, 2, 0, 0]} />
            <Bar dataKey="联合办公" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="网络" fill="#06b6d4" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">成本明细分析</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(averageCosts).map(([category, average]) => {
            const categoryNames: { [key: string]: string } = {
              accommodation: '住宿',
              food: '食物',
              transportation: '交通',
              entertainment: '娱乐',
              coworking: '联合办公',
              internet: '网络'
            }
            
            return (
              <div key={category} className="text-center">
                <div className="text-sm text-gray-500">{categoryNames[category]}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(average)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      {showTrends && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">成本洞察</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-900">最经济城市</div>
                <div className="text-xs text-green-700">
                  {data.reduce((min, city) => city.total < min.total ? city : min, data[0])?.city}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-900">最高成本城市</div>
                <div className="text-xs text-red-700">
                  {data.reduce((max, city) => city.total > max.total ? city : max, data[0])?.city}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
