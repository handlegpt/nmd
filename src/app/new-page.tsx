'use client'

import { useState } from 'react'
import { ArrowRight, Users, MapPin, Coffee, Star, Globe, Zap } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import NewHeroSection from '@/components/NewHeroSection'
import EnhancedCityRanking from '@/components/EnhancedCityRanking'
import HomeLocalNomads from '@/components/HomeLocalNomads'
import MyCoffeeMeetups from '@/components/MyCoffeeMeetups'

export default function NewHomePage() {
  const { t } = useTranslation()

  return (
    <PageLayout padding="none" className="bg-gray-50">
      {/* New Hero Section */}
      <NewHeroSection />

      {/* Main Content - Focused on Core Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Top Cities Section */}
        <section className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Globe className="h-8 w-8 mr-3 text-blue-600" />
                  Top Nomad Cities
                </h2>
                <p className="text-gray-600 mt-2">
                  Discover the best cities for digital nomads based on community ratings
                </p>
              </div>
              <a 
                href="/nomadcities" 
                className="btn btn-primary flex items-center space-x-2 group"
              >
                <span>View All Cities</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <EnhancedCityRanking 
              limit={6} 
              showQuickVote={true} 
              showCurrentCityVote={true}
              showFilters={false}
              showPersonalized={false}
            />
          </div>
        </section>

        {/* Local Nomads Section - Enhanced */}
        <section className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="h-8 w-8 mr-3 text-green-600" />
                  Connect with Nomads
                </h2>
                <p className="text-gray-600 mt-2">
                  Find fellow digital nomads nearby and start meaningful connections
                </p>
              </div>
              <a 
                href="/local-nomads" 
                className="btn btn-primary flex items-center space-x-2 group"
              >
                <span>View All Nomads</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <HomeLocalNomads 
              maxUsers={8}
              showPagination={false}
              showLocationDetection={true}
              showStats={true}
              showNewUsers={true}
            />
          </div>
        </section>

        {/* My Coffee Meetups Section */}
        <section className="animate-fade-in">
          <MyCoffeeMeetups />
        </section>

        {/* Nomad Agent Section */}
        <section className="animate-fade-in">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">AI-Powered Recommendations</h2>
              </div>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Get personalized city recommendations based on your budget, visa requirements, 
                and lifestyle preferences. Our AI agent helps you find your perfect nomad destination.
              </p>
              <a 
                href="/nomadagent" 
                className="btn btn-lg btn-primary inline-flex items-center space-x-2 group"
              >
                <Zap className="h-5 w-5" />
                <span>Try Nomad Agent</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* Quick Tools Section */}
        <section className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Essential Nomad Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a 
                href="/nomadtools" 
                className="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Coffee Meetups</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Connect with local nomads for coffee, networking, and collaboration opportunities.
                </p>
              </a>
              
              <a 
                href="/nomadvisaguide" 
                className="group p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Visa Guide</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Find visa requirements and digital nomad visa options for your next destination.
                </p>
              </a>
              
              <a 
                href="/nomadtools" 
                className="group p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">More Tools</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Budget calculators, WiFi speed tests, and other essential nomad utilities.
                </p>
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
