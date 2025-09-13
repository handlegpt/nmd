'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import NomadAgent from '@/components/NomadAgent'
import { Brain, ArrowLeft, Star, MapPin, Users, Route, Globe, Clock } from 'lucide-react'

export default function NomadAgentPage() {
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
            <span>Back</span>
          </button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Nomad Agent
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered digital nomad route planning and city recommendations. Get personalized routes, visa strategies, and budget optimization based on your preferences and goals.
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
          <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
          <p className="text-gray-600 text-sm">
            AI analyzes your preferences to find the perfect cities and places for your lifestyle.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Route className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Planning</h3>
          <p className="text-gray-600 text-sm">
            Get personalized digital nomad routes with visa strategies and budget optimization.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Globe className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Visa Strategy</h3>
          <p className="text-gray-600 text-sm">
            Smart visa planning based on your nationality and travel duration.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Forecast</h3>
          <p className="text-gray-600 text-sm">
            Accurate cost predictions and budget optimization for your nomad journey.
          </p>
        </div>
      </div>

      {/* Nomad Agent Component */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <NomadAgent />
      </div>

      {/* How It Works */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How Nomad Agent Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analyze Preferences</h3>
            <p className="text-sm text-gray-600">
              We analyze your budget, nationality, lifestyle, and preferences to understand your needs.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Process Data</h3>
            <p className="text-sm text-gray-600">
              AI processes thousands of data points about cities, costs, visas, and amenities.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate Routes</h3>
            <p className="text-sm text-gray-600">
              Advanced algorithms find the best routes with visa strategies and budget optimization.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Present Results</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations with detailed insights, visa strategies, and cost breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Example Use Cases */}
      <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Popular Nomad Routes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">💰 Budget Nomad</h3>
            <p className="text-sm text-gray-600 mb-3">$1500/month budget</p>
            <div className="text-sm text-gray-700">
              <div>• Thailand (30 days)</div>
              <div>• Vietnam (30 days)</div>
              <div>• Malaysia (30 days)</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🇨🇳 Chinese Passport</h3>
            <p className="text-sm text-gray-600 mb-3">90-day visa strategy</p>
            <div className="text-sm text-gray-700">
              <div>• Japan (30 days)</div>
              <div>• South Korea (30 days)</div>
              <div>• Singapore (30 days)</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🌍 Digital Nomad Visa</h3>
            <p className="text-sm text-gray-600 mb-3">Long-term strategy</p>
            <div className="text-sm text-gray-700">
              <div>• Estonia (12 months)</div>
              <div>• Portugal (12 months)</div>
              <div>• Germany (12 months)</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
