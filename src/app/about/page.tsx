'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Globe, Users, Heart, Target, Clock, MapPin, FileText, Shield } from 'lucide-react'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('about.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('about.mission.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('about.mission.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.features.globalInfo.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('about.features.globalInfo.description')}
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.features.communityDriven.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('about.features.communityDriven.description')}
              </p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.features.lifeExperience.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('about.features.lifeExperience.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t('about.coreFeatures.title')}</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.coreFeatures.realTimeInfo.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about.coreFeatures.realTimeInfo.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.coreFeatures.cityRecommendations.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about.coreFeatures.cityRecommendations.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Heart className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.coreFeatures.placeRecommendations.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about.coreFeatures.placeRecommendations.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('about.coreFeatures.visaManagement.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about.coreFeatures.visaManagement.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t('about.team.title')}</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            {t('about.team.description')}
          </p>
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t('about.team.belief')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
