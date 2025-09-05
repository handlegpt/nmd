'use client'

import { useState } from 'react'
import { SearchIcon, BookOpenIcon, CalendarIcon, GlobeIcon, DollarSignIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'

interface VisaGuide {
  id: string
  country: string
  countryCode: string
  visaType: string
  duration: string
  cost: string
  requirements: string[]
  process: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  processingTime: string
  // 新增字段
  region: 'europe' | 'asia' | 'americas' | 'africa' | 'oceania'
  incomeRequirement?: number // 月收入要求（美元）
  passportRestrictions?: string[] // 护照限制
  officialLink?: string // 官方申请链接
  embassyLink?: string // 大使馆链接
  lastUpdated: string // 最后更新时间
  category: 'tourist' | 'digital-nomad' | 'long-term' // 签证类型分类
}

const visaGuides: VisaGuide[] = [
  {
    id: '1',
    country: 'Portugal',
    countryCode: 'PT',
    visaType: 'Digital Nomad Visa',
    duration: '1 year (renewable)',
    cost: '€75',
    requirements: [
      'Monthly income of at least €2,800',
      'Health insurance',
      'Criminal record certificate',
      'Accommodation proof'
    ],
    process: [
      'Online application',
      'Submit required documents',
      'Pay application fee',
      'Wait for approval (2-4 weeks)'
    ],
    difficulty: 'medium',
    processingTime: '2-4 weeks',
    region: 'europe',
    incomeRequirement: 2800,
    officialLink: 'https://www.sef.pt/en/Pages/homepage.aspx',
    embassyLink: 'https://www.portugalconsulate.org/',
    lastUpdated: '2024-01-15',
    category: 'digital-nomad'
  },
  {
    id: '2',
    country: 'Thailand',
    countryCode: 'TH',
    visaType: 'Tourist Visa',
    duration: '60 days (extendable)',
    cost: '$40',
    requirements: [
      'Valid passport (6+ months validity)',
      'Round-trip ticket',
      'Accommodation proof',
      'Financial proof'
    ],
    process: [
      'Apply at embassy or consulate',
      'Submit application form and documents',
      'Pay visa fee',
      'Wait for approval (3-5 business days)'
    ],
    difficulty: 'easy',
    processingTime: '3-5 business days',
    region: 'asia',
    officialLink: 'https://www.thaiembassy.org/',
    embassyLink: 'https://www.thaiembassy.org/',
    lastUpdated: '2024-01-10',
    category: 'tourist'
  },
  {
    id: '3',
    country: 'Japan',
    countryCode: 'JP',
    visaType: 'Tourist Visa',
    duration: '90 days',
    cost: 'Free',
    requirements: [
      'Valid passport',
      'Round-trip ticket',
      'Accommodation proof',
      'Travel itinerary'
    ],
    process: [
      'Apply through designated travel agency',
      'Submit required documents',
      'Wait for approval (5-10 business days)',
      'Collect visa'
    ],
    difficulty: 'medium',
    processingTime: '5-10 business days',
    region: 'asia',
    officialLink: 'https://www.mofa.go.jp/',
    embassyLink: 'https://www.mofa.go.jp/',
    lastUpdated: '2024-01-12',
    category: 'tourist'
  },
  {
    id: '4',
    country: 'Mexico',
    countryCode: 'MX',
    visaType: 'Temporary Resident Visa',
    duration: '1 year (renewable)',
    cost: '$36',
    requirements: [
      'Monthly income of at least $2,500',
      'Bank statements (6 months)',
      'Criminal background check',
      'Health certificate'
    ],
    process: [
      'Apply at Mexican consulate',
      'Submit financial documents',
      'Attend interview',
      'Wait for approval (1-2 weeks)'
    ],
    difficulty: 'medium',
    processingTime: '1-2 weeks',
    region: 'americas',
    incomeRequirement: 2500,
    officialLink: 'https://www.gob.mx/',
    embassyLink: 'https://consulmex.sre.gob.mx/',
    lastUpdated: '2024-01-08',
    category: 'long-term'
  },
  {
    id: '5',
    country: 'Estonia',
    countryCode: 'EE',
    visaType: 'Digital Nomad Visa',
    duration: '1 year',
    cost: '€100',
    requirements: [
      'Monthly income of at least €3,504',
      'Valid health insurance',
      'Clean criminal record',
      'Proof of remote work'
    ],
    process: [
      'Apply online through e-Residency',
      'Submit digital documents',
      'Pay application fee',
      'Receive approval (2-4 weeks)'
    ],
    difficulty: 'easy',
    processingTime: '2-4 weeks',
    region: 'europe',
    incomeRequirement: 3504,
    officialLink: 'https://www.e-resident.gov.ee/',
    embassyLink: 'https://www.eest.ee/',
    lastUpdated: '2024-01-14',
    category: 'digital-nomad'
  },
  {
    id: '6',
    country: 'Croatia',
    countryCode: 'HR',
    visaType: 'Digital Nomad Visa',
    duration: '1 year',
    cost: '€60',
    requirements: [
      'Monthly income of at least €2,300',
      'Health insurance coverage',
      'Criminal record certificate',
      'Proof of remote work'
    ],
    process: [
      'Apply at Croatian embassy/consulate',
      'Submit required documents',
      'Pay application fee',
      'Wait for approval (2-3 weeks)'
    ],
    difficulty: 'medium',
    processingTime: '2-3 weeks',
    region: 'europe',
    incomeRequirement: 2300,
    officialLink: 'https://mvep.hr/',
    embassyLink: 'https://mvep.hr/',
    lastUpdated: '2024-01-11',
    category: 'digital-nomad'
  }
]

export default function VisaGuidePage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  // 新增状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [incomeRange, setIncomeRange] = useState<string>('all')
  const [userPassport, setUserPassport] = useState<string>('')
  const [userIncome, setUserIncome] = useState<number>(0)
  const [savedVisas, setSavedVisas] = useState<string[]>([])

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    return t(`visaGuide.difficulty.${difficulty}`)
  }

  // 新增辅助函数
  const getRegionText = (region: string) => {
    const regionMap: { [key: string]: string } = {
      'europe': 'Europe',
      'asia': 'Asia', 
      'americas': 'Americas',
      'africa': 'Africa',
      'oceania': 'Oceania'
    }
    return regionMap[region] || region
  }

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'tourist': 'Tourist Visa',
      'digital-nomad': 'Digital Nomad Visa',
      'long-term': 'Long-term Visa'
    }
    return categoryMap[category] || category
  }

  const getEligibilityStatus = (guide: VisaGuide) => {
    if (!userIncome || !guide.incomeRequirement) return 'unknown'
    if (userIncome >= guide.incomeRequirement) return 'eligible'
    return 'insufficient'
  }

  const toggleSaveVisa = (visaId: string) => {
    setSavedVisas(prev => 
      prev.includes(visaId) 
        ? prev.filter(id => id !== visaId)
        : [...prev, visaId]
    )
  }

  const filteredGuides = visaGuides.filter(guide => {
    const matchesSearch = guide.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.visaType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty
    const matchesDuration = selectedDuration === 'all' || guide.duration.includes(selectedDuration)
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    const matchesRegion = selectedRegion === 'all' || guide.region === selectedRegion
    
    // 收入筛选
    let matchesIncome = true
    if (incomeRange !== 'all' && guide.incomeRequirement) {
      switch (incomeRange) {
        case 'low':
          matchesIncome = guide.incomeRequirement <= 2000
          break
        case 'medium':
          matchesIncome = guide.incomeRequirement > 2000 && guide.incomeRequirement <= 3000
          break
        case 'high':
          matchesIncome = guide.incomeRequirement > 3000
          break
      }
    }
    
    return matchesSearch && matchesDifficulty && matchesDuration && matchesCategory && matchesRegion && matchesIncome
  })

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <BookOpenIcon className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            {t('visaGuide.title')}
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('visaGuide.subtitle')}
        </p>
      </div>

      {/* Personalization Section */}
      <div className="card card-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalize Your Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Passport Country</label>
            <input
              type="text"
              placeholder="e.g., United States"
              value={userPassport}
              onChange={(e) => setUserPassport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (USD)</label>
            <input
              type="number"
              placeholder="e.g., 3000"
              value={userIncome || ''}
              onChange={(e) => setUserIncome(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setUserPassport('')
                setUserIncome(0)
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card card-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('visaGuide.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="tourist">Tourist Visa</option>
              <option value="digital-nomad">Digital Nomad</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Regions</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="americas">Americas</option>
              <option value="africa">Africa</option>
              <option value="oceania">Oceania</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('visaGuide.filters.difficulty.all')}</option>
              <option value="easy">{t('visaGuide.filters.difficulty.easy')}</option>
              <option value="medium">{t('visaGuide.filters.difficulty.medium')}</option>
              <option value="hard">{t('visaGuide.filters.difficulty.hard')}</option>
            </select>
          </div>

          {/* Income Range Filter */}
          <div>
            <select
              value={incomeRange}
              onChange={(e) => setIncomeRange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Income Levels</option>
              <option value="low">≤ $2,000/month</option>
              <option value="medium">$2,000 - $3,000/month</option>
              <option value="high">&gt; $3,000/month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visa Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => {
          const eligibilityStatus = getEligibilityStatus(guide)
          const isSaved = savedVisas.includes(guide.id)
          
          return (
            <div key={guide.id} className="card card-lg hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getCountryFlag(guide.countryCode)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{guide.country}</h3>
                      <p className="text-gray-600">{getCategoryText(guide.category)}</p>
                      <p className="text-sm text-gray-500">{getRegionText(guide.region)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(guide.difficulty)}`}>
                      {getDifficultyText(guide.difficulty)}
                    </span>
                    {eligibilityStatus !== 'unknown' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        eligibilityStatus === 'eligible' 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-yellow-700 bg-yellow-100'
                      }`}>
                        {eligibilityStatus === 'eligible' ? '✅ Eligible' : '⚠️ Check Requirements'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{guide.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSignIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium">{guide.cost}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GlobeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Processing:</span>
                    <span className="font-medium">{guide.processingTime}</span>
                  </div>
                  {guide.incomeRequirement && (
                    <div className="flex items-center space-x-2">
                      <DollarSignIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Income Req:</span>
                      <span className="font-medium">${guide.incomeRequirement}/month</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleSaveVisa(guide.id)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSaved 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSaved ? '✓ Saved' : 'Save'}
                  </button>
                  {guide.officialLink && (
                    <a
                      href={guide.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {guide.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Application Process</h4>
                <div className="space-y-3">
                  {guide.process.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
                
                {/* Footer with last updated */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last updated: {guide.lastUpdated}</span>
                    {guide.embassyLink && (
                      <a
                        href={guide.embassyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Embassy Info →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('visaGuide.noResults.title')}
          </h3>
          <p className="text-gray-600">
            {t('visaGuide.noResults.description')}
          </p>
        </div>
      )}
    </PageLayout>
  )
}
