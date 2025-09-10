'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations'
import { Brain, ArrowLeft, Star, MapPin, Users } from 'lucide-react'

export default function AIRecommendationsPage() {
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
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              AI Personalized Recommendations
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized city and place recommendations based on your preferences, lifestyle, and digital nomad goals.
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
          <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
          <p className="text-gray-600 text-sm">
            AI analyzes your preferences to find the perfect cities and places for your lifestyle.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Intelligence</h3>
          <p className="text-gray-600 text-sm">
            Advanced algorithms consider cost, weather, community, and infrastructure factors.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Insights</h3>
          <p className="text-gray-600 text-sm">
            Discover vibrant nomad communities and networking opportunities in each location.
          </p>
        </div>
      </div>

      {/* AI Recommendations Component */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <PersonalizedRecommendations />
      </div>

      {/* How It Works */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How AI Recommendations Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analyze Preferences</h3>
            <p className="text-sm text-gray-600">
              We analyze your budget, lifestyle, and preferences to understand your needs.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Process Data</h3>
            <p className="text-sm text-gray-600">
              AI processes thousands of data points about cities, costs, and amenities.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate Matches</h3>
            <p className="text-sm text-gray-600">
              Advanced algorithms find the best matches based on your criteria.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Present Results</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations with detailed insights and explanations.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
