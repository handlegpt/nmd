'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { City } from '@/lib/supabase'
import { FilterIcon, MapPinIcon, ClockIcon, DollarSignIcon } from 'lucide-react'

export interface UserPreferences {
  stayDuration: 'short' | 'medium' | 'long' // 1-3个月, 3-12个月, 1年以上
  purpose: 'leisure' | 'work' | 'business' // 休闲, 工作, 创业
  budget: 'budget' | 'standard' | 'premium' // 经济型, 标准型, 高端型
}

export interface CityMatch {
  city: City
  matchScore: number
  visaConvenience: number
  costEffectiveness: number
  workConvenience: number
  lifestyleQuality: number
  reasons: string[]
}

interface CityMatchFilterProps {
  cities: City[]
  onMatchResults: (matches: CityMatch[]) => void
  onReset: () => void
}

export default function CityMatchFilter({ cities, onMatchResults, onReset }: CityMatchFilterProps) {
  const { t } = useTranslation()
  const [preferences, setPreferences] = useState<UserPreferences>({
    stayDuration: 'medium',
    purpose: 'work',
    budget: 'standard'
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const calculateMatch = (city: City, prefs: UserPreferences): CityMatch => {
    let visaConvenience = 0
    let costEffectiveness = 0
    let workConvenience = 0
    let lifestyleQuality = 0
    const reasons: string[] = []

    // 签证便利性计算
    if (prefs.stayDuration === 'short' && (city.visa_days || 0) >= 30) {
      visaConvenience = 90
      reasons.push('旅游免签')
    } else if (prefs.stayDuration === 'medium' && (city.visa_days || 0) >= 90) {
      visaConvenience = 85
      reasons.push('长期旅游签证')
    } else if (city.visa_type?.includes('Digital Nomad')) {
      visaConvenience = 95
      reasons.push('数字游民签证')
    } else if (city.visa_type?.includes('Work')) {
      visaConvenience = 80
      reasons.push('工作签证')
    } else {
      visaConvenience = 50
      reasons.push('需要申请签证')
    }

    // 成本效益计算
    const cost = city.cost_of_living || 0
    if (prefs.budget === 'budget' && cost < 1000) {
      costEffectiveness = 95
      reasons.push('生活成本低')
    } else if (prefs.budget === 'standard' && cost >= 1000 && cost <= 3000) {
      costEffectiveness = 90
      reasons.push('生活成本适中')
    } else if (prefs.budget === 'premium' && cost > 3000) {
      costEffectiveness = 85
      reasons.push('高端生活品质')
    } else {
      costEffectiveness = 60
      reasons.push('生活成本可能不匹配')
    }

    // 工作便利性计算
    if (prefs.purpose === 'work') {
      if (city.wifi_speed && city.wifi_speed >= 50) {
        workConvenience += 30
        reasons.push('网络速度快')
      }
      if (city.timezone) {
        // 简单的时区便利性计算（以UTC+0为基准）
        const timezoneOffset = parseInt(city.timezone.replace('UTC', '')) || 0
        if (Math.abs(timezoneOffset) <= 3) {
          workConvenience += 25
          reasons.push('时区便利')
        } else if (Math.abs(timezoneOffset) <= 6) {
          workConvenience += 15
          reasons.push('时区适中')
        }
      }
      workConvenience += 40 // 基础分
    } else {
      workConvenience = 70 // 非工作目的的基础分
    }

    // 生活质量计算
    if (city.cost_of_living && city.cost_of_living < 2000) {
      lifestyleQuality += 30
    }
    if (city.wifi_speed && city.wifi_speed >= 30) {
      lifestyleQuality += 25
    }
    if ((city.visa_days || 0) >= 90) {
      lifestyleQuality += 25
    }
    lifestyleQuality += 20 // 基础分

    // 计算综合匹配度
    const matchScore = Math.round(
      (visaConvenience * 0.3 + 
       costEffectiveness * 0.25 + 
       workConvenience * 0.25 + 
       lifestyleQuality * 0.2)
    )

    return {
      city,
      matchScore,
      visaConvenience,
      costEffectiveness,
      workConvenience,
      lifestyleQuality,
      reasons
    }
  }

  const handleFindMatches = () => {
    const matches = cities
      .map(city => calculateMatch(city, preferences))
      .filter(match => match.matchScore >= 70) // 只显示匹配度70%以上的
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10) // 只显示前10个

    onMatchResults(matches)
  }

  const handleReset = () => {
    setPreferences({
      stayDuration: 'medium',
      purpose: 'work',
      budget: 'standard'
    })
    onReset()
  }

  return (
    <div className="card card-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{t('cities.smartMatch.title')}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          {isExpanded ? t('common.collapse') : t('common.expand')}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* 停留时间 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <ClockIcon className="h-4 w-4" />
              {t('cities.smartMatch.stayDuration')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'short', label: t('cities.smartMatch.shortTerm'), desc: '1-3个月' },
                { value: 'medium', label: t('cities.smartMatch.mediumTerm'), desc: '3-12个月' },
                { value: 'long', label: t('cities.smartMatch.longTerm'), desc: '1年以上' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPreferences(prev => ({ ...prev, stayDuration: option.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    preferences.stayDuration === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 主要目的 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <MapPinIcon className="h-4 w-4" />
              {t('cities.smartMatch.purpose')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'leisure', label: t('cities.smartMatch.leisure'), desc: t('cities.smartMatch.leisureDesc') },
                { value: 'work', label: t('cities.smartMatch.work'), desc: t('cities.smartMatch.workDesc') },
                { value: 'business', label: t('cities.smartMatch.business'), desc: t('cities.smartMatch.businessDesc') }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPreferences(prev => ({ ...prev, purpose: option.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    preferences.purpose === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 预算范围 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <DollarSignIcon className="h-4 w-4" />
              {t('cities.smartMatch.budget')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'budget', label: t('cities.smartMatch.budgetFriendly'), desc: '< $1000/月' },
                { value: 'standard', label: t('cities.smartMatch.standard'), desc: '$1000-3000/月' },
                { value: 'premium', label: t('cities.smartMatch.premium'), desc: '> $3000/月' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPreferences(prev => ({ ...prev, budget: option.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    preferences.budget === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleFindMatches}
              className="btn btn-primary flex-1"
            >
              {t('cities.smartMatch.findMatches')}
            </button>
            <button
              onClick={handleReset}
              className="btn btn-outline"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
