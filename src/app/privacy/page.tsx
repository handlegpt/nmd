'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Shield, Lock, Eye, UserCheck, Cookie, Mail, Calendar } from 'lucide-react'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('privacy.subtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('privacy.lastUpdated', { date: currentDate })}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#introduction" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">1. Introduction</a>
              <a href="#information-collect" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">2. Information We Collect</a>
              <a href="#how-we-use" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">3. How We Use Your Information</a>
              <a href="#data-sharing" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">4. Data Sharing and Disclosure</a>
            </div>
            <div className="space-y-2">
              <a href="#data-security" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">5. Data Security</a>
              <a href="#your-rights" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">6. Your Rights and Choices</a>
              <a href="#cookies" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">7. Cookies and Tracking</a>
              <a href="#contact" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">8. Contact Us</a>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div id="introduction" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.introduction.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('privacy.introduction.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Information We Collect */}
        <div id="information-collect" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.informationWeCollect.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.informationWeCollect.description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.informationWeCollect.personalInfo.title')}</h3>
              <ul className="space-y-2">
                {[
                  t('privacy.informationWeCollect.personalInfoItems.0'),
                  t('privacy.informationWeCollect.personalInfoItems.1'),
                  t('privacy.informationWeCollect.personalInfoItems.2'),
                  t('privacy.informationWeCollect.personalInfoItems.3')
                ].map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.informationWeCollect.usageData.title')}</h3>
              <ul className="space-y-2">
                {[
                  t('privacy.informationWeCollect.usageDataItems.0'),
                  t('privacy.informationWeCollect.usageDataItems.1'),
                  t('privacy.informationWeCollect.usageDataItems.2'),
                  t('privacy.informationWeCollect.usageDataItems.3')
                ].map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div id="how-we-use" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.howWeUseInfo.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.howWeUseInfo.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              {[
                t('privacy.howWeUseInfo.purposes.0'),
                t('privacy.howWeUseInfo.purposes.1'),
                t('privacy.howWeUseInfo.purposes.2'),
                t('privacy.howWeUseInfo.purposes.3'),
                t('privacy.howWeUseInfo.purposes.4')
              ].map((purpose: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{purpose}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Sharing */}
        <div id="data-sharing" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.dataSharing.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.dataSharing.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              {[
                t('privacy.dataSharing.circumstances.0'),
                t('privacy.dataSharing.circumstances.1'),
                t('privacy.dataSharing.circumstances.2'),
                t('privacy.dataSharing.circumstances.3')
              ].map((circumstance: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">{circumstance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div id="data-security" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.dataSecurity.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.dataSecurity.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              {[
                t('privacy.dataSecurity.measures.0'),
                t('privacy.dataSecurity.measures.1'),
                t('privacy.dataSecurity.measures.2'),
                t('privacy.dataSecurity.measures.3')
              ].map((measure: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div id="your-rights" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.yourRights.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.yourRights.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              {[
                t('privacy.yourRights.rights.0'),
                t('privacy.yourRights.rights.1'),
                t('privacy.yourRights.rights.2'),
                t('privacy.yourRights.rights.3'),
                t('privacy.yourRights.rights.4')
              ].map((right: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">{right}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cookies */}
        <div id="cookies" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.cookies.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.cookies.description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.essential')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Required for basic functionality</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.analytics')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Help us improve our services</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-800">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.preferences')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Remember your settings</p>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div id="contact" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.contactUs.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.contactUs.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">privacy@nomadnow.app</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Response Time</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Within 24-48 hours</p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                <strong>Need immediate assistance?</strong> For urgent privacy concerns, please mark your email as "URGENT" in the subject line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
