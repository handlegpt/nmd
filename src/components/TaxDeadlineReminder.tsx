'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, AlertTriangle, CheckCircle, Download, Copy, Bell } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface TaxDeadline {
  id: string
  country: string
  flag: string
  deadline: string
  description: string
  type: 'urgent' | 'upcoming' | 'normal'
  daysUntil: number
  isCompleted: boolean
}

interface CountryDeadlines {
  country: string
  flag: string
  deadlines: TaxDeadline[]
}

export default function TaxDeadlineReminder() {
  const { t, locale } = useTranslation()
  const [selectedCountries, setSelectedCountries] = useState(['us', 'uk', 'ca'])
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([])
  const [showCompleted, setShowCompleted] = useState(false)

  const availableCountries = useMemo(() => [
    { id: 'us', name: t('tax.deadlines.countries.us'), flag: '🇺🇸' },
    { id: 'uk', name: t('tax.deadlines.countries.uk'), flag: '🇬🇧' },
    { id: 'ca', name: t('tax.deadlines.countries.ca'), flag: '🇨🇦' },
    { id: 'au', name: t('tax.deadlines.countries.au'), flag: '🇦🇺' },
    { id: 'ie', name: t('tax.deadlines.countries.ie'), flag: '🇮🇪' }
  ], [t, locale])

  const countryDeadlines: Record<string, TaxDeadline[]> = useMemo(() => ({
    us: [
      {
        id: 'us-annual',
        country: t('tax.deadlines.countries.us'),
        flag: '🇺🇸',
        deadline: '2025-04-15',
        description: t('tax.deadlines.descriptions.annualTaxReturn'),
        type: 'urgent',
        daysUntil: 45,
        isCompleted: false
      },
      {
        id: 'us-fbar',
        country: t('tax.deadlines.countries.us'),
        flag: '🇺🇸',
        deadline: '2025-04-15',
        description: t('tax.deadlines.descriptions.fbarFiling'),
        type: 'urgent',
        daysUntil: 45,
        isCompleted: false
      },
      {
        id: 'us-q1',
        country: t('tax.deadlines.countries.us'),
        flag: '🇺🇸',
        deadline: '2025-04-15',
        description: t('tax.deadlines.descriptions.q1EstimatedTax'),
        type: 'urgent',
        daysUntil: 45,
        isCompleted: false
      },
      {
        id: 'us-q2',
        country: t('tax.deadlines.countries.us'),
        flag: '🇺🇸',
        deadline: '2025-06-15',
        description: t('tax.deadlines.descriptions.q2EstimatedTax'),
        type: 'upcoming',
        daysUntil: 105,
        isCompleted: false
      }
    ],
    uk: [
      {
        id: 'uk-self-assessment',
        country: t('tax.deadlines.countries.uk'),
        flag: '🇬🇧',
        deadline: '2025-01-31',
        description: t('tax.deadlines.descriptions.selfAssessment'),
        type: 'normal',
        daysUntil: 0,
        isCompleted: true
      },
      {
        id: 'uk-payment',
        country: t('tax.deadlines.countries.uk'),
        flag: '🇬🇧',
        deadline: '2025-07-31',
        description: t('tax.deadlines.descriptions.taxPayment'),
        type: 'upcoming',
        daysUntil: 165,
        isCompleted: false
      }
    ],
    ca: [
      {
        id: 'ca-personal',
        country: t('tax.deadlines.countries.ca'),
        flag: '🇨🇦',
        deadline: '2025-04-30',
        description: t('tax.deadlines.descriptions.personalTaxReturn'),
        type: 'upcoming',
        daysUntil: 60,
        isCompleted: false
      },
      {
        id: 'ca-self-employed',
        country: t('tax.deadlines.countries.ca'),
        flag: '🇨🇦',
        deadline: '2025-06-15',
        description: t('tax.deadlines.descriptions.selfEmployedFiling'),
        type: 'upcoming',
        daysUntil: 105,
        isCompleted: false
      }
    ],
    au: [
      {
        id: 'au-personal',
        country: '澳大利亚',
        flag: '🇦🇺',
        deadline: '2025-10-31',
        description: '个人所得税申报',
        type: 'normal',
        daysUntil: 225,
        isCompleted: false
      }
    ],
    ie: [
      {
        id: 'ie-self-assessment',
        country: '爱尔兰',
        flag: '🇮🇪',
        deadline: '2025-10-31',
        description: '自我评估申报',
        type: 'normal',
        daysUntil: 225,
        isCompleted: false
      }
    ]
  }), [t, locale])

  useEffect(() => {
    const allDeadlines: TaxDeadline[] = []
    selectedCountries.forEach(countryId => {
      const countryDeadlineList = countryDeadlines[countryId] || []
      allDeadlines.push(...countryDeadlineList)
    })
    
    // 按紧急程度和日期排序
    const sortedDeadlines = allDeadlines.sort((a, b) => {
      if (a.type === 'urgent' && b.type !== 'urgent') return -1
      if (a.type !== 'urgent' && b.type === 'urgent') return 1
      return a.daysUntil - b.daysUntil
    })
    
    setDeadlines(sortedDeadlines)
  }, [selectedCountries])

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    )
  }

  const toggleDeadline = (deadlineId: string) => {
    setDeadlines(prev => 
      prev.map(deadline => 
        deadline.id === deadlineId 
          ? { ...deadline, isCompleted: !deadline.isCompleted }
          : deadline
      )
    )
  }

  const exportToCalendar = () => {
    const calendarData = deadlines
      .filter(d => !d.isCompleted)
      .map(deadline => {
        const date = new Date(deadline.deadline)
        return `BEGIN:VEVENT
DTSTART:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${deadline.country} - ${deadline.description}
DESCRIPTION:税务截止日期提醒
END:VEVENT`
      }).join('\n')

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nomad Now//Tax Deadlines//EN
${calendarData}
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tax-deadlines.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyUrgentDeadlines = () => {
    const urgentDeadlines = deadlines
      .filter(d => d.type === 'urgent' && !d.isCompleted)
      .map(d => `${d.country} ${d.flag} - ${d.description}: ${d.deadline}`)
      .join('\n')
    
    navigator.clipboard.writeText(urgentDeadlines)
  }

  const getStatusSummary = () => {
    const urgent = deadlines.filter(d => d.type === 'urgent' && !d.isCompleted).length
    const upcoming = deadlines.filter(d => d.type === 'upcoming' && !d.isCompleted).length
    const completed = deadlines.filter(d => d.isCompleted).length
    
    return { urgent, upcoming, completed }
  }

  const status = getStatusSummary()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">{t('tax.deadlines.title')}</h2>
      </div>

      {/* 国家选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('tax.deadlines.selectCountry')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {availableCountries.map(country => (
            <button
              key={country.id}
              onClick={() => toggleCountry(country.id)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedCountries.includes(country.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className="text-sm font-medium text-gray-900">{country.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 状态摘要 */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('tax.deadlines.statusSummary')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{status.urgent}</div>
            <div className="text-sm text-gray-600">{t('tax.deadlines.urgentDeadlines')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{status.upcoming}</div>
            <div className="text-sm text-gray-600">{t('tax.deadlines.upcomingDeadlines')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{status.completed}</div>
            <div className="text-sm text-gray-600">{t('tax.deadlines.completed')}</div>
          </div>
        </div>
        
        {status.urgent === 0 && status.upcoming === 0 && (
          <div className="mt-4 text-center text-green-600 font-medium">
            🎉 没有紧急的税务截止日期！
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={exportToCalendar}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>{t('tax.deadlines.exportToCalendar')}</span>
        </button>
        <button
          onClick={copyUrgentDeadlines}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Copy className="h-4 w-4" />
          <span>{t('tax.deadlines.copyUrgentDeadlines')}</span>
        </button>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          <span>{showCompleted ? t('tax.deadlines.hideCompleted') : t('tax.deadlines.showCompleted')}</span>
        </button>
      </div>

      {/* 截止日期列表 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('tax.deadlines.yourTaxDeadlines')}</h3>
        
        {deadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('tax.deadlines.selectCountryToView')}
          </div>
        ) : (
          deadlines
            .filter(d => showCompleted || !d.isCompleted)
            .map(deadline => (
              <div
                key={deadline.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  deadline.isCompleted
                    ? 'border-green-200 bg-green-50'
                    : deadline.type === 'urgent'
                    ? 'border-red-200 bg-red-50'
                    : deadline.type === 'upcoming'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{deadline.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900">{deadline.description}</div>
                      <div className="text-sm text-gray-600">{deadline.country}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{deadline.deadline}</div>
                      <div className={`text-sm ${
                        deadline.daysUntil <= 30 ? 'text-red-600' :
                        deadline.daysUntil <= 90 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {deadline.daysUntil === 0 ? t('tax.deadlines.dueToday') :
                         deadline.daysUntil < 0 ? `${Math.abs(deadline.daysUntil)}${t('tax.deadlines.daysAgo')}` :
                         `${deadline.daysUntil}${t('tax.deadlines.daysLeft')}`}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleDeadline(deadline.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deadline.isCompleted
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {deadline.isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {deadline.type === 'urgent' && !deadline.isCompleted && (
                  <div className="mt-3 flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('tax.deadlines.urgent')}</span>
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* 提醒提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 {t('tax.deadlines.reminderTips')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('tax.deadlines.reminderTip1')}</li>
          <li>• {t('tax.deadlines.reminderTip2')}</li>
          <li>• {t('tax.deadlines.reminderTip3')}</li>
          <li>• {t('tax.deadlines.reminderTip4')}</li>
        </ul>
      </div>

      {/* 免责声明 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">{t('tax.deadlines.disclaimer')}</h4>
            <p className="text-sm text-yellow-700">
              {t('tax.deadlines.disclaimerText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
