'use client'

import { useState } from 'react'
import { ArrowRight, Users, MapPin, Coffee, Star, Globe, Zap, Calculator, Shield, BookOpen, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import OptimizedHeroSection from '@/components/OptimizedHeroSection'
import EnhancedCityRanking from '@/components/EnhancedCityRanking'
import HomeLocalNomads from '@/components/HomeLocalNomads'

export default function OptimizedHomePage() {
  const { t } = useTranslation()

  return (
    <PageLayout padding="none" className="bg-gray-50">
      {/* Hero Section - 首屏抓住注意力 */}
      <OptimizedHeroSection />

      {/* Core Value Section - 让用户立即明白网站能干嘛 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* City Spotlight - 精选3-4个热门城市 */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🌟 City Spotlight
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the most popular destinations for digital nomads, 
              with real-time ratings and essential information.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <EnhancedCityRanking 
              limit={4} 
              showQuickVote={true} 
              showCurrentCityVote={false}
              showFilters={false}
              showPersonalized={false}
            />
            <div className="text-center mt-6">
              <a 
                href="/nomadcities" 
                className="btn btn-outline flex items-center space-x-2 mx-auto group"
              >
                <span>查看全部城市</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* Local Nomads Preview - 显示在线游民 + 发起Meetup */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              👥 Local Nomads
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with fellow digital nomads in your area. 
              Start meaningful conversations and build your remote work network.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <HomeLocalNomads 
              maxUsers={4}
              showPagination={false}
              showLocationDetection={true}
              showStats={true}
              showNewUsers={false}
            />
            <div className="text-center mt-6">
              <a 
                href="/local-nomads" 
                className="btn btn-primary flex items-center space-x-2 mx-auto group"
              >
                <Users className="h-4 w-4" />
                <span>加入Meetup</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* Nomad Agent Recommendation */}
        <section className="animate-fade-in">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">AI City Recommendations</h2>
              </div>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Tell us your preferences and get personalized city recommendations 
                powered by AI. Budget, visa requirements, lifestyle - we've got you covered.
              </p>
              
              {/* Quick Input Examples */}
              <div className="space-y-4 mb-8">
                <div className="text-sm text-gray-500">Try asking:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                    "Budget $2000, need 90-day visa, love beaches"
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                    "Best cities for remote work in Asia?"
                  </div>
                </div>
              </div>
              
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
      </div>

      {/* Extended Tools Section - 下拉后再看到 */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Nomad Tools Hub */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🛠️ Nomad Tools Hub
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Essential tools for digital nomads. Budget calculators, visa trackers, 
                and more to make your remote work life easier.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a 
                href="/nomadtools" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Budget Calculator</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Calculate your monthly expenses in any city worldwide.
                </p>
              </a>
              
              <a 
                href="/nomadvisaguide" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Visa Tracker</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Track your visa status and find digital nomad visa options.
                </p>
              </a>
              
              <a 
                href="/nomadtools" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">WiFi Speed Test</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Test your internet speed and find the best co-working spaces.
                </p>
              </a>
              
              <a 
                href="/nomadtools" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Tax Guide</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Understand tax implications for digital nomads worldwide.
                </p>
              </a>
            </div>
          </section>

          {/* Places Spotlight - 精选地点 */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📍 Today's Featured Places
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover the best cafes, co-working spaces, and nomad-friendly spots 
                recommended by our community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Coffee className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Blue Bottle Coffee</h3>
                    <p className="text-sm text-gray-600">Bangkok, Thailand</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Perfect for remote work with excellent WiFi, great coffee, and a nomad-friendly atmosphere.
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
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hubud Co-working</h3>
                    <p className="text-sm text-gray-600">Ubud, Bali</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  One of the world's most famous co-working spaces, perfect for digital nomads in Bali.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.9</span>
                    <span className="text-xs text-gray-500">(89 reviews)</span>
                  </div>
                  <a href="/nomadplaces" className="text-blue-600 text-sm font-medium hover:underline">
                    View Details →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Content & Guides */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📚 Guides & Resources
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Essential guides for digital nomads. Visa information, tax tips, 
                and everything you need to know about remote work.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a 
                href="/nomadvisaguide" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Visa Guide</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Complete guide to digital nomad visas and travel requirements worldwide.
                </p>
                <div className="text-blue-600 text-sm font-medium group-hover:underline">
                  Read Guide →
                </div>
              </a>
              
              <a 
                href="/nomadtools/nomadtax" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Tax Guide</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Understand tax implications and optimize your finances as a digital nomad.
                </p>
                <div className="text-blue-600 text-sm font-medium group-hover:underline">
                  Read Guide →
                </div>
              </a>
              
              <a 
                href="/guides" 
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Remote Work Tips</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Best practices for productivity, work-life balance, and remote work success.
                </p>
                <div className="text-blue-600 text-sm font-medium group-hover:underline">
                  Read Guide →
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Nomad Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of digital nomads who have found their perfect remote work destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/local-nomads" 
              className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 flex items-center justify-center space-x-2 group"
            >
              <Users className="h-5 w-5" />
              <span>Join the Community</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/nomadagent" 
              className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-blue-600 flex items-center justify-center space-x-2 group"
            >
              <Zap className="h-5 w-5" />
              <span>Get AI Recommendations</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
