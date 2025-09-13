'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind } from 'lucide-react'

interface WeatherData {
  date: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
}

interface WeatherForecastChartProps {
  data: WeatherData[]
  city: string
  country: string
}

export default function WeatherForecastChart({ data, city, country }: WeatherForecastChartProps) {
  // 获取天气图标
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />
      case 'partly-cloudy': return <Cloud className="h-4 w-4 text-gray-400" />
      default: return <Sun className="h-4 w-4 text-yellow-400" />
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  // 准备图表数据
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    high: item.high,
    low: item.low,
    condition: item.condition,
    humidity: item.humidity,
    windSpeed: item.windSpeed,
    average: (item.high + item.low) / 2
  }))

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="flex items-center space-x-2 mb-2">
            {getWeatherIcon(data.condition)}
            <span className="text-sm text-gray-600 capitalize">{data.condition}</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-red-600">最高: {data.high}°C</span>
            </p>
            <p className="text-sm">
              <span className="text-blue-600">最低: {data.low}°C</span>
            </p>
            <p className="text-sm text-gray-600">
              湿度: {data.humidity}%
            </p>
            <p className="text-sm text-gray-600">
              风速: {data.windSpeed} km/h
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // 计算平均温度
  const averageHigh = data.reduce((sum, item) => sum + item.high, 0) / data.length
  const averageLow = data.reduce((sum, item) => sum + item.low, 0) / data.length
  const averageHumidity = data.reduce((sum, item) => sum + item.humidity, 0) / data.length

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
            7天天气预报
          </h3>
          <p className="text-sm text-gray-500">{city}, {country}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">平均温度</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(averageHigh)}°C / {Math.round(averageLow)}°C
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="highTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="lowTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
              tickFormatter={(value) => `${value}°C`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#highTemp)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#lowTemp)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weather Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Thermometer className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">温度范围</span>
          </div>
          <div className="text-lg font-semibold text-blue-900">
            {Math.round(Math.min(...data.map(d => d.low)))}°C - {Math.round(Math.max(...data.map(d => d.high)))}°C
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Droplets className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">平均湿度</span>
          </div>
          <div className="text-lg font-semibold text-green-900">
            {Math.round(averageHumidity)}%
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wind className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">平均风速</span>
          </div>
          <div className="text-lg font-semibold text-purple-900">
            {Math.round(data.reduce((sum, item) => sum + item.windSpeed, 0) / data.length)} km/h
          </div>
        </div>
      </div>

      {/* Daily Weather Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {chartData.map((day, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">{day.date}</div>
            <div className="flex justify-center mb-2">
              {getWeatherIcon(day.condition)}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {day.high}°C
            </div>
            <div className="text-xs text-gray-500">
              {day.low}°C
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {day.humidity}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
