'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Target, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Award,
  UserCheck
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface Strategy {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  savings: string
  timeToImplement: string
  risk: 'low' | 'medium' | 'high'
  requirements: string[]
  steps: string[]
  tips: string[]
  category: 'tax-haven' | 'territorial' | 'company' | 'visa' | 'treaty'
  passportRestrictions?: string[]
  incomeRequirement?: string
  successRate: number
  popularity: number
  lastUpdated: string
  advisorAvailable: boolean
  advisorFee?: string
  relatedCountries: string[]
}

interface Advisor {
  id: string
  name: string
  specialization: string[]
  experience: string
  rating: number
  fee: string
  availability: 'available' | 'busy' | 'unavailable'
  languages: string[]
  contact: {
    email: string
    phone?: string
    website?: string
  }
}

export default function TaxStrategyGuide() {
  const { t } = useTranslation()
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showAdvisors, setShowAdvisors] = useState(false)

  const strategies: Strategy[] = [
    {
      id: 'nhr-portugal',
      title: t('tax.strategyGuide.strategies.nhrPortugal.title'),
      description: t('tax.strategyGuide.strategies.nhrPortugal.description'),
      difficulty: 'hard',
      savings: '$15,000-40,000/年',
      timeToImplement: '6-12个月',
      risk: 'medium',
      category: 'tax-haven',
      passportRestrictions: ['EU', 'US', 'UK', 'Canada'],
      incomeRequirement: '€75,000+/年',
      successRate: 25,
      popularity: 85,
      lastUpdated: '2024-01-15',
      advisorAvailable: true,
      advisorFee: '€2,000-5,000',
      relatedCountries: ['Portugal', 'Spain', 'Italy'],
      requirements: [
        t('tax.strategyGuide.strategies.nhrPlan.requirements.0'),
        t('tax.strategyGuide.strategies.nhrPlan.requirements.1'),
        t('tax.strategyGuide.strategies.nhrPlan.requirements.2'),
        t('tax.strategyGuide.strategies.nhrPlan.requirements.3'),
        t('tax.strategyGuide.strategies.nhrPlan.requirements.4'),
        t('tax.strategyGuide.strategies.nhrPlan.requirements.5')
      ],
      steps: [
        t('tax.strategyGuide.strategies.nhrPlan.steps.0'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.1'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.2'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.3'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.4'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.5'),
        t('tax.strategyGuide.strategies.nhrPlan.steps.6')
      ],
      tips: [
        t('tax.strategyGuide.strategies.nhrPlan.tips.0'),
        t('tax.strategyGuide.strategies.nhrPlan.tips.1'),
        t('tax.strategyGuide.strategies.nhrPlan.tips.2'),
        t('tax.strategyGuide.strategies.nhrPlan.tips.3'),
        t('tax.strategyGuide.strategies.nhrPlan.tips.4')
      ]
    },
    {
      id: 'territorial-tax',
      title: t('tax.strategyGuide.strategies.territorialTax.title'),
      description: t('tax.strategyGuide.strategies.territorialTax.description'),
      difficulty: 'easy',
      savings: '$10,000-30,000/年',
      timeToImplement: '1-3个月',
      risk: 'low',
      category: 'territorial',
      passportRestrictions: [],
      incomeRequirement: '无限制',
      successRate: 90,
      popularity: 95,
      lastUpdated: '2024-01-10',
      advisorAvailable: true,
      advisorFee: '$500-1,500',
      relatedCountries: ['Thailand', 'Mexico', 'Costa Rica', 'Malaysia'],
      requirements: [
        t('tax.strategyGuide.strategies.territorialTax.requirements.0'),
        t('tax.strategyGuide.strategies.territorialTax.requirements.1'),
        t('tax.strategyGuide.strategies.territorialTax.requirements.2'),
        t('tax.strategyGuide.strategies.territorialTax.requirements.3')
      ],
      steps: [
        t('tax.strategyGuide.strategies.territorialTax.steps.0'),
        t('tax.strategyGuide.strategies.territorialTax.steps.1'),
        t('tax.strategyGuide.strategies.territorialTax.steps.2'),
        t('tax.strategyGuide.strategies.territorialTax.steps.3'),
        t('tax.strategyGuide.strategies.territorialTax.steps.4'),
        t('tax.strategyGuide.strategies.territorialTax.steps.5')
      ],
      tips: [
        t('tax.strategyGuide.strategies.territorialTax.tips.0'),
        t('tax.strategyGuide.strategies.territorialTax.tips.1'),
        t('tax.strategyGuide.strategies.territorialTax.tips.2'),
        t('tax.strategyGuide.strategies.territorialTax.tips.3')
      ]
    },
    {
      id: 'company-structure',
      title: '公司结构优化',
      description: '通过离岸公司优化税务结构，适合高收入企业主',
      difficulty: 'hard',
      savings: '$20,000-60,000/年',
      timeToImplement: '6-12个月',
      risk: 'medium',
      category: 'company',
      passportRestrictions: [],
      incomeRequirement: '$100,000+/年',
      successRate: 70,
      popularity: 60,
      lastUpdated: '2024-01-12',
      advisorAvailable: true,
      advisorFee: '$5,000-15,000',
      relatedCountries: ['Estonia', 'Singapore', 'UAE', 'Cayman Islands'],
      requirements: [
        t('tax.strategyGuide.strategies.companyStructure.requirements.0'),
        t('tax.strategyGuide.strategies.companyStructure.requirements.1'),
        t('tax.strategyGuide.strategies.companyStructure.requirements.2'),
        t('tax.strategyGuide.strategies.companyStructure.requirements.3')
      ],
      steps: [
        t('tax.strategyGuide.strategies.companyStructure.steps.0'),
        t('tax.strategyGuide.strategies.companyStructure.steps.1'),
        t('tax.strategyGuide.strategies.companyStructure.steps.2'),
        t('tax.strategyGuide.strategies.companyStructure.steps.3'),
        t('tax.strategyGuide.strategies.companyStructure.steps.4'),
        t('tax.strategyGuide.strategies.companyStructure.steps.5')
      ],
      tips: [
        t('tax.strategyGuide.strategies.companyStructure.tips.0'),
        t('tax.strategyGuide.strategies.companyStructure.tips.1'),
        t('tax.strategyGuide.strategies.companyStructure.tips.2'),
        t('tax.strategyGuide.strategies.companyStructure.tips.3')
      ]
    },
    {
      id: 'digital-nomad-visa',
      title: '数字游民签证',
      description: '利用专门签证优化税务状况，简单易行',
      difficulty: 'easy',
      savings: '$5,000-20,000/年',
      timeToImplement: '2-4个月',
      risk: 'low',
      category: 'visa',
      passportRestrictions: [],
      incomeRequirement: '$2,000+/月',
      successRate: 95,
      popularity: 90,
      lastUpdated: '2024-01-08',
      advisorAvailable: true,
      advisorFee: '$300-800',
      relatedCountries: ['Estonia', 'Croatia', 'Portugal', 'Thailand'],
      requirements: [
        t('tax.strategyGuide.strategies.digitalNomadVisa.requirements.0'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.requirements.1'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.requirements.2'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.requirements.3')
      ],
      steps: [
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.0'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.1'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.2'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.3'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.4'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.steps.5')
      ],
      tips: [
        t('tax.strategyGuide.strategies.digitalNomadVisa.tips.0'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.tips.1'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.tips.2'),
        t('tax.strategyGuide.strategies.digitalNomadVisa.tips.3')
      ]
    },
    {
      id: 'tax-treaty-optimization',
      title: '税收协定优化',
      description: '利用双边税收协定减少双重征税',
      difficulty: 'medium',
      savings: '$8,000-25,000/年',
      timeToImplement: '3-6个月',
      risk: 'low',
      category: 'treaty',
      passportRestrictions: [],
      incomeRequirement: '无限制',
      successRate: 80,
      popularity: 70,
      lastUpdated: '2024-01-05',
      advisorAvailable: true,
      advisorFee: '$1,000-3,000',
      relatedCountries: ['Germany', 'France', 'Netherlands', 'Switzerland'],
      requirements: [
        t('tax.strategyGuide.strategies.taxTreatyOptimization.requirements.0'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.requirements.1'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.requirements.2'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.requirements.3')
      ],
      steps: [
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.0'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.1'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.2'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.3'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.4'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.steps.5')
      ],
      tips: [
        t('tax.strategyGuide.strategies.taxTreatyOptimization.tips.0'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.tips.1'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.tips.2'),
        t('tax.strategyGuide.strategies.taxTreatyOptimization.tips.3')
      ]
    }
  ]

  const advisors: Advisor[] = [
    {
      id: 'advisor-1',
      name: 'Maria Santos',
      specialization: ['Portugal NHR', 'EU Tax Law', 'International Tax'],
      experience: '15年经验',
      rating: 4.9,
      fee: '€200/小时',
      availability: 'available',
      languages: ['English', 'Portuguese', 'Spanish'],
      contact: {
        email: 'maria@taxadvisor.eu',
        phone: '+351 123 456 789',
        website: 'https://taxadvisor.eu'
      }
    },
    {
      id: 'advisor-2',
      name: 'James Chen',
      specialization: ['Territorial Tax', 'Digital Nomad', 'Asia Tax'],
      experience: '12年经验',
      rating: 4.8,
      fee: '$150/小时',
      availability: 'available',
      languages: ['English', 'Mandarin', 'Thai'],
      contact: {
        email: 'james@nomadtax.com',
        website: 'https://nomadtax.com'
      }
    },
    {
      id: 'advisor-3',
      name: 'Sarah Johnson',
      specialization: ['Company Structure', 'Offshore', 'US Tax'],
      experience: '18年经验',
      rating: 4.9,
      fee: '$300/小时',
      availability: 'busy',
      languages: ['English', 'French'],
      contact: {
        email: 'sarah@offshoretax.com',
        phone: '+1 555 123 4567'
      }
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax-haven': return 'text-purple-600 bg-purple-100'
      case 'territorial': return 'text-green-600 bg-green-100'
      case 'company': return 'text-blue-600 bg-blue-100'
      case 'visa': return 'text-orange-600 bg-orange-100'
      case 'treaty': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'busy': return 'text-yellow-600 bg-yellow-100'
      case 'unavailable': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredStrategies = strategies.filter(strategy => {
    const matchesDifficulty = filterDifficulty === 'all' || strategy.difficulty === filterDifficulty
    const matchesCategory = filterCategory === 'all' || strategy.category === filterCategory
    return matchesDifficulty && matchesCategory
  })

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)
  const selectedAdvisorData = advisors.find(a => a.id === selectedAdvisor)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('tax.strategyGuide.title')}</h2>
        </div>
        <button
          onClick={() => setShowAdvisors(!showAdvisors)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>{showAdvisors ? t('tax.strategyGuide.hideAdvisors') : t('tax.strategyGuide.viewAdvisors')}</span>
        </button>
      </div>

      {/* 筛选器 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('tax.strategyGuide.difficultyFilter')}</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('tax.strategyGuide.allDifficulties')}</option>
              <option value="easy">{t('tax.strategyGuide.difficulty.easy')}</option>
              <option value="medium">{t('tax.strategyGuide.difficulty.medium')}</option>
              <option value="hard">{t('tax.strategyGuide.difficulty.hard')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('tax.strategyGuide.strategyType')}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('tax.strategyGuide.allTypes')}</option>
              <option value="tax-haven">{t('tax.strategyGuide.categories.taxHaven')}</option>
              <option value="territorial">{t('tax.strategyGuide.categories.territorial')}</option>
              <option value="company">{t('tax.strategyGuide.categories.companyStructure')}</option>
              <option value="visa">{t('tax.strategyGuide.categories.visaStrategy')}</option>
              <option value="treaty">{t('tax.strategyGuide.categories.taxTreaty')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 策略选择 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredStrategies.map(strategy => (
          <div
            key={strategy.id}
            onClick={() => setSelectedStrategy(strategy.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedStrategy === strategy.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">{strategy.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(strategy.difficulty)}`}>
                {strategy.difficulty === 'easy' ? '简单' : strategy.difficulty === 'medium' ? '中等' : '困难'}
              </span>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">{strategy.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{strategy.savings}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>{strategy.timeToImplement}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(strategy.category)}`}>
                  {strategy.category === 'tax-haven' ? '税务天堂' :
                   strategy.category === 'territorial' ? '领土税制' :
                   strategy.category === 'company' ? '公司结构' :
                   strategy.category === 'visa' ? '签证策略' : '税收协定'}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">{strategy.popularity}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{t('tax.strategyGuide.successRate')}: {strategy.successRate}%</span>
                {strategy.advisorAvailable && (
                  <span className="text-green-600 text-xs">✓ {t('tax.strategyGuide.hasAdvisor')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 详细策略信息 */}
      {selectedStrategyData && (
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：基本信息 */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedStrategyData.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{selectedStrategyData.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">预期节省:</span>
                    <span className="font-semibold text-green-600">{selectedStrategyData.savings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">实施时间:</span>
                    <span className="font-semibold text-blue-600">{selectedStrategyData.timeToImplement}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">风险等级:</span>
                    <span className={`font-semibold ${getRiskColor(selectedStrategyData.risk)}`}>
                      {selectedStrategyData.risk === 'low' ? '低' : selectedStrategyData.risk === 'medium' ? '中' : '高'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('tax.strategyGuide.successRate')}:</span>
                    <span className="font-semibold text-purple-600">{selectedStrategyData.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">更新时间:</span>
                    <span className="font-semibold text-gray-600">{selectedStrategyData.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* 相关国家 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  相关国家
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStrategyData.relatedCountries.map((country, index) => (
                    <span key={index} className="px-2 py-1 bg-white rounded-full text-xs border">
                      {country}
                    </span>
                  ))}
                </div>
              </div>

              {/* 顾问服务 */}
              {selectedStrategyData.advisorAvailable && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    专业顾问服务
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    此策略有专业顾问提供服务
                  </p>
                  <div className="text-sm text-green-600 mb-3">
                    费用: {selectedStrategyData.advisorFee}
                  </div>
                  <button
                    onClick={() => setShowAdvisors(true)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    查看顾问
                  </button>
                </div>
              )}
            </div>

            {/* 右侧：详细信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 要求 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  {t('tax.strategyGuide.applicationRequirements')}
                </h4>
                <ul className="space-y-2">
                  {selectedStrategyData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 实施步骤 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-green-600" />
                  {t('tax.strategyGuide.implementationSteps')}
                </h4>
                <ol className="space-y-2">
                  {selectedStrategyData.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 实用建议 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  {t('tax.strategyGuide.practicalTips')}
                </h4>
                <ul className="space-y-2">
                  {selectedStrategyData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 顾问列表 */}
      {showAdvisors && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            专业税务顾问
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisors.map(advisor => (
              <div
                key={advisor.id}
                onClick={() => setSelectedAdvisor(advisor.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedAdvisor === advisor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{advisor.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(advisor.availability)}`}>
                    {advisor.availability === 'available' ? '可咨询' : 
                     advisor.availability === 'busy' ? '忙碌' : '不可用'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Award className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-600">{advisor.experience}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-gray-600">{advisor.rating}/5.0</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">{advisor.fee}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    专业领域: {advisor.specialization.join(', ')}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    语言: {advisor.languages.join(', ')}
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                    联系
                  </button>
                  <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                    详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 顾问详情 */}
      {selectedAdvisorData && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-blue-900">{selectedAdvisorData.name}</h4>
                <p className="text-sm text-blue-700">{selectedAdvisorData.experience}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{selectedAdvisorData.rating}/5.0</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(selectedAdvisorData.availability)}`}>
                  {selectedAdvisorData.availability === 'available' ? '可咨询' : 
                   selectedAdvisorData.availability === 'busy' ? '忙碌' : '不可用'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-semibold text-blue-900 mb-2">专业领域</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedAdvisorData.specialization.map((spec, index) => (
                    <span key={index} className="px-2 py-1 bg-white rounded-full text-xs border">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-blue-900 mb-2">语言能力</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedAdvisorData.languages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-white rounded-full text-xs border">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Mail className="h-4 w-4" />
                <span>发送邮件</span>
              </button>
              {selectedAdvisorData.contact.phone && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>电话咨询</span>
                </button>
              )}
              {selectedAdvisorData.contact.website && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  <span>访问网站</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}