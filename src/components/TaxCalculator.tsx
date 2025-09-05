'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar, Globe, Clock, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Target } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface TaxCalculation {
  country: string
  flag: string
  annualIncome: number
  taxRate: number
  taxAmount: number
  netIncome: number
  savings: number
  effectiveRate: number
  feieEligible: boolean
  feieSavings: number
  category: 'tax-haven' | 'moderate' | 'high-tax'
  visaDifficulty: 'easy' | 'medium' | 'hard'
  costOfLiving: 'low' | 'medium' | 'high'
  digitalNomadFriendly: boolean
}

interface FEIECalculation {
  annualIncome: number
  taxYear: '2024' | '2025'
  feieLimit: number
  taxableIncome: number
  taxSavings: number
  effectiveRate: number
}

interface PresenceTracker {
  startDate: string
  endDate: string
  daysOutsideUS: number
  daysRequired: number
  progress: number
  isEligible: boolean
}

interface ResidencyTracker {
  country: string
  flag: string
  daysSpent: number
  limit: number
  remaining: number
  status: 'safe' | 'warning' | 'danger'
}

export default function TaxCalculator() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'calculator' | 'feie' | 'presence' | 'residency'>('calculator')
  const [annualIncome, setAnnualIncome] = useState(100000)
  const [selectedCountries, setSelectedCountries] = useState(['portugal', 'thailand', 'mexico'])
  const [calculations, setCalculations] = useState<TaxCalculation[]>([])
  const [feieCalculation, setFeieCalculation] = useState<FEIECalculation | null>(null)
  const [presenceTracker, setPresenceTracker] = useState<PresenceTracker | null>(null)
  const [residencyTrackers, setResidencyTrackers] = useState<ResidencyTracker[]>([])

  const countries = [
    { 
      id: 'portugal', 
      name: t('tax.calculator.countries.portugal'), 
      flag: '🇵🇹', 
      nhrRate: 0.20, 
      standardRate: 0.48, 
      note: t('tax.calculator.countryNotes.portugal'),
      category: 'tax-haven' as const,
      visaDifficulty: 'medium' as const,
      costOfLiving: 'medium' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'thailand', 
      name: t('tax.calculator.countries.thailand'), 
      flag: '🇹🇭', 
      nhrRate: 0, 
      standardRate: 0.35, 
      note: t('tax.calculator.countryNotes.thailand'),
      category: 'tax-haven' as const,
      visaDifficulty: 'easy' as const,
      costOfLiving: 'low' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'mexico', 
      name: t('tax.calculator.countries.mexico'), 
      flag: '🇲🇽', 
      nhrRate: 0, 
      standardRate: 0.35, 
      note: t('tax.calculator.countryNotes.mexico'),
      category: 'moderate' as const,
      visaDifficulty: 'easy' as const,
      costOfLiving: 'low' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'spain', 
      name: t('tax.calculator.countries.spain'), 
      flag: '🇪🇸', 
      nhrRate: 0.24, 
      standardRate: 0.47, 
      note: t('tax.calculator.countryNotes.spain'),
      category: 'high-tax' as const,
      visaDifficulty: 'medium' as const,
      costOfLiving: 'medium' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'germany', 
      name: t('tax.calculator.countries.germany'), 
      flag: '🇩🇪', 
      nhrRate: 0.45, 
      standardRate: 0.45, 
      note: t('tax.calculator.countryNotes.germany'),
      category: 'high-tax' as const,
      visaDifficulty: 'hard' as const,
      costOfLiving: 'high' as const,
      digitalNomadFriendly: false
    },
    { 
      id: 'estonia', 
      name: t('tax.calculator.countries.estonia'), 
      flag: '🇪🇪', 
      nhrRate: 0.20, 
      standardRate: 0.20, 
      note: t('tax.calculator.countryNotes.estonia'),
      category: 'moderate' as const,
      visaDifficulty: 'easy' as const,
      costOfLiving: 'medium' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'costa-rica', 
      name: t('tax.calculator.countries.costaRica'), 
      flag: '🇨🇷', 
      nhrRate: 0.25, 
      standardRate: 0.25, 
      note: t('tax.calculator.countryNotes.costaRica'),
      category: 'moderate' as const,
      visaDifficulty: 'easy' as const,
      costOfLiving: 'medium' as const,
      digitalNomadFriendly: true
    },
    { 
      id: 'malaysia', 
      name: t('tax.calculator.countries.malaysia'), 
      flag: '🇲🇾', 
      nhrRate: 0.30, 
      standardRate: 0.30, 
      note: t('tax.calculator.countryNotes.malaysia'),
      category: 'moderate' as const,
      visaDifficulty: 'medium' as const,
      costOfLiving: 'low' as const,
      digitalNomadFriendly: true
    }
  ]

  // FEIE 计算
  const calculateFEIE = (income: number, taxYear: '2024' | '2025') => {
    const feieLimit = taxYear === '2024' ? 126500 : 130000
    const taxableIncome = Math.max(0, income - feieLimit)
    
    // 简化的美国税率计算（实际应该更复杂）
    let taxRate = 0.22
    if (taxableIncome > 50000) taxRate = 0.24
    if (taxableIncome > 100000) taxRate = 0.32
    
    const taxSavings = Math.min(income, feieLimit) * taxRate
    const effectiveRate = ((income - feieLimit) * taxRate / income) * 100

    return {
      annualIncome: income,
      taxYear,
      feieLimit,
      taxableIncome,
      taxSavings,
      effectiveRate
    }
  }

  // 物理存在测试计算
  const calculatePresence = (startDate: string, endDate: string, daysOutside: number) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const progress = (daysOutside / 330) * 100
    const isEligible = daysOutside >= 330

    return {
      startDate,
      endDate,
      daysOutsideUS: daysOutside,
      daysRequired: 330,
      progress,
      isEligible
    }
  }

  // 税务居民追踪
  const calculateResidency = (country: string, daysSpent: number) => {
    const limit = 183
    const remaining = limit - daysSpent
    let status: 'safe' | 'warning' | 'danger' = 'safe'
    
    if (daysSpent >= limit * 0.8) status = 'warning'
    if (daysSpent >= limit) status = 'danger'

    return {
      country,
      flag: countries.find(c => c.name === country)?.flag || '🌍',
      daysSpent,
      limit,
      remaining,
      status
    }
  }

  const calculateTax = () => {
    const results = selectedCountries.map(countryId => {
      const country = countries.find(c => c.id === countryId)
      if (!country) return null

      const taxRate = country.nhrRate > 0 ? country.nhrRate : country.standardRate
      const taxAmount = annualIncome * taxRate
      const netIncome = annualIncome - taxAmount
      const savings = annualIncome * 0.45 - taxAmount // 假设美国45%税率作为基准
      const effectiveRate = (taxAmount / annualIncome) * 100

      // FEIE 资格检查
      const feieEligible = annualIncome <= 130000
      const feieSavings = feieEligible ? Math.min(annualIncome, 130000) * 0.22 : 0

      return {
        country: country.name,
        flag: country.flag,
        annualIncome,
        taxRate,
        taxAmount,
        netIncome,
        savings,
        effectiveRate,
        feieEligible,
        feieSavings,
        category: country.category,
        visaDifficulty: country.visaDifficulty,
        costOfLiving: country.costOfLiving,
        digitalNomadFriendly: country.digitalNomadFriendly
      }
    }).filter(Boolean) as TaxCalculation[]

    setCalculations(results)
  }

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    )
  }

  // 自动计算
  useEffect(() => {
    if (activeTab === 'calculator') {
      calculateTax()
    }
  }, [annualIncome, selectedCountries, activeTab])

  useEffect(() => {
    if (activeTab === 'feie') {
      setFeieCalculation(calculateFEIE(annualIncome, '2025'))
    }
  }, [annualIncome, activeTab])

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax-haven': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high-tax': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // 获取生活成本颜色
  const getCostOfLivingColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'calculator'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calculator className="h-4 w-4 inline mr-2" />
          {t('tax.calculator.tabs.calculator')}
        </button>
        <button
          onClick={() => setActiveTab('feie')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'feie'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign className="h-4 w-4 inline mr-2" />
          {t('tax.calculator.tabs.feie')}
        </button>
        <button
          onClick={() => setActiveTab('presence')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'presence'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          {t('tax.calculator.tabs.presence')}
        </button>
        <button
          onClick={() => setActiveTab('residency')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'residency'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          {t('tax.calculator.tabs.residency')}
        </button>
      </div>

      {/* 收入输入 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('tax.calculator.annualIncome')} (USD)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('tax.calculator.annualIncomePlaceholder')}
          />
        </div>
      </div>

      {/* 税务计算器标签页 */}
      {activeTab === 'calculator' && (
        <>
          {/* 国家选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('tax.calculator.selectCountries')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {countries.map(country => (
                <button
                  key={country.id}
                  onClick={() => toggleCountry(country.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedCountries.includes(country.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="text-sm font-medium text-gray-900">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.note}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getCategoryColor(country.category)}`}>
                      {country.category === 'tax-haven' ? t('tax.categories.taxHaven') : 
                       country.category === 'moderate' ? t('tax.categories.moderate') : t('tax.categories.highTax')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 计算结果 */}
          {calculations.length > 0 && (
            <div className="space-y-6">
              {/* 概览卡片 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  {t('tax.calculator.overview.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.max(...calculations.map(c => c.savings)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{t('tax.calculator.overview.maxSavings')}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculations.length}
                    </div>
                    <div className="text-sm text-gray-600">{t('tax.calculator.overview.countryCount')}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.min(...calculations.map(c => c.effectiveRate)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">{t('tax.calculator.overview.lowestRate')}</div>
                  </div>
                </div>
              </div>

              {/* 详细结果 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  详细计算结果
                </h3>
                {calculations.map((calc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{calc.flag}</span>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{calc.country}</h4>
                          <div className="flex space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(calc.category)}`}>
                              {calc.category === 'tax-haven' ? '税务天堂' : 
                               calc.category === 'moderate' ? '中等税率' : '高税率'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(calc.visaDifficulty)}`}>
                              {calc.visaDifficulty === 'easy' ? '签证容易' : 
                               calc.visaDifficulty === 'medium' ? '签证中等' : '签证困难'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCostOfLivingColor(calc.costOfLiving)}`}>
                              {calc.costOfLiving === 'low' ? '生活成本低' : 
                               calc.costOfLiving === 'medium' ? '生活成本中' : '生活成本高'}
                            </span>
                            {calc.digitalNomadFriendly && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100">
                                数字游民友好
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">有效税率</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {calc.effectiveRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 mb-1">年收入</div>
                        <div className="font-semibold text-lg">${calc.annualIncome.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-gray-500 mb-1">税额</div>
                        <div className="font-semibold text-lg text-red-600">
                          ${calc.taxAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-gray-500 mb-1">净收入</div>
                        <div className="font-semibold text-lg text-green-600">
                          ${calc.netIncome.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-gray-500 mb-1">节税金额</div>
                        <div className="font-semibold text-lg text-blue-600">
                          ${calc.savings.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* 可视化进度条 */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">税率对比</span>
                        <span className="font-medium">{calc.effectiveRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            calc.effectiveRate < 20 ? 'bg-green-500' :
                            calc.effectiveRate < 35 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(calc.effectiveRate * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {calc.feieEligible && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            FEIE 适用：可节省 ${calc.feieSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 推荐排序 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  推荐排序（按节税潜力）
                </h3>
                <div className="space-y-3">
                  {calculations
                    .sort((a, b) => b.savings - a.savings)
                    .map((calc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-2xl">{calc.flag}</span>
                        <span className="font-medium">{calc.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${calc.savings.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calc.effectiveRate.toFixed(1)}% 税率
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FEIE计算器标签页 */}
      {activeTab === 'feie' && feieCalculation && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              FEIE 资格检查
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="text-sm text-blue-700 mb-1">年收入</div>
                <div className="text-xl font-semibold">${feieCalculation.annualIncome.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-sm text-blue-700 mb-1">FEIE 限额 ({feieCalculation.taxYear})</div>
                <div className="text-xl font-semibold">${feieCalculation.feieLimit.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-sm text-blue-700 mb-1">应税收入</div>
                <div className="text-xl font-semibold">${feieCalculation.taxableIncome.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-sm text-blue-700 mb-1">潜在节省</div>
                <div className="text-xl font-semibold text-green-600">
                  ${feieCalculation.taxSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">重要提醒</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 必须满足物理存在测试（330天）或真实居所测试</li>
                  <li>• 仅适用于美国联邦所得税，不包括州税</li>
                  <li>• 需要咨询税务专业人士确认资格</li>
                  <li>• 实际节省金额取决于具体情况</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 物理存在测试标签页 */}
      {activeTab === 'presence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">测试期间开始</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const startDate = e.target.value
                  const endDate = new Date(startDate)
                  endDate.setFullYear(endDate.getFullYear() + 1)
                  setPresenceTracker(calculatePresence(startDate, endDate.toISOString().split('T')[0], 300))
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">测试期间结束</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={presenceTracker?.endDate || ''}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">在美国境外天数</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入天数"
              onChange={(e) => {
                if (presenceTracker) {
                  setPresenceTracker(calculatePresence(
                    presenceTracker.startDate,
                    presenceTracker.endDate,
                    Number(e.target.value)
                  ))
                }
              }}
            />
          </div>

          {presenceTracker && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">进度追踪</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">进度</span>
                  <span className="text-sm font-semibold">
                    {presenceTracker.daysOutsideUS} / {presenceTracker.daysRequired} 天
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      presenceTracker.isEligible ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(presenceTracker.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  {presenceTracker.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    presenceTracker.isEligible ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {presenceTracker.isEligible ? '符合FEIE资格' : '需要更多天数'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 税务居民追踪标签页 */}
      {activeTab === 'residency' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">税务居民天数追踪</h3>
            <p className="text-sm text-blue-700 mb-4">
              监控各国居住天数，避免意外触发税务居民身份（通常为183天）
            </p>
            
            <div className="space-y-3">
              {['葡萄牙', '泰国', '墨西哥', '西班牙', '德国'].map((country, index) => (
                <div key={country} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{countries.find(c => c.name === country)?.flag || '🌍'}</span>
                    <span className="font-medium">{country}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="天数"
                      onChange={(e) => {
                        const days = Number(e.target.value)
                        const tracker = calculateResidency(country, days)
                        setResidencyTrackers(prev => {
                          const filtered = prev.filter(t => t.country !== country)
                          return [...filtered, tracker]
                        })
                      }}
                    />
                    <span className="text-sm text-gray-500">/ 183天</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {residencyTrackers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">状态概览</h3>
              {residencyTrackers.map((tracker, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  tracker.status === 'safe' ? 'border-green-200 bg-green-50' :
                  tracker.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{tracker.flag}</span>
                      <span className="font-medium">{tracker.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {tracker.daysSpent} / {tracker.limit} 天
                      </div>
                      <div className={`text-xs ${
                        tracker.status === 'safe' ? 'text-green-600' :
                        tracker.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {tracker.status === 'safe' ? '安全' :
                         tracker.status === 'warning' ? '警告' : '危险'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 免责声明 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">重要声明</h4>
            <p className="text-sm text-yellow-700">
              本计算器提供估算结果，仅供参考。实际税务情况取决于个人具体情况、最新税法变化和各国规定。
              在做出任何税务决定前，请务必咨询专业的税务顾问。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}