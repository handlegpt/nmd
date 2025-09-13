'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import NomadPlanningForm from '@/components/NomadPlanningForm'
import NomadResultsDisplay from '@/components/NomadResultsDisplay'
import { Brain, MapPin, Clock, DollarSign, Users, Globe } from 'lucide-react'

export default function NomadAgentPage() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<'form' | 'loading' | 'results'>('form')
  const [planData, setPlanData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 处理规划生成
  const handlePlanGeneration = async (formData: any) => {
    setCurrentStep('loading')
    setLoading(true)

    try {
      const response = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const result = await response.json()
      
      if (result.success) {
        setPlanData(result.data)
        setCurrentStep('results')
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('规划生成失败:', error)
      // 显示错误信息
      alert('规划生成失败，请重试')
      setCurrentStep('form')
    } finally {
      setLoading(false)
    }
  }

  // 重置到表单
  const handleReset = () => {
    setCurrentStep('form')
    setPlanData(null)
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <Brain className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              AI数字游民规划助手
            </h1>
          </div>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            基于你的国籍、预算、偏好，AI智能生成个性化数字游民路线规划
          </p>
        </div>
      </div>

      {/* 功能特色 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6 text-center">
          <MapPin className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">智能路线规划</h3>
          <p className="text-gray-600 text-xs md:text-sm">
            基于数字游民签证、生活成本、网络环境等多维度数据，生成最优路线
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 text-center">
          <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">精准成本分析</h3>
          <p className="text-gray-600 text-xs md:text-sm">
            实时获取生活成本数据，提供详细的预算分析和省钱建议
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 text-center">
          <Globe className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">签证策略指导</h3>
          <p className="text-gray-600 text-xs md:text-sm">
            专业的数字游民签证分析，提供申请流程和风险评估
          </p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 mx-2 md:mx-0">
        {currentStep === 'form' && (
          <NomadPlanningForm 
            onSubmit={handlePlanGeneration}
            loading={loading}
          />
        )}

        {currentStep === 'loading' && (
          <div className="p-6 md:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-600 mb-4"></div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              AI正在为你规划数字游民路线...
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              正在分析签证要求、计算生活成本、规划最优路线
            </p>
            <div className="mt-4 md:mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-gray-500">
                <Brain className="h-3 w-3 md:h-4 md:w-4" />
                <span>分析签证要求</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-gray-500">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                <span>计算生活成本</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-gray-500">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                <span>规划最优路线</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'results' && planData && (
          <NomadResultsDisplay 
            planData={planData}
            onReset={handleReset}
          />
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 md:mt-12 bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-8 mx-2 md:mx-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
          如何使用AI规划助手
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-purple-600 font-bold text-sm md:text-base">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">填写基本信息</h3>
            <p className="text-xs md:text-sm text-gray-600">
              输入你的国籍、预算、计划时长等基本信息
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-blue-600 font-bold text-sm md:text-base">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">设置偏好</h3>
            <p className="text-xs md:text-sm text-gray-600">
              选择你喜欢的 climate、活动类型、住宿偏好等
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-green-600 font-bold text-sm md:text-base">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">AI智能分析</h3>
            <p className="text-xs md:text-sm text-gray-600">
              多Agent协作分析签证、成本、路线，生成个性化方案
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-yellow-600 font-bold text-sm md:text-base">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">获得规划</h3>
            <p className="text-xs md:text-sm text-gray-600">
              查看详细路线、成本分析、签证策略和风险评估
            </p>
          </div>
        </div>
      </div>

      {/* 数据来源说明 */}
      <div className="mt-6 md:mt-8 bg-blue-50 rounded-lg md:rounded-xl p-4 md:p-6 mx-2 md:mx-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 text-center">
          数据来源与更新
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
          <div>
            <strong>生活成本数据：</strong> Numbeo、NomadList
          </div>
          <div>
            <strong>签证信息：</strong> 各国官方移民局
          </div>
          <div>
            <strong>汇率数据：</strong> 实时汇率API
          </div>
          <div>
            <strong>POI数据：</strong> Google Places API
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          数据每日更新，确保信息的准确性和时效性
        </p>
      </div>
    </PageLayout>
  )
}
