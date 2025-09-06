'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Users, 
  Star, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  X
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import FixedLink from '@/components/FixedLink'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: {
    text: string
    href: string
  }
}

export default function QuickStartWizard() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps: WizardStep[] = [
    {
      id: 'explore-cities',
      title: t('quickStart.step1.title'),
      description: t('quickStart.step1.description'),
      icon: <Globe className="h-6 w-6" />,
      action: {
        text: t('quickStart.step1.action'),
        href: '/nomadcities'
      }
    },
    {
      id: 'find-places',
      title: t('quickStart.step2.title'),
      description: t('quickStart.step2.description'),
      icon: <MapPin className="h-6 w-6" />,
      action: {
        text: t('quickStart.step2.action'),
        href: '/nomadplaces'
      }
    },
    {
      id: 'connect-nomads',
      title: t('quickStart.step3.title'),
      description: t('quickStart.step3.description'),
      icon: <Users className="h-6 w-6" />,
      action: {
        text: t('quickStart.step3.action'),
        href: '/local-nomads'
      }
    },
    {
      id: 'rate-cities',
      title: t('quickStart.step4.title'),
      description: t('quickStart.step4.description'),
      icon: <Star className="h-6 w-6" />,
      action: {
        text: t('quickStart.step4.action'),
        href: '/nomadcities'
      }
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsOpen(false)
    setCurrentStep(0)
    // 保存到localStorage，避免重复显示
    localStorage.setItem('quickStartCompleted', 'true')
  }

  // 检查是否已经完成过向导
  if (typeof window !== 'undefined' && localStorage.getItem('quickStartCompleted') === 'true') {
    return null
  }

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label={t('quickStart.open')}
      >
        <div className="relative">
          <Globe className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {t('quickStart.tooltip')}
        </div>
      </button>

      {/* 向导模态框 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('quickStart.title')}</h2>
                <button
                  onClick={handleComplete}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">{t('quickStart.subtitle')}</p>
            </div>

            {/* 进度条 */}
            <div className="px-6 pt-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {steps[currentStep].icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="text-gray-600">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t('common.previous')}</span>
                </button>

                <div className="flex space-x-3">
                  {currentStep === steps.length - 1 ? (
                    <button
                      onClick={handleComplete}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{t('quickStart.complete')}</span>
                    </button>
                  ) : (
                    <>
                      <FixedLink
                        href={steps[currentStep].action.href}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <span>{steps[currentStep].action.text}</span>
                        <ArrowRight className="h-4 w-4" />
                      </FixedLink>
                      <button
                        onClick={handleNext}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <span>{t('common.next')}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 步骤指示器 */}
            <div className="px-6 pb-6">
              <div className="flex justify-center space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
