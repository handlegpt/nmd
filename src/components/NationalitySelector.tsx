'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Globe, 
  ChevronDown, 
  Check, 
  MapPin,
  AlertCircle
} from 'lucide-react'

interface Country {
  code: string
  name: string
  flag: string
}

interface NationalitySelectorProps {
  currentNationality?: string
  onNationalityChange: (nationality: string) => void
  className?: string
}

// 主要数字游民国籍列表
const MAJOR_NOMAD_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
]

export default function NationalitySelector({ 
  currentNationality, 
  onNationalityChange,
  className = '' 
}: NationalitySelectorProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  const selectedCountry = MAJOR_NOMAD_COUNTRIES.find(c => c.code === currentNationality)
  const filteredCountries = MAJOR_NOMAD_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    // 自动检测用户国籍
    if (!currentNationality) {
      detectUserNationality()
    }
  }, [currentNationality])

  const detectUserNationality = async () => {
    setIsDetecting(true)
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      if (data.country_code) {
        setDetectedCountry(data.country_code)
        // 自动设置为检测到的国籍
        onNationalityChange(data.country_code)
      }
    } catch (error) {
      console.warn('无法检测用户国籍:', error)
    } finally {
      setIsDetecting(false)
    }
  }

  const handleCountrySelect = (countryCode: string) => {
    onNationalityChange(countryCode)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleDetectedCountryAccept = () => {
    if (detectedCountry) {
      onNationalityChange(detectedCountry)
      setDetectedCountry(null)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 检测到的国籍提示 */}
      {detectedCountry && !currentNationality && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                检测到您可能来自 {MAJOR_NOMAD_COUNTRIES.find(c => c.code === detectedCountry)?.flag} {MAJOR_NOMAD_COUNTRIES.find(c => c.code === detectedCountry)?.name}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDetectedCountryAccept}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                确认
              </button>
              <button
                onClick={() => setDetectedCountry(null)}
                className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                手动选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 国籍选择器 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-500" />
            {selectedCountry ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {selectedCountry.name}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {isDetecting ? '检测中...' : '选择您的国籍'}
              </span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
            {/* 搜索框 */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="搜索国家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 国家列表 */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentNationality === country.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-left text-gray-900 dark:text-white">
                      {country.name}
                    </span>
                    {currentNationality === country.code && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                  未找到匹配的国家
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 说明文字 */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        选择您的国籍以获取准确的签证信息
      </p>
    </div>
  )
}
