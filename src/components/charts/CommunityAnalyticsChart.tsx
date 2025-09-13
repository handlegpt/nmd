'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Users, MapPin, Calendar, Globe, TrendingUp } from 'lucide-react'

interface CommunityData {
  city: string
  country: string
  communitySize: number
  activeEvents: number
  coworkingSpaces: number
  meetupFrequency: string
  averageAge: number
  topNationalities: string[]
}

interface CommunityAnalyticsChartProps {
  data: CommunityData[]
}

export default function CommunityAnalyticsChart({ data }: CommunityAnalyticsChartProps) {
  // 准备饼图数据 - 社区规模分布
  const communitySizeData = data.map(item => ({
    name: item.city,
    value: item.communitySize,
    country: item.country
  }))

  // 准备柱状图数据 - 联合办公空间对比
  const coworkingData = data.map(item => ({
    city: item.city,
    spaces: item.coworkingSpaces,
    events: item.activeEvents,
    community: item.communitySize
  }))

  // 准备年龄分布数据
  const ageData = data.map(item => ({
    city: item.city,
    averageAge: item.averageAge,
    communitySize: item.communitySize
  }))

  // 颜色配置
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

  // 自定义标签
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // 不显示小于5%的标签
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // 计算统计数据
  const totalCommunity = data.reduce((sum, item) => sum + item.communitySize, 0)
  const totalCoworkingSpaces = data.reduce((sum, item) => sum + item.coworkingSpaces, 0)
  const totalEvents = data.reduce((sum, item) => sum + item.activeEvents, 0)
  const averageAge = data.reduce((sum, item) => sum + item.averageAge, 0) / data.length

  // 获取最活跃的城市
  const mostActiveCity = data.reduce((max, city) => 
    city.activeEvents > max.activeEvents ? city : max, data[0]
  )

  // 获取最大的社区
  const largestCommunity = data.reduce((max, city) => 
    city.communitySize > max.communitySize ? city : max, data[0]
  )

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            数字游民社区分析
          </h3>
          <p className="text-sm text-gray-500">社区规模、活跃度和设施对比</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">总社区规模</div>
          <div className="text-lg font-semibold text-gray-900">
            {totalCommunity.toLocaleString()} 人
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-blue-900">{totalCommunity.toLocaleString()}</div>
          <div className="text-xs text-blue-700">总数字游民</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-green-900">{totalCoworkingSpaces}</div>
          <div className="text-xs text-green-700">联合办公空间</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-purple-900">{totalEvents}</div>
          <div className="text-xs text-purple-700">活跃活动</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-orange-900">{Math.round(averageAge)}</div>
          <div className="text-xs text-orange-700">平均年龄</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Size Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">社区规模分布</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={communitySizeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {communitySizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {communitySizeData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coworking Spaces Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">联合办公空间对比</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coworkingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="city" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="spaces" fill="#3b82f6" name="联合办公空间" radius={[2, 2, 0, 0]} />
                <Bar dataKey="events" fill="#10b981" name="活跃活动" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">年龄分布</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="city" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '年龄', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="averageAge" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">社区洞察</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-900">最大社区</div>
              <div className="text-xs text-blue-700">
                {largestCommunity.city} - {largestCommunity.communitySize.toLocaleString()} 人
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-green-900">最活跃城市</div>
              <div className="text-xs text-green-700">
                {mostActiveCity.city} - {mostActiveCity.activeEvents} 个活动
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
