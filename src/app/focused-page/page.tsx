'use client'

import { useState } from 'react'
import { ArrowRight, Users, MapPin, Coffee, Star, Globe, Zap, Calculator, Shield, BookOpen, TrendingUp, Heart, MessageCircle, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import FocusedHeroSection from '@/components/FocusedHeroSection'
import EnhancedCityRanking from '@/components/EnhancedCityRanking'
import HomeLocalNomads from '@/components/HomeLocalNomads'

export default function FocusedHomePage() {
  const { t } = useTranslation()

  return (
    <PageLayout padding="none" className="bg-gray-50">
      {/* Focused Hero Section */}
      <FocusedHeroSection />

      {/* Main Content - 重新排序的模块 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* 1. City Spotlight - 精选热门城市 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🌟 Top Cities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Most popular destinations for digital nomads
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <EnhancedCityRanking 
              limit={5} 
              showQuickVote={true} 
              showCurrentCityVote={false}
              showFilters={false}
              showPersonalized={false}
            />
          </div>
        </section>

        {/* 2. AI推荐 - 简化版 */}
        <section className="animate-fade-in">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">🎯 AI City Recommendations</h2>
              </div>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Tell us your preferences and get personalized city recommendations
              </p>
              
              <a 
                href="/nomadagent" 
                className="btn btn-lg btn-primary inline-flex items-center space-x-2 group"
              >
                <Zap className="h-5 w-5" />
                <span>Get AI Recommendations</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* 3. Local Nomads预览 - 头像墙风格 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              👥 Recent Active Nomads
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with fellow digital nomads worldwide
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <HomeLocalNomads 
              maxUsers={6}
              showPagination={false}
              showLocationDetection={true}
              showStats={false}
              showNewUsers={false}
            />
            <div className="text-center mt-6">
              <a 
                href="/local-nomads" 
                className="btn btn-outline flex items-center space-x-2 mx-auto group"
              >
                <Users className="h-4 w-4" />
                <span>View All</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* 4. Essential Tools - 工具入口卡片 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🛠️ Essential Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need for your digital nomad journey
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <a 
              href="/nomadtools" 
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Budget Calculator</h3>
              <p className="text-sm text-gray-600">Calculate expenses</p>
            </a>
            
            <a 
              href="/nomadvisaguide" 
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visa Tracker</h3>
              <p className="text-sm text-gray-600">Check visa status</p>
            </a>
            
            <a 
              href="/nomadtools" 
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WiFi Speed Test</h3>
              <p className="text-sm text-gray-600">Test connection</p>
            </a>
            
            <a 
              href="/nomadtools/nomadtax" 
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tax Guide</h3>
              <p className="text-sm text-gray-600">Tax optimization</p>
            </a>
          </div>
        </section>

        {/* 5. Featured Places - 精选地点 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📍 Featured Places
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recommended cafes and co-working spaces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Blue Bottle Coffee</h3>
                  <p className="text-sm text-gray-600">Bangkok, Thailand</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Perfect for remote work with excellent WiFi and nomad-friendly atmosphere.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-xs text-gray-500">(127 reviews)</span>
                </div>
                <a href="/nomadplaces" className="text-blue-600 text-sm font-medium hover:underline">
                  View Details →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hubud Co-working</h3>
                  <p className="text-sm text-gray-600">Ubud, Bali</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Famous co-working space with stunning rice field views and vibrant community.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.9</span>
                  <span className="text-xs text-gray-500">(89 reviews)</span>
                </div>
                <a href="/nomadplaces" className="text-green-600 text-sm font-medium hover:underline">
                  View Details →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Guides - 小banner卡片 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📚 Guides
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Essential guides for digital nomads
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="/nomadvisaguide" 
              className="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Visa Guide</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Complete guide to digital nomad visas worldwide
              </p>
            </a>
            
            <a 
              href="/nomadtools/nomadtax" 
              className="group p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tax Guide</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Optimize your finances as a digital nomad
              </p>
            </a>
            
            <a 
              href="/guides" 
              className="group p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remote Work Tips</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Best practices for productivity and work-life balance
              </p>
            </a>
          </div>
        </section>
      </div>

      {/* Simple Footer */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Start Your Nomad Journey?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/nomadcities" 
                className="btn btn-primary flex items-center justify-center space-x-2 group"
              >
                <Globe className="h-4 w-4" />
                <span>Explore Cities</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/local-nomads" 
                className="btn btn-outline flex items-center justify-center space-x-2 group"
              >
                <Users className="h-4 w-4" />
                <span>Join Community</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
