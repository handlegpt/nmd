'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Globe } from 'lucide-react'

interface TrendData {
  date: string
  cost: number
  community: number
  events: number
  temperature: number
  exchangeRate: number
}

interface TrendAnalysisChartProps {
  data: TrendData[]
  city: string
  country: string
  metrics: string[]
}

export default function TrendAnalysisChart({ 
  data, 
  city, 
  country, 
  metrics = ['cost', 'community', 'events'] 
}: TrendAnalysisChartProps) {
  // 计算趋势
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { direction: 'stable', percentage: 0 }
    
    const first = values[0]
    const last = values[values.length - 1]
    const percentage = ((last - first) / first) * 100
    
    if (percentage > 5) return { direction: 'up', percentage: Math.abs(percentage) }
    if (percentage < -5) return { direction: 'down', percentage: Math.abs(percentage) }
    return { direction: 'stable', percentage: Math.abs(percentage) }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  // 准备图表数据
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    cost: item.cost,
    community: item.community,
    events: item.events,
    temperature: item.temperature,
    exchangeRate: item.exchangeRate
  }))

  // 计算各指标趋势
  const costTrend = calculateTrend(data.map(d => d.cost))
  const communityTrend = calculateTrend(data.map(d => d.community))
  const eventsTrend = calculateTrend(data.map(d => d.events))
  const temperatureTrend = calculateTrend(data.map(d => d.temperature))

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === 'cost' && ' USD'}
              {entry.dataKey === 'temperature' && '°C'}
              {entry.dataKey === 'exchangeRate' && ' rate'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // 获取趋势图标和颜色
  const getTrendIcon = (trend: { direction: string; percentage: number }) => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: { direction: string; percentage: number }) => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // 计算平均值
  const averageCost = data.reduce((sum, item) => sum + item.cost, 0) / data.length
  const averageCommunity = data.reduce((sum, item) => sum + item.community, 0) / data.length
  const averageEvents = data.reduce((sum, item) => sum + item.events, 0) / data.length
  const averageTemperature = data.reduce((sum, item) => sum + item.temperature, 0) / data.length

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            趋势分析
          </h3>
          <p className="text-sm text-gray-500">{city}, {country} - 过去30天趋势</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">数据更新</div>
          <div className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            {getTrendIcon(costTrend)}
          </div>
          <div className="text-sm text-gray-500">生活成本</div>
          <div className="text-lg font-semibold text-gray-900">
            ${Math.round(averageCost)}
          </div>
          <div className={`text-xs ${getTrendColor(costTrend)}`}>
            {costTrend.direction === 'up' ? '+' : costTrend.direction === 'down' ? '-' : '='}
            {costTrend.percentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            {getTrendIcon(communityTrend)}
          </div>
          <div className="text-sm text-gray-500">社区规模</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(averageCommunity)}
          </div>
          <div className={`text-xs ${getTrendColor(communityTrend)}`}>
            {communityTrend.direction === 'up' ? '+' : communityTrend.direction === 'down' ? '-' : '='}
            {communityTrend.percentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-4 w-4 text-purple-600" />
            {getTrendIcon(eventsTrend)}
          </div>
          <div className="text-sm text-gray-500">活跃活动</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(averageEvents)}
          </div>
          <div className={`text-xs ${getTrendColor(eventsTrend)}`}>
            {eventsTrend.direction === 'up' ? '+' : eventsTrend.direction === 'down' ? '-' : '='}
            {eventsTrend.percentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-4 w-4 text-orange-600" />
            {getTrendIcon(temperatureTrend)}
          </div>
          <div className="text-sm text-gray-500">平均温度</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(averageTemperature)}°C
          </div>
          <div className={`text-xs ${getTrendColor(temperatureTrend)}`}>
            {temperatureTrend.direction === 'up' ? '+' : temperatureTrend.direction === 'down' ? '-' : '='}
            {temperatureTrend.percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="communityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              yAxisId="left"
            />
            <YAxis 
              orientation="right" 
              yAxisId="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {metrics.includes('cost') && (
              <>
                <ReferenceLine yAxisId="left" y={averageCost} stroke="#10b981" strokeDasharray="5 5" />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#costGradient)"
                  strokeWidth={2}
                  name="生活成本 (USD)"
                />
              </>
            )}
            
            {metrics.includes('community') && (
              <>
                <ReferenceLine yAxisId="right" y={averageCommunity} stroke="#3b82f6" strokeDasharray="5 5" />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="community"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#communityGradient)"
                  strokeWidth={2}
                  name="社区规模"
                />
              </>
            )}
            
            {metrics.includes('events') && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="events"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#eventsGradient)"
                strokeWidth={2}
                name="活跃活动"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">趋势洞察</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">成本趋势</div>
            <div className="text-xs text-blue-700">
              {costTrend.direction === 'up' 
                ? `生活成本上涨 ${costTrend.percentage.toFixed(1)}%，建议关注预算变化`
                : costTrend.direction === 'down'
                ? `生活成本下降 ${costTrend.percentage.toFixed(1)}%，适合长期居住`
                : '生活成本保持稳定，适合规划长期预算'
              }
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-1">社区趋势</div>
            <div className="text-xs text-green-700">
              {communityTrend.direction === 'up'
                ? `社区规模增长 ${communityTrend.percentage.toFixed(1)}%，网络机会增加`
                : communityTrend.direction === 'down'
                ? `社区规模减少 ${communityTrend.percentage.toFixed(1)}%，可能需要寻找其他社交渠道`
                : '社区规模保持稳定，社交环境相对稳定'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
