'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Globe, Home, MapPin, FileText, User, Settings, LogOut, Languages, DollarSign } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import FixedLink from './FixedLink'
import { useUser } from '@/contexts/GlobalStateContext'
import { Locale, locales, localeNames, localeFlags } from '@/i18n/config'
import { setLocale } from '@/i18n/utils'

export default function MobileMenu() {
  const { t, locale: currentLocale, changeLocale } = useLanguage()
  const { user, logout } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  const handleLanguageChange = async (locale: Locale) => {
    setLocale(locale)
    await changeLocale(locale)
    setShowLanguageSelector(false)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const navigationItems = [
    {
      href: '/',
      icon: Home,
      label: t('navigation.home'),
      description: t('mobileMenu.homeDescription')
    },
    {
      href: '/nomadcities',
      icon: MapPin,
      label: t('navigation.cities'),
      description: t('mobileMenu.citiesDescription')
    },
    {
      href: '/nomadvisaguide',
      icon: FileText,
      label: t('navigation.visaGuide'),
      description: t('mobileMenu.visaGuideDescription')
    },
    {
      href: '/nomadtax',
      icon: DollarSign,
      label: t('navigation.tax'),
      description: t('mobileMenu.taxDescription')
    },
    {
      href: '/nomadtools',
      icon: Settings,
      label: t('navigation.tools'),
      description: t('mobileMenu.toolsDescription')
    },
    {
      href: '/dashboard',
      icon: User,
      label: t('navigation.dashboard'),
      description: t('mobileMenu.dashboardDescription')
    }
  ]

  return (
    <div className="lg:hidden">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors touch-manipulation"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl animate-slide-in">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t('mobileMenu.title')}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <FixedLink
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center p-4 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-manipulation min-h-[60px]"
                    >
                      <Icon className="h-5 w-5 mr-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </FixedLink>
                  )
                })}
              </nav>

              {/* Language Selector */}
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="flex items-center w-full p-4 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-manipulation min-h-[60px]"
                >
                  <Languages className="h-5 w-5 mr-4 text-gray-500" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t('mobileMenu.languageSettings')}</div>
                    <div className="text-sm text-gray-500">
                      {localeFlags[currentLocale]} {localeNames[currentLocale]}
                    </div>
                  </div>
                </button>
                
                {showLanguageSelector && (
                  <div className="mt-2 space-y-1">
                    {locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => handleLanguageChange(locale)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          currentLocale === locale 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{localeFlags[locale]}</span>
                        <span className="text-sm font-medium">{localeNames[locale]}</span>
                        {currentLocale === locale && (
                          <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {user.isAuthenticated ? (
                  <>
                    <div className="flex items-center p-3 rounded-lg bg-gray-50">
                      <User className="h-5 w-5 mr-3 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.profile?.email}</div>
                        <div className="text-sm text-gray-500">{t('common.login')}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 touch-manipulation min-h-[60px]"
                    >
                      <LogOut className="h-5 w-5 mr-4" />
                      <span className="font-medium">{t('auth.logout')}</span>
                    </button>
                  </>
                ) : (
                  <FixedLink
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center w-full p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 touch-manipulation min-h-[60px]"
                  >
                    <User className="h-5 w-5 mr-4" />
                    <span className="font-medium">{t('common.login')}</span>
                  </FixedLink>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
