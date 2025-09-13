'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { MapPin, DollarSign, Clock, Globe, Heart, Coffee, Wifi, Users, Brain } from 'lucide-react'

interface NomadPlanningFormProps {
  onSubmit: (data: any) => void
  loading?: boolean
}

export default function NomadPlanningForm({ onSubmit, loading = false }: NomadPlanningFormProps) {
  const { t } = useTranslation()
  
  // 移动端优化的输入样式
  const inputClasses = "w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base md:text-sm"
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2"
  
  // 表单状态
  const [formData, setFormData] = useState({
    // 基本信息
    nationality: 'CN',
    budget: 2000,
    duration: 6,
    startDate: '',
    useAI: false, // AI增强选项
    
    // 偏好设置
    preferences: {
      climate: [] as string[],
      activities: [] as string[],
      accommodation: 'standard',
      food: 'standard',
      social: 'medium',
      visa: 'convenient'
    },
    
    // 约束条件
    constraints: {
      maxCities: 3,
      minStayDays: 30,
      maxStayDays: 365,
      mustVisit: [] as string[],
      avoidCountries: [] as string[]
    }
  })

  // 预设场景
  const presetScenarios = [
    {
      id: 'budget_nomad',
      name: '预算型数字游民',
      description: '月预算$1500以下，追求性价比',
      icon: '💰',
      data: {
        budget: 1200,
        duration: 6,
        preferences: {
          climate: ['warm', 'tropical'],
          activities: ['coworking', 'exploring'],
          accommodation: 'budget',
          food: 'street_food',
          social: 'medium',
          visa: 'convenient'
        },
        constraints: {
          maxCities: 2,
          minStayDays: 60,
          maxStayDays: 180
        }
      }
    },
    {
      id: 'luxury_nomad',
      name: '高端数字游民',
      description: '月预算$4000以上，追求品质生活',
      icon: '🏖️',
      data: {
        budget: 5000,
        duration: 12,
        preferences: {
          climate: ['warm', 'mediterranean'],
          activities: ['luxury', 'wellness'],
          accommodation: 'luxury',
          food: 'fine_dining',
          social: 'high',
          visa: 'flexible'
        },
        constraints: {
          maxCities: 4,
          minStayDays: 30,
          maxStayDays: 365
        }
      }
    },
    {
      id: 'family_nomad',
      name: '家庭数字游民',
      description: '带孩子的数字游民家庭',
      icon: '👨‍👩‍👧‍👦',
      data: {
        budget: 3000,
        duration: 12,
        preferences: {
          climate: ['temperate', 'warm'],
          activities: ['family_friendly', 'education'],
          accommodation: 'family',
          food: 'healthy',
          social: 'medium',
          visa: 'stable'
        },
        constraints: {
          maxCities: 3,
          minStayDays: 90,
          maxStayDays: 365
        }
      }
    },
    {
      id: 'adventure_nomad',
      name: '冒险型数字游民',
      description: '喜欢探索新地方，追求刺激体验',
      icon: '🗺️',
      data: {
        budget: 2500,
        duration: 8,
        preferences: {
          climate: ['diverse'],
          activities: ['adventure', 'exploring', 'hiking'],
          accommodation: 'unique',
          food: 'local',
          social: 'high',
          visa: 'flexible'
        },
        constraints: {
          maxCities: 5,
          minStayDays: 15,
          maxStayDays: 90
        }
      }
    }
  ]

  // 选项数据
  const nationalityOptions = [
    { value: 'CN', label: '中国', flag: '🇨🇳' },
    { value: 'US', label: '美国', flag: '🇺🇸' },
    { value: 'GB', label: '英国', flag: '🇬🇧' },
    { value: 'DE', label: '德国', flag: '🇩🇪' },
    { value: 'FR', label: '法国', flag: '🇫🇷' },
    { value: 'JP', label: '日本', flag: '🇯🇵' },
    { value: 'KR', label: '韩国', flag: '🇰🇷' },
    { value: 'AU', label: '澳大利亚', flag: '🇦🇺' },
    { value: 'CA', label: '加拿大', flag: '🇨🇦' },
    { value: 'SG', label: '新加坡', flag: '🇸🇬' }
  ]

  const climateOptions = [
    { value: 'tropical', label: '热带', icon: '🌴' },
    { value: 'subtropical', label: '亚热带', icon: '🌞' },
    { value: 'temperate', label: '温带', icon: '🍂' },
    { value: 'mediterranean', label: '地中海', icon: '🌊' },
    { value: 'continental', label: '大陆性', icon: '🏔️' }
  ]

  const activityOptions = [
    { value: 'coworking', label: '联合办公', icon: '💻' },
    { value: 'exploring', label: '城市探索', icon: '🏛️' },
    { value: 'beach', label: '海滩生活', icon: '🏖️' },
    { value: 'hiking', label: '徒步旅行', icon: '🥾' },
    { value: 'culture', label: '文化体验', icon: '🎭' },
    { value: 'food', label: '美食探索', icon: '🍜' },
    { value: 'nightlife', label: '夜生活', icon: '🍻' },
    { value: 'wellness', label: '健康养生', icon: '🧘' },
    { value: 'adventure', label: '冒险运动', icon: '🏄' },
    { value: 'family_friendly', label: '亲子活动', icon: '👨‍👩‍👧‍👦' }
  ]

  // 应用预设场景
  const applyPreset = (preset: any) => {
    setFormData(prev => ({
      ...prev,
      ...preset.data
    }))
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  const handleConstraintChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value
      }
    }))
  }

  return (
    <div className="p-4 md:p-8">
      {/* 预设场景 */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
          <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-500" />
          快速开始 - 选择你的数字游民类型
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {presetScenarios.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-105 text-left group touch-manipulation"
            >
              <div className="text-xl md:text-2xl mb-2">{preset.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{preset.name}</h4>
              <p className="text-xs md:text-sm text-gray-600">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* 基本信息 */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
            <Globe className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500" />
            基本信息
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 国籍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                国籍
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className={inputClasses}
              >
                {nationalityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 月预算 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月预算 (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 计划时长 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计划时长 (月)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 偏好设置 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            偏好设置
          </h3>
          
          {/* 气候偏好 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              气候偏好
            </label>
            <div className="flex flex-wrap gap-2">
              {climateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const newClimate = formData.preferences.climate.includes(option.value)
                      ? formData.preferences.climate.filter(c => c !== option.value)
                      : [...formData.preferences.climate, option.value]
                    handlePreferenceChange('climate', newClimate)
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    formData.preferences.climate.includes(option.value)
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 活动偏好 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              活动偏好
            </label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const newActivities = formData.preferences.activities.includes(option.value)
                      ? formData.preferences.activities.filter(a => a !== option.value)
                      : [...formData.preferences.activities, option.value]
                    handlePreferenceChange('activities', newActivities)
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    formData.preferences.activities.includes(option.value)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 其他偏好 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住宿偏好
              </label>
              <select
                value={formData.preferences.accommodation}
                onChange={(e) => handlePreferenceChange('accommodation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="budget">经济型</option>
                <option value="standard">标准型</option>
                <option value="luxury">豪华型</option>
                <option value="unique">特色型</option>
                <option value="family">家庭型</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                饮食偏好
              </label>
              <select
                value={formData.preferences.food}
                onChange={(e) => handlePreferenceChange('food', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="street_food">街头美食</option>
                <option value="local">当地菜</option>
                <option value="international">国际菜</option>
                <option value="healthy">健康饮食</option>
                <option value="fine_dining">精致料理</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                社交偏好
              </label>
              <select
                value={formData.preferences.social}
                onChange={(e) => handlePreferenceChange('social', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">安静环境</option>
                <option value="medium">适中社交</option>
                <option value="high">活跃社交</option>
              </select>
            </div>
          </div>
        </div>

        {/* 约束条件 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-500" />
            约束条件
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大城市数量
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.constraints.maxCities}
                onChange={(e) => handleConstraintChange('maxCities', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最少停留天数
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={formData.constraints.minStayDays}
                onChange={(e) => handleConstraintChange('minStayDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最多停留天数
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={formData.constraints.maxStayDays}
                onChange={(e) => handleConstraintChange('maxStayDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* AI增强选项 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useAI"
              checked={formData.useAI}
              onChange={(e) => setFormData(prev => ({ ...prev, useAI: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="useAI" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Brain className="h-4 w-4 text-purple-600" />
              使用AI增强推荐
            </label>
          </div>
          <p className="text-xs text-gray-600 mt-2 ml-7">
            启用AI智能分析，提供更个性化的路线优化建议和深度洞察
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 md:px-8 py-4 md:py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base md:text-lg touch-manipulation"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{formData.useAI ? 'AI智能规划中...' : 'AI正在规划中...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>{formData.useAI ? '开始AI智能规划' : '开始AI规划'}</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
