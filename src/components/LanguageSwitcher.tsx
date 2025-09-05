'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { Locale, locales, localeNames, localeFlags } from '@/i18n/config'
import { setLocale } from '@/i18n/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface LanguageSwitcherProps {
  onLanguageChange?: (locale: Locale) => void
}

export default function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const { locale: currentLocale, changeLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = async (locale: Locale) => {
    setLocale(locale)
    await changeLocale(locale)
    setIsOpen(false)
    onLanguageChange?.(locale)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                currentLocale === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 