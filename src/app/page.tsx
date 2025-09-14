'use client'

import { useState } from 'react'
import { ArrowRight, Users, MapPin, Coffee, Star, Globe, Zap, Calculator, Shield, BookOpen, TrendingUp, Heart, MessageCircle, Calendar, Wifi, DollarSign } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import UltimateHeroSection from '@/components/UltimateHeroSection'
import EnhancedCityRanking from '@/components/EnhancedCityRanking'
import HomeLocalNomads from '@/components/HomeLocalNomads'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <PageLayout padding="none" className="bg-gray-50">
      {/* Ultimate Hero Section */}
      <UltimateHeroSection />

      {/* Core Value Section - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        
        {/* City Spotlight - Enhanced */}
        <section className="animate-fade-in">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Community Favorites</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              🌟 City Spotlight
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the most popular destinations for digital nomads, 
              with real-time ratings, visa information, and community insights.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
            <EnhancedCityRanking 
              limit={4} 
              showQuickVote={true} 
              showCurrentCityVote={false}
              showFilters={false}
              showPersonalized={false}
            />
            <div className="text-center mt-8">
              <a 
                href="/nomadcities" 
                className="group btn btn-lg btn-outline flex items-center space-x-2 mx-auto border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>Explore All 500+ Cities</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* Local Nomads Preview - Enhanced */}
        <section className="animate-fade-in">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-2 mb-6">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Live Community</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              👥 Connect with Nomads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of digital nomads worldwide. Start conversations, 
              share experiences, and build meaningful connections.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
            <HomeLocalNomads 
              maxUsers={4}
              showPagination={false}
              showLocationDetection={true}
              showStats={true}
              showNewUsers={false}
            />
            <div className="text-center mt-8">
              <a 
                href="/local-nomads" 
                className="group btn btn-lg btn-primary flex items-center space-x-2 mx-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Users className="h-5 w-5" />
                <span>Join the Community</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* Nomad Agent Recommendation - Enhanced */}
        <section className="animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-2xl border border-purple-200 p-12">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-8">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">AI-Powered</span>
                </div>
                
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">Smart City Recommendations</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Tell us your preferences and get personalized city recommendations 
                  powered by AI. Budget, visa requirements, lifestyle - we've got you covered.
                </p>
                
                {/* Enhanced Input Examples */}
                <div className="space-y-6 mb-10">
                  <div className="text-lg font-semibold text-gray-700">Try asking:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Budget Focus</span>
                      </div>
                      <p className="text-gray-600">"Budget $2000, need 90-day visa, love beaches"</p>
                    </div>
                    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Region Focus</span>
                      </div>
                      <p className="text-gray-600">"Best cities for remote work in Asia?"</p>
                    </div>
                  </div>
                </div>
                
                <a 
                  href="/nomadagent" 
                  className="group btn btn-xl btn-primary inline-flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                >
                  <Zap className="h-6 w-6" />
                  <span>Get AI Recommendations</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Extended Tools Section - Enhanced */}
      <div className="bg-gradient-to-br from-gray-100 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Nomad Tools Hub - Enhanced */}
          <section className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-6 py-2 mb-6">
                <Calculator className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">Essential Tools</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                🛠️ Nomad Tools Hub
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Everything you need for your digital nomad journey. 
                Budget calculators, visa trackers, and productivity tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a 
                href="/nomadtools" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Budget Calculator</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Calculate your monthly expenses in any city worldwide with real-time data.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:underline">
                  Try Calculator →
                </div>
              </a>
              
              <a 
                href="/nomadvisaguide" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Visa Tracker</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Track your visa status and find digital nomad visa options worldwide.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:underline">
                  Check Visas →
                </div>
              </a>
              
              <a 
                href="/nomadtools" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Wifi className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">WiFi Speed Test</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Test your internet speed and find the best co-working spaces nearby.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:underline">
                  Test Speed →
                </div>
              </a>
              
              <a 
                href="/nomadtools/nomadtax" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-orange-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tax Guide</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Understand tax implications and optimize your finances as a digital nomad.
                </p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:underline">
                  Read Guide →
                </div>
              </a>
            </div>
          </section>

          {/* Today's Featured Places - Enhanced */}
          <section className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full px-6 py-2 mb-6">
                <Heart className="h-5 w-5 text-pink-600" />
                <span className="text-sm font-semibold text-gray-700">Community Picks</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                📍 Today's Featured Places
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover the best cafes, co-working spaces, and nomad-friendly spots 
                recommended by our global community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Coffee className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Blue Bottle Coffee</h3>
                    <p className="text-gray-600">Bangkok, Thailand</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Perfect for remote work with excellent WiFi, great coffee, and a nomad-friendly atmosphere. 
                  Open 24/7 with dedicated work zones.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-lg">4.8</span>
                    </div>
                    <span className="text-sm text-gray-500">(127 reviews)</span>
                  </div>
                  <a href="/nomadplaces" className="text-blue-600 font-semibold hover:underline group-hover:underline">
                    View Details →
                  </a>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Hubud Co-working</h3>
                    <p className="text-gray-600">Ubud, Bali</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  One of the world's most famous co-working spaces, perfect for digital nomads in Bali. 
                  Stunning rice field views and vibrant community.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-lg">4.9</span>
                    </div>
                    <span className="text-sm text-gray-500">(89 reviews)</span>
                  </div>
                  <a href="/nomadplaces" className="text-green-600 font-semibold hover:underline group-hover:underline">
                    View Details →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Guides & Resources - Enhanced */}
          <section className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full px-6 py-2 mb-6">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-700">Expert Guides</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                📚 Guides & Resources
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Essential guides for digital nomads. Visa information, tax tips, 
                and everything you need to know about remote work.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <a 
                href="/nomadvisaguide" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Visa Guide</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Complete guide to digital nomad visas and travel requirements worldwide.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:underline">
                  Read Guide →
                </div>
              </a>
              
              <a 
                href="/nomadtools/nomadtax" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tax Guide</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Understand tax implications and optimize your finances as a digital nomad.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:underline">
                  Read Guide →
                </div>
              </a>
              
              <a 
                href="/guides" 
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Remote Work Tips</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Best practices for productivity, work-life balance, and remote work success.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:underline">
                  Read Guide →
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Start Your Nomad Journey?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of digital nomads who have found their perfect remote work destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="/local-nomads" 
              className="group btn btn-xl bg-white text-blue-600 hover:bg-gray-100 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              <Users className="h-6 w-6" />
              <span>Join the Community</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/nomadagent" 
              className="group btn btn-xl btn-outline border-2 border-white text-white hover:bg-white hover:text-blue-600 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              <Zap className="h-6 w-6" />
              <span>Get AI Recommendations</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
