'use client';

import { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  MapPin,
  Calendar,
  Percent,
  Info,
  Star,
  X,
  Check,
  Search,
  Target,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import TaxCalculator from '@/components/TaxCalculator';
import TaxStrategyGuide from '@/components/TaxStrategyGuide';
import TaxNeedsAssessment from '@/components/TaxNeedsAssessment';
import TaxDeadlineReminder from '@/components/TaxDeadlineReminder';

interface TaxCountry {
  name: string;
  flag: string;
  residencyDays: number;
  globalTaxation: boolean;
  foreignIncomeTax: string;
  localIncomeTax: string;
  benefits: string[];
  requirements: string[];
  risks: string[];
  rating: number;
  category: 'tax-haven' | 'moderate' | 'high-tax';
}

export default function TaxPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('assessment');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 详细的各国税务信息
  const taxCountries: TaxCountry[] = [
    {
      name: 'Portugal',
      flag: '🇵🇹',
      residencyDays: 183,
      globalTaxation: false,
      foreignIncomeTax: '20% (NHR 2024年更新)',
      localIncomeTax: '14.5% - 48%',
      benefits: [
        'NHR计划：10年优惠税率（2024年政策收紧）',
        '无财富税',
        '无遗产税',
        '欧盟护照优势',
        '生活成本相对较低',
        'D7签证替代方案'
      ],
      requirements: [
        '2024年1月1日前申请（已截止）',
        '或符合新的严格条件',
        '高技能职业，年收入超过€75,000',
        '每年在葡萄牙居住超过183天',
        '不能是过去5年的葡萄牙税务居民'
      ],
      risks: [
        'NHR申请条件大幅收紧',
        '需要证明高技能职业和收入',
        '可能面临葡萄牙税务局审查',
        '政策变化风险增加'
      ],
      rating: 4,
      category: 'tax-haven'
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      residencyDays: 180,
      globalTaxation: false,
      foreignIncomeTax: '0% (不汇入泰国)',
      localIncomeTax: '5% - 35%',
      benefits: [
        '不汇入的外国收入免税',
        '生活成本低',
        '签证便利',
        '无资本利得税',
        '无遗产税'
      ],
      requirements: [
        '外国收入不汇入泰国',
        '在泰国工作需申请工作许可',
        '超过180天需申请税务居民身份',
        '保持良好记录'
      ],
      risks: [
        '汇入外国收入可能被征税',
        '工作许可限制严格',
        '税务规定可能变化'
      ],
      rating: 4,
      category: 'tax-haven'
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      residencyDays: 183,
      globalTaxation: false,
      foreignIncomeTax: '0% (不汇入墨西哥)',
      localIncomeTax: '1.92% - 35%',
      benefits: [
        '领土税制',
        '外国收入不汇入则免税',
        '与美国有税收协定',
        '生活成本适中',
        '数字游民签证'
      ],
      requirements: [
        '超过183天成为税务居民',
        '外国收入不汇入墨西哥',
        '墨西哥收入需纳税',
        '可能需要提交申报'
      ],
      risks: [
        '汇入外国收入可能被征税',
        '税务申报复杂',
        '可能面临审计'
      ],
      rating: 4,
      category: 'moderate'
    },
    {
      name: 'Spain',
      flag: '🇪🇸',
      residencyDays: 183,
      globalTaxation: true,
      foreignIncomeTax: '24% - 47%',
      localIncomeTax: '19% - 47%',
      benefits: [
        '贝克汉姆法（前5年优惠税率）',
        '欧盟护照',
        '优质医疗系统',
        '文化丰富'
      ],
      requirements: [
        '贝克汉姆法需在6个月内申请',
        '前5年优惠税率24%',
        '需证明高收入',
        '不能是过去10年的西班牙居民'
      ],
      risks: [
        '全球收入征税',
        '高税率',
        '复杂的税务申报',
        '贝克汉姆法可能被取消'
      ],
      rating: 3,
      category: 'high-tax'
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      residencyDays: 183,
      globalTaxation: true,
      foreignIncomeTax: '14% - 45%',
      localIncomeTax: '14% - 45%',
      benefits: [
        '优质基础设施',
        '强健经济',
        '欧盟护照',
        '优秀医疗系统'
      ],
      requirements: [
        '超过183天成为税务居民',
        '全球收入征税',
        '复杂的税务申报',
        '需要专业税务顾问'
      ],
      risks: [
        '全球收入征税',
        '高税率',
        '复杂的税务制度',
        '严格的合规要求'
      ],
      rating: 2,
      category: 'high-tax'
    },
    {
      name: 'Estonia',
      flag: '🇪🇪',
      residencyDays: 183,
      globalTaxation: false,
      foreignIncomeTax: '0% (不汇入)',
      localIncomeTax: '20%',
      benefits: [
        '数字游民签证',
        'e-Residency计划',
        '低税率',
        '数字化程度高',
        '欧盟成员国'
      ],
      requirements: [
        '超过183天成为税务居民',
        '外国收入不汇入',
        '可能需要e-Residency',
        '保持数字记录'
      ],
      risks: [
        '汇入外国收入被征税',
        '需要适应数字化系统',
        '气候较冷'
      ],
      rating: 4,
      category: 'moderate'
    },
    {
      name: 'Costa Rica',
      flag: '🇨🇷',
      residencyDays: 183,
      globalTaxation: false,
      foreignIncomeTax: '0% (不汇入)',
      localIncomeTax: '10% - 25%',
      benefits: [
        '领土税制',
        '外国收入不汇入免税',
        '数字游民签证',
        '自然环境优美',
        '生活成本适中'
      ],
      requirements: [
        '超过183天成为税务居民',
        '外国收入不汇入',
        '可能需要申请居留许可',
        '保持良好记录'
      ],
      risks: [
        '汇入外国收入被征税',
        '基础设施相对落后',
        '医疗系统有限'
      ],
      rating: 4,
      category: 'moderate'
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      residencyDays: 182,
      globalTaxation: false,
      foreignIncomeTax: '0% (不汇入)',
      localIncomeTax: '0% - 30%',
      benefits: [
        'MM2H签证计划',
        '外国收入不汇入免税',
        '生活成本低',
        '英语普及率高',
        '基础设施良好'
      ],
      requirements: [
        '超过182天成为税务居民',
        '外国收入不汇入',
        '可能需要MM2H签证',
        '保持良好记录'
      ],
      risks: [
        '汇入外国收入被征税',
        'MM2H要求可能变化',
        '政治环境不稳定'
      ],
      rating: 4,
      category: 'moderate'
    }
  ];

  const filteredCountries = taxCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.category.includes(searchTerm.toLowerCase())
  );

  const selectedCountryData = selectedCountry 
    ? taxCountries.find(c => c.name === selectedCountry) 
    : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax-haven': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high-tax': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tax-haven': return t('tax.categories.taxHaven');
      case 'moderate': return t('tax.categories.moderate');
      case 'high-tax': return t('tax.categories.highTax');
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('tax.pageTitle')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('tax.pageDescription')}
          </p>
        </div>

        {/* 步骤导航 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[
              { id: 'assessment', label: t('tax.tabs.assessment'), icon: Target, step: 1 },
              { id: 'calculator', label: t('tax.tabs.calculator'), icon: Calculator, step: 2 },
              { id: 'strategies', label: t('tax.tabs.strategies'), icon: BookOpen, step: 3 },
              { id: 'countries', label: t('tax.tabs.countries'), icon: Globe, step: 4 },
              { id: 'deadlines', label: t('tax.tabs.deadlines'), icon: Calendar, step: 5 }
            ].map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeCategory === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.step}</span>
                </button>
                {index < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    activeCategory === tab.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* 步骤指示器 */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm text-gray-600">{t('tax.currentStep')}</span>
              <span className="text-sm font-medium text-blue-600">
                {activeCategory === 'assessment' && t('tax.step1')}
                {activeCategory === 'calculator' && t('tax.step2')}
                {activeCategory === 'strategies' && t('tax.step3')}
                {activeCategory === 'countries' && t('tax.step4')}
                {activeCategory === 'deadlines' && t('tax.step5')}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter - 只在国家对比页面显示 */}
        {activeCategory === 'countries' && (
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('tax.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Content based on active category */}
        {activeCategory === 'assessment' && (
          <div className="max-w-4xl mx-auto">
            <TaxNeedsAssessment />
          </div>
        )}

        {activeCategory === 'calculator' && (
          <div className="max-w-4xl mx-auto">
            <TaxCalculator />
          </div>
        )}

        {activeCategory === 'strategies' && (
          <div className="max-w-6xl mx-auto">
            <TaxStrategyGuide />
          </div>
        )}

        {activeCategory === 'deadlines' && (
          <div className="max-w-6xl mx-auto">
            <TaxDeadlineReminder />
          </div>
        )}

        {activeCategory === 'countries' && (
          <>
            {/* Country Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCountries.map((country) => (
            <div
              key={country.name}
              onClick={() => setSelectedCountry(country.name)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{country.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < country.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('tax.countryDetails.residencyDays')}</span>
                  <span className="text-sm font-medium">{country.residencyDays}{t('common.days')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('tax.countryDetails.globalTaxation')}</span>
                  <span className={`text-sm font-medium ${country.globalTaxation ? 'text-red-600' : 'text-green-600'}`}>
                    {country.globalTaxation ? t('tax.countryDetails.yes') : t('tax.countryDetails.no')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('tax.countryDetails.foreignIncomeTax')}</span>
                  <span className="text-sm font-medium text-green-600">{country.foreignIncomeTax}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('tax.countryDetails.localIncomeTax')}</span>
                  <span className="text-sm font-medium">{country.localIncomeTax}</span>
                </div>

                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(country.category)}`}>
                    {getCategoryLabel(country.category)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Country Detail Modal */}
        {selectedCountryData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedCountryData.flag}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCountryData.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      {t('tax.countryDetails.residencyRequirements')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">{t('tax.countryDetails.residencyDays')}</span>
                        <span className="text-sm font-medium">{selectedCountryData.residencyDays}{t('common.days')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">{t('tax.countryDetails.globalTaxation')}</span>
                        <span className={`text-sm font-medium ${selectedCountryData.globalTaxation ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedCountryData.globalTaxation ? t('tax.countryDetails.yes') : t('tax.countryDetails.no')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {t('tax.countryDetails.taxRateInfo')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">{t('tax.countryDetails.foreignIncomeTax')}</span>
                        <span className="text-sm font-medium text-green-600">{selectedCountryData.foreignIncomeTax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">{t('tax.countryDetails.localIncomeTax')}</span>
                        <span className="text-sm font-medium">{selectedCountryData.localIncomeTax}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    {t('tax.countryDetails.mainBenefits')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCountryData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    {t('tax.countryDetails.requirements')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCountryData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                    {t('tax.countryDetails.potentialRisks')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCountryData.risks.map((risk, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{t('tax.countryDetails.nomadFriendlyRating')}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedCountryData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {selectedCountryData.rating}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {/* Important Notice */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">{t('tax.importantNotice.title')}</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                {t('tax.importantNotice.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips - 只在国家对比页面显示 */}
        {activeCategory === 'countries' && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('tax.optimizationTips.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('tax.optimizationTips.trackResidencyDays')}</h3>
                <p className="text-sm text-gray-600">
                  {t('tax.optimizationTips.trackResidencyDaysDesc')}
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('tax.optimizationTips.understandTaxTreaties')}</h3>
                <p className="text-sm text-gray-600">
                  {t('tax.optimizationTips.understandTaxTreatiesDesc')}
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('tax.optimizationTips.keepGoodRecords')}</h3>
                <p className="text-sm text-gray-600">
                  {t('tax.optimizationTips.keepGoodRecordsDesc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 