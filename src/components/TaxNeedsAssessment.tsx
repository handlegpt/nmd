'use client';

import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  DollarSign,
  Calendar,
  Shield,
  Info,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Zap,
  Calculator,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AssessmentResult {
  riskLevel: 'low' | 'medium' | 'high';
  recommendedStrategies: string[];
  warnings: string[];
  nextSteps: string[];
  taxProfile: {
    income: string;
    passport: string;
    residence: string;
    workType: string;
    visaStatus: string;
  };
  recommendedCountries: string[];
  savingsPotential: string;
  category: 'beginner' | 'intermediate' | 'advanced';
}

export default function TaxNeedsAssessment() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'income',
      type: 'select',
      question: t('taxAssessment.questions.income'),
      icon: DollarSign,
      options: [
        { value: 'under-50k', label: t('taxAssessment.incomeOptions.under50k'), description: t('taxAssessment.incomeOptions.under50kDesc') },
        { value: '50k-100k', label: t('taxAssessment.incomeOptions.50k100k'), description: t('taxAssessment.incomeOptions.50k100kDesc') },
        { value: '100k-200k', label: t('taxAssessment.incomeOptions.100k200k'), description: t('taxAssessment.incomeOptions.100k200kDesc') },
        { value: 'over-200k', label: t('taxAssessment.incomeOptions.over200k'), description: t('taxAssessment.incomeOptions.over200kDesc') }
      ]
    },
    {
      id: 'passport',
      type: 'select',
      question: t('taxAssessment.questions.passport'),
      icon: Globe,
      options: [
        { value: 'us', label: t('taxAssessment.passportOptions.us'), flag: '🇺🇸', description: t('taxAssessment.passportOptions.usDesc') },
        { value: 'eu', label: t('taxAssessment.passportOptions.eu'), flag: '🇪🇺', description: t('taxAssessment.passportOptions.euDesc') },
        { value: 'uk', label: t('taxAssessment.passportOptions.uk'), flag: '🇬🇧', description: t('taxAssessment.passportOptions.ukDesc') },
        { value: 'canada', label: t('taxAssessment.passportOptions.canada'), flag: '🇨🇦', description: t('taxAssessment.passportOptions.canadaDesc') },
        { value: 'australia', label: t('taxAssessment.passportOptions.australia'), flag: '🇦🇺', description: t('taxAssessment.passportOptions.australiaDesc') },
        { value: 'other', label: t('taxAssessment.passportOptions.other'), flag: '🌍', description: t('taxAssessment.passportOptions.otherDesc') }
      ]
    },
    {
      id: 'residence',
      type: 'select',
      question: t('taxAssessment.questions.residence'),
      icon: MapPin,
      options: [
        { value: 'single', label: t('taxAssessment.residenceOptions.single'), description: t('taxAssessment.residenceOptions.singleDesc') },
        { value: 'multiple', label: t('taxAssessment.residenceOptions.multiple'), description: t('taxAssessment.residenceOptions.multipleDesc') },
        { value: 'nomadic', label: t('taxAssessment.residenceOptions.nomadic'), description: t('taxAssessment.residenceOptions.nomadicDesc') }
      ]
    },
    {
      id: 'work_type',
      type: 'select',
      question: t('taxAssessment.questions.workType'),
      icon: Users,
      options: [
        { value: 'freelance', label: t('taxAssessment.workTypeOptions.freelance'), description: t('taxAssessment.workTypeOptions.freelanceDesc') },
        { value: 'remote', label: t('taxAssessment.workTypeOptions.remote'), description: t('taxAssessment.workTypeOptions.remoteDesc') },
        { value: 'business', label: t('taxAssessment.workTypeOptions.business'), description: t('taxAssessment.workTypeOptions.businessDesc') },
        { value: 'mixed', label: t('taxAssessment.workTypeOptions.mixed'), description: t('taxAssessment.workTypeOptions.mixedDesc') }
      ]
    },
    {
      id: 'visa_status',
      type: 'select',
      question: t('taxAssessment.questions.visaStatus'),
      icon: Shield,
      options: [
        { value: 'tourist', label: t('taxAssessment.visaStatusOptions.tourist'), description: t('taxAssessment.visaStatusOptions.touristDesc') },
        { value: 'digital_nomad', label: t('taxAssessment.visaStatusOptions.digitalNomad'), description: t('taxAssessment.visaStatusOptions.digitalNomadDesc') },
        { value: 'resident', label: t('taxAssessment.visaStatusOptions.resident'), description: t('taxAssessment.visaStatusOptions.residentDesc') },
        { value: 'citizen', label: t('taxAssessment.visaStatusOptions.citizen'), description: t('taxAssessment.visaStatusOptions.citizenDesc') }
      ]
    }
  ];

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResult = (): AssessmentResult => {
    // 智能化的风险评估和推荐逻辑
    let riskScore = 0;
    const warnings: string[] = [];
    const recommendedStrategies: string[] = [];
    const nextSteps: string[] = [];
    const recommendedCountries: string[] = [];
    let category: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

    // 基于收入评估
    if (answers.income === 'over-200k') {
      riskScore += 3;
      warnings.push('高收入需要专业税务规划，避免双重征税风险');
      recommendedStrategies.push('考虑葡萄牙NHR计划（2024年政策更新）');
      recommendedStrategies.push('建立离岸公司结构');
      category = 'advanced';
    } else if (answers.income === '100k-200k') {
      riskScore += 2;
      recommendedStrategies.push('中等收入优化策略');
      recommendedStrategies.push('考虑领土税制国家');
      category = 'intermediate';
    } else if (answers.income === '50k-100k') {
      riskScore += 1;
      recommendedStrategies.push('基础税务优化策略');
      category = 'intermediate';
    } else {
      recommendedStrategies.push('基础合规和简单优化');
      category = 'beginner';
    }

    // 基于护照国评估
    if (answers.passport === 'us') {
      riskScore += 2;
      warnings.push('美国护照持有者面临全球征税，需要FEIE策略');
      recommendedStrategies.push('利用FEIE（Foreign Earned Income Exclusion）');
      recommendedCountries.push('Portugal', 'Thailand', 'Mexico');
    } else if (answers.passport === 'eu') {
      recommendedStrategies.push('欧盟内部税务优化');
      recommendedCountries.push('Portugal', 'Estonia', 'Croatia');
    } else if (answers.passport === 'uk') {
      riskScore += 1;
      recommendedStrategies.push('英国脱欧后税务策略');
      recommendedCountries.push('Portugal', 'Thailand', 'Malaysia');
    }

    // 基于居住模式评估
    if (answers.residence === 'multiple') {
      riskScore += 2;
      warnings.push('多国居住需要仔细规划税务居民身份');
      recommendedStrategies.push('多国居住税务规划');
    } else if (answers.residence === 'nomadic') {
      riskScore += 1;
      recommendedStrategies.push('游牧式生活税务策略');
      recommendedCountries.push('Thailand', 'Mexico', 'Costa Rica');
    }

    // 基于工作类型评估
    if (answers.work_type === 'freelance') {
      recommendedStrategies.push('自由职业者税务优化');
      recommendedCountries.push('Portugal', 'Thailand', 'Estonia');
    } else if (answers.work_type === 'business') {
      recommendedStrategies.push('企业税务结构优化');
      recommendedCountries.push('Estonia', 'Portugal', 'Malaysia');
    } else if (answers.work_type === 'remote') {
      recommendedStrategies.push('远程工作税务优化');
    }

    // 基于签证状态评估
    if (answers.visa_status === 'tourist') {
      riskScore += 1;
      warnings.push('旅游签证状态需要谨慎处理税务合规');
    } else if (answers.visa_status === 'digital_nomad') {
      recommendedStrategies.push('数字游民签证税务优势');
    }

    // 确定风险等级
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 2) {
      riskLevel = 'low';
    } else if (riskScore <= 4) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // 计算节税潜力
    let savingsPotential = '';
    if (answers.income === 'over-200k') {
      savingsPotential = '$15,000 - $50,000/年';
    } else if (answers.income === '100k-200k') {
      savingsPotential = '$8,000 - $25,000/年';
    } else if (answers.income === '50k-100k') {
      savingsPotential = '$3,000 - $12,000/年';
    } else {
      savingsPotential = '$1,000 - $5,000/年';
    }

    // 添加下一步建议
    nextSteps.push('使用税务计算器比较不同国家');
    nextSteps.push('查看详细的税务策略指南');
    if (riskLevel === 'high') {
      nextSteps.push('咨询专业税务顾问');
    }

    return {
      riskLevel,
      recommendedStrategies,
      warnings,
      nextSteps,
      taxProfile: {
        income: answers.income,
        passport: answers.passport,
        residence: answers.residence,
        workType: answers.work_type,
        visaStatus: answers.visa_status
      },
      recommendedCountries: [...new Set(recommendedCountries)].slice(0, 3),
      savingsPotential,
      category
    };
  };

  const result = showResult ? calculateResult() : null;

  if (showResult && result) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* 税务画像报告 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {t('taxAssessment.results.title')}
            </h2>
            <p className="text-blue-100 text-lg">
              {t('taxAssessment.results.subtitle')}
            </p>
          </div>

          {/* 税务画像卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <DollarSign className="h-6 w-6 mr-2" />
                <h3 className="font-semibold">{t('taxAssessment.results.incomeLevel')}</h3>
              </div>
              <p className="text-sm text-blue-100">
                {questions[0].options.find(opt => opt.value === result.taxProfile.income)?.label}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Globe className="h-6 w-6 mr-2" />
                <h3 className="font-semibold">{t('taxAssessment.results.passportCountry')}</h3>
              </div>
              <p className="text-sm text-blue-100">
                {questions[1].options.find(opt => opt.value === result.taxProfile.passport)?.label}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <MapPin className="h-6 w-6 mr-2" />
                <h3 className="font-semibold">{t('taxAssessment.results.residencePattern')}</h3>
              </div>
              <p className="text-sm text-blue-100">
                {questions[2].options.find(opt => opt.value === result.taxProfile.residence)?.label}
              </p>
            </div>
          </div>

          {/* 节税潜力和风险等级 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 mr-2" />
                <h3 className="text-xl font-bold">{t('taxAssessment.results.potentialSavings')}</h3>
              </div>
              <p className="text-2xl font-bold text-green-300">{result.savingsPotential}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                {result.riskLevel === 'low' ? (
                  <CheckCircle className="h-8 w-8 mr-2 text-green-300" />
                ) : result.riskLevel === 'medium' ? (
                  <AlertTriangle className="h-8 w-8 mr-2 text-yellow-300" />
                ) : (
                  <AlertTriangle className="h-8 w-8 mr-2 text-red-300" />
                )}
                <h3 className="text-xl font-bold">{t('taxAssessment.results.riskLevel')}</h3>
              </div>
              <p className="text-2xl font-bold">
                {result.riskLevel === 'low' ? t('taxAssessment.results.lowRisk') : result.riskLevel === 'medium' ? t('taxAssessment.results.mediumRisk') : t('taxAssessment.results.highRisk')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：推荐策略和警告 */}
          <div className="space-y-6">
            {/* Recommended Strategies */}
            {result.recommendedStrategies.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  {t('taxAssessment.results.recommendedStrategies')}
                </h3>
                <div className="space-y-3">
                  {result.recommendedStrategies.map((strategy, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">{strategy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  {t('taxAssessment.results.riskWarnings')}
                </h3>
                <div className="space-y-3">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <span className="text-sm text-yellow-800">{warning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：推荐国家和下一步 */}
          <div className="space-y-6">
            {/* Recommended Countries */}
            {result.recommendedCountries.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  {t('taxAssessment.results.recommendedCountries')}
                </h3>
                <div className="space-y-3">
                  {result.recommendedCountries.map((country, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">{country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-blue-600" />
                {t('taxAssessment.results.nextSteps')}
              </h3>
              <div className="space-y-3">
                {result.nextSteps.map((step, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-blue-800">{step}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-3">
                <button
                  onClick={() => {/* Navigate to calculator */}}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  {t('taxAssessment.results.useCalculator')}
                </button>
                <button
                  onClick={() => {/* Navigate to strategies */}}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('taxAssessment.results.viewStrategies')}
                </button>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setCurrentStep(0);
                    setAnswers({});
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('taxAssessment.results.reassess')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('taxAssessment.navigation.question')} {currentStep + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              {React.createElement(questions[currentStep].icon, { className: "h-6 w-6 text-blue-600" })}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {questions[currentStep].question}
            </h2>
          </div>
          
          <div className="space-y-3">
            {questions[currentStep].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  answers[questions[currentStep].id] === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    answers[questions[currentStep].id] === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[questions[currentStep].id] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex items-center flex-1">
                    {'flag' in option && option.flag && <span className="text-lg mr-2">{option.flag}</span>}
                    <div>
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('taxAssessment.navigation.previous')}
          </button>
          
          <button
            onClick={nextStep}
            disabled={!answers[questions[currentStep].id]}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              !answers[questions[currentStep].id]
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentStep === questions.length - 1 ? t('taxAssessment.navigation.viewResults') : t('taxAssessment.navigation.next')}
            {currentStep < questions.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}