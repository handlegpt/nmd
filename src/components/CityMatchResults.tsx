'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { CityMatch } from './CityMatchFilter'
import { StarIcon, CheckCircleIcon, XCircleIcon, MinusIcon } from 'lucide-react'
import FixedLink from './FixedLink'

interface CityMatchResultsProps {
  matches: CityMatch[]
  onClose: () => void
}

export default function CityMatchResults({ matches, onClose }: CityMatchResultsProps) {
  const { t } = useTranslation()

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircleIcon className="h-4 w-4" />
    if (score >= 80) return <StarIcon className="h-4 w-4" />
    if (score >= 70) return <MinusIcon className="h-4 w-4" />
    return <XCircleIcon className="h-4 w-4" />
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  if (matches.length === 0) {
    return (
      <div className="card card-lg text-center py-12">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium mb-2">{t('cities.smartMatch.noMatches.title')}</h3>
          <p className="text-sm mb-4">{t('cities.smartMatch.noMatches.description')}</p>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 结果头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {t('cities.smartMatch.results.title')}
          </h3>
          <p className="text-gray-600">
            {t('cities.smartMatch.results.found', { count: matches.length.toString() })}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* 匹配结果列表 */}
      <div className="space-y-4">
        {matches.map((match, index) => (
          <div key={match.city.id} className="card card-md hover:shadow-lg transition-shadow">
            {/* 城市基本信息 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCountryFlag(match.city.country_code)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{match.city.name}</h4>
                    <p className="text-sm text-gray-600">{match.city.country}</p>
                  </div>
                </div>
              </div>
              
              {/* 匹配度评分 */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.matchScore)}`}>
                {getScoreIcon(match.matchScore)}
                {match.matchScore}%
              </div>
            </div>

            {/* 详细评分 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{match.visaConvenience}%</div>
                <div className="text-xs text-gray-500">{t('cities.smartMatch.visaConvenience')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{match.costEffectiveness}%</div>
                <div className="text-xs text-gray-500">{t('cities.smartMatch.costEffectiveness')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{match.workConvenience}%</div>
                <div className="text-xs text-gray-500">{t('cities.smartMatch.workConvenience')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">{match.lifestyleQuality}%</div>
                <div className="text-xs text-gray-500">{t('cities.smartMatch.lifestyleQuality')}</div>
              </div>
            </div>

            {/* 推荐理由 */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {t('cities.smartMatch.reasons')}:
              </h5>
              <div className="flex flex-wrap gap-2">
                {match.reasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* 城市详细信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">{t('cities.costOfLiving')}:</span>
                <div className="font-medium">${match.city.cost_of_living}/月</div>
              </div>
              <div>
                <span className="text-gray-500">{t('cities.wifiSpeed')}:</span>
                <div className="font-medium">{match.city.wifi_speed} Mbps</div>
              </div>
              <div>
                <span className="text-gray-500">{t('cities.visaType')}:</span>
                <div className="font-medium">{match.city.visa_type}</div>
              </div>
              <div>
                <span className="text-gray-500">{t('cities.stayDays')}:</span>
                <div className="font-medium">{match.city.visa_days} 天</div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <FixedLink
                href={`/cities/${match.city.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="btn btn-primary w-full"
              >
                {t('cities.viewDetails')}
              </FixedLink>
            </div>
          </div>
        ))}
      </div>

      {/* 底部操作 */}
      <div className="flex justify-center pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="btn btn-outline"
        >
          {t('cities.smartMatch.backToAll')}
        </button>
      </div>
    </div>
  )
}
