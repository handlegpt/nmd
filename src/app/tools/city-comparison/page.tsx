'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import CityComparison from '@/components/CityComparison'
import { BarChart3, ArrowLeft, TrendingUp, DollarSign, Wifi, Calendar } from 'lucide-react'

export default function CityComparisonPage() {
  const { t } = useTranslation()

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Tools</span>
          </button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              City Comparison Tool
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare multiple cities side-by-side to find the best fit for your digital nomad journey. Analyze costs, amenities, and lifestyle factors.
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Analysis</h3>
          <p className="text-gray-600 text-sm">
            Compare living costs, accommodation prices, and daily expenses across cities.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Wifi className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Infrastructure</h3>
          <p className="text-gray-600 text-sm">
            Evaluate internet speed, coworking spaces, and digital infrastructure.
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Visa & Legal</h3>
          <p className="text-gray-600 text-sm">
            Compare visa requirements, stay duration, and legal considerations.
          </p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality of Life</h3>
          <p className="text-gray-600 text-sm">
            Assess safety, weather, culture, and overall quality of life factors.
          </p>
        </div>
      </div>

      {/* City Comparison Component */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <CityComparison />
      </div>

      {/* Comparison Tips */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Tips for Effective City Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Compare</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Monthly living costs and budget requirements</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Internet speed and reliability for remote work</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Visa requirements and stay duration limits</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Safety ratings and crime statistics</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Weather patterns and seasonal considerations</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Making Your Decision</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Prioritize factors most important to your lifestyle</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Consider your work requirements and schedule</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Factor in personal preferences and interests</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Research local communities and networking opportunities</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Plan for seasonal variations and long-term stays</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
