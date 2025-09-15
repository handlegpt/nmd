'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Calendar, 
  Globe, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Briefcase
} from 'lucide-react'
import NationalitySelector from './NationalitySelector'

interface VisaInfo {
  id: string
  country: string
  countryName: string
  visaName: string
  visaType: string
  durationMonths: number
  costUSD: number
  incomeRequirementUSD: number
  applicationTimeDays: number
  requirements: string
  benefits: string
  taxImplications: string
  renewalPossible: boolean
  maxRenewals: number
  isActive: boolean
}

interface SmartVisaInfoProps {
  countryCode: string
  countryName: string
  userNationality?: string
  className?: string
}

export default function SmartVisaInfo({ 
  countryCode, 
  countryName, 
  userNationality,
  className = '' 
}: SmartVisaInfoProps) {
  const { t } = useTranslation()
  const [visas, setVisas] = useState<VisaInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVisa, setSelectedVisa] = useState<VisaInfo | null>(null)
  const [showAllVisas, setShowAllVisas] = useState(false)
  const [userCountry, setUserCountry] = useState<string>(userNationality || '')
  const [showNationalitySelector, setShowNationalitySelector] = useState(false)

  useEffect(() => {
    fetchVisaInfo()
  }, [countryCode])

  useEffect(() => {
    // 尝试检测用户国籍
    if (!userNationality) {
      detectUserNationality()
    }
  }, [])

  const detectUserNationality = async () => {
    try {
      // 使用IP地理位置API检测用户国家
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      setUserCountry(data.country_code || 'US')
    } catch (error) {
      console.warn('无法检测用户国籍，使用默认值')
      setUserCountry('US') // 默认美国
    }
  }

  const fetchVisaInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nomad-visas?country=${countryCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.visas) {
          const visaList = data.data.visas
          setVisas(visaList)
          
          // 自动选择最相关的签证
          const bestVisa = selectBestVisa(visaList)
          setSelectedVisa(bestVisa)
        }
      }
    } catch (error) {
      console.error('获取签证信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectBestVisa = (visaList: VisaInfo[]): VisaInfo | null => {
    if (visaList.length === 0) return null
    
    // 优先选择数字游民签证
    const nomadVisas = visaList.filter(v => v.visaType === 'digital_nomad')
    if (nomadVisas.length > 0) {
      // 选择时间最长的数字游民签证
      return nomadVisas.reduce((best, current) => 
        current.durationMonths > best.durationMonths ? current : best
      )
    }
    
    // 如果没有数字游民签证，选择时间最长的
    return visaList.reduce((best, current) => 
      current.durationMonths > best.durationMonths ? current : best
    )
  }

  const getVisaTypeIcon = (visaType: string) => {
    switch (visaType) {
      case 'digital_nomad':
        return <Briefcase className="h-4 w-4" />
      case 'freelancer':
        return <Users className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getVisaTypeColor = (visaType: string) => {
    switch (visaType) {
      case 'digital_nomad':
        return 'bg-emerald-500'
      case 'freelancer':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getVisaTypeLabel = (visaType: string) => {
    switch (visaType) {
      case 'digital_nomad':
        return 'Digital Nomad Visa'
      case 'freelancer':
        return 'Freelancer Visa'
      default:
        return 'Other Visa'
    }
  }

  const formatDuration = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) {
        return `${years}y`
      }
      return `${years}y ${remainingMonths}mo`
    }
    return `${months}mo`
  }

  const getDifficultyLevel = (visa: VisaInfo) => {
    const incomeReq = visa.incomeRequirementUSD
    const appTime = visa.applicationTimeDays
    
    if (incomeReq <= 2000 && appTime <= 30) return { level: 'Easy', color: 'text-green-600' }
    if (incomeReq <= 5000 && appTime <= 60) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'Hard', color: 'text-red-600' }
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

  if (!selectedVisa && visas.length === 0) {
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Visa Information</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">Not Available</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No digital nomad visa data</p>
          </div>
        </div>
      </div>
    )
  }

  const difficulty = selectedVisa ? getDifficultyLevel(selectedVisa) : null

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        {/* 主要签证信息 */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Digital Nomad Visa</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {selectedVisa ? formatDuration(selectedVisa.durationMonths) : 'N/A'}
            </p>
            {difficulty && (
              <p className={`text-xs font-medium capitalize ${difficulty.color}`}>
                {difficulty.level} process
              </p>
            )}
          </div>
        </div>

        {/* 签证详情 */}
        {selectedVisa && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Application Fee</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${selectedVisa.costUSD}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Income Required</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${selectedVisa.incomeRequirementUSD.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Processing Time</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedVisa.applicationTimeDays} days
              </span>
            </div>

            {/* 签证类型标签 */}
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getVisaTypeColor(selectedVisa.visaType)} flex items-center space-x-1`}>
                {getVisaTypeIcon(selectedVisa.visaType)}
                <span>{getVisaTypeLabel(selectedVisa.visaType)}</span>
              </div>
              {selectedVisa.renewalPossible && (
                <div className="px-2 py-1 rounded-full text-xs font-medium text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Renewable</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 多个签证选项 */}
        {visas.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAllVisas(!showAllVisas)}
              className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>View all {visas.length} visa options</span>
              {showAllVisas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAllVisas && (
              <div className="mt-3 space-y-2">
                {visas.map((visa) => (
                  <div
                    key={visa.id}
                    onClick={() => setSelectedVisa(visa)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedVisa?.id === visa.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {visa.visaName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDuration(visa.durationMonths)} • ${visa.costUSD} • {visa.applicationTimeDays}d
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getVisaTypeColor(visa.visaType)}`}>
                        {visa.visaType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 用户国籍选择 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Visa information for:
              </span>
            </div>
            <button
              onClick={() => setShowNationalitySelector(!showNationalitySelector)}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showNationalitySelector ? 'Hide' : 'Change'}
            </button>
          </div>
          
          {showNationalitySelector ? (
            <NationalitySelector
              currentNationality={userCountry}
              onNationalityChange={setUserCountry}
            />
          ) : (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {userCountry ? `${userCountry} citizens` : 'Auto-detected nationality'}
              </span>
            </div>
          )}
        </div>

        {/* 了解更多链接 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            <ExternalLink className="h-4 w-4" />
            <span>Learn more about visa requirements</span>
          </button>
        </div>
      </div>
    </div>
  )
}
