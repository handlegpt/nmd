'use client'

import { useState, useEffect } from 'react'
import FixedLink from '@/components/FixedLink'
import { Globe, Users, TrendingUp, Star, ArrowRight, PlusIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import HeroSection from '@/components/HeroSection'

// Temporarily disabled components for debugging React errors
import UnifiedLiveInfoCard from '@/components/UnifiedLiveInfoCard'
import EnhancedCityRanking from '@/components/EnhancedCityRanking'
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations'

import CityComparison from '@/components/CityComparison'
import HomeLocalNomads from '@/components/HomeLocalNomads'
import HomePlaceRecommendations from '@/components/HomePlaceRecommendations'

import WifiSpeedTest from '@/components/WifiSpeedTest'
import AddCityForm from '@/components/AddCityForm'
import QuickStartWizard from '@/components/QuickStartWizard'

export default function HomePage() {
  const { t, locale } = useTranslation()
  const [showAddCityForm, setShowAddCityForm] = useState(false)

  const handleAddCity = async (cityData: any) => {
    // 这里应该调用API添加城市
    console.log('Adding city:', cityData)
    setShowAddCityForm(false)
  }

  return (
    <PageLayout padding="none" className="bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Live Info Card - Removed duplicate, already shown in Hero Section */}

      {/* Main Content */}
      <div className="space-y-12">
        {/* Nomad Hot Cities Ranking */}
        <section className="animate-fade-in">
          <div className="card card-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                🌍 {t('home.features.nomadCities.title')}
              </h2>
              <div className="flex items-center space-x-3">
                <FixedLink href="/cities" className="btn btn-md btn-primary">
                  {t('common.viewDetails')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </FixedLink>
                <button
                  onClick={() => setShowAddCityForm(true)}
                  className="btn btn-md btn-outline"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('cities.addCity')}
                </button>
              </div>
            </div>
            <EnhancedCityRanking 
              limit={5} 
              showQuickVote={true} 
              showCurrentCityVote={true}
              showFilters={true}
              showPersonalized={true}
            />
          </div>
        </section>



        {/* Place Recommendations */}
        <section className="animate-fade-in">
          <HomePlaceRecommendations />
        </section>

        {/* Personalized Recommendations */}
        <section className="animate-fade-in">
          <PersonalizedRecommendations />
        </section>

        {/* City Comparison Tool */}
        <section className="animate-fade-in">
          <CityComparison />
        </section>

        {/* Local Nomads */}
        <section className="animate-fade-in">
          <div className="card card-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  👥 {t('home.localNomads.title')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('home.localNomads.description')}
                </p>
              </div>
              <FixedLink href="/local-nomads" className="btn btn-md btn-primary">
                {t('home.localNomads.viewDetails')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </FixedLink>
            </div>
            <HomeLocalNomads 
              maxUsers={6}
              showPagination={true}
              showLocationDetection={true}
              showStats={true}
            />
          </div>
        </section>



        {/* Add City Form Modal */}
        <AddCityForm
          isOpen={showAddCityForm}
          onClose={() => setShowAddCityForm(false)}
          onSubmit={handleAddCity}
        />
      </div>

      {/* Quick Start Wizard */}
      <QuickStartWizard />
    </PageLayout>
  )
} 