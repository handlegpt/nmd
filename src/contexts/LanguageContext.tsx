'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale } from '@/i18n/config'
import { setLocale } from '@/i18n/utils'
import { Translations } from '@/types/translations'

// 静态导入翻译文件
import zhTranslations from '@/locales/zh.json'
import enTranslations from '@/locales/en.json'
import jaTranslations from '@/locales/ja.json'

// 翻译文件映射
const TRANSLATIONS_MAP: Record<Locale, Translations> = {
  zh: zhTranslations,
  en: enTranslations,
  ja: jaTranslations,
}

interface LanguageContextType {
  locale: Locale
  translations: Translations
  loading: boolean
  changeLocale: (newLocale: Locale) => Promise<void>
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>('en')
  const [translations, setCurrentTranslations] = useState<Translations>(TRANSLATIONS_MAP.en)
  const [loading, setLoading] = useState(false)

  // 初始化时设置翻译
  useEffect(() => {
    setCurrentTranslations(TRANSLATIONS_MAP[locale])
  }, [locale])

  // 监听 URL 变化
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        // 首先检查URL参数
        const urlParams = new URLSearchParams(window.location.search)
        const urlLocale = urlParams.get('lang') as Locale
        
        if (urlLocale && ['zh', 'ja', 'en'].includes(urlLocale)) {
          setCurrentLocale(urlLocale)
          return
        }
        
        // 然后检查路径
        const pathname = window.location.pathname
        if (pathname.startsWith('/zh')) {
          setCurrentLocale('zh')
        } else if (pathname.startsWith('/ja')) {
          setCurrentLocale('ja')
        } else {
          setCurrentLocale('en')
        }
      } catch (error) {
        console.error('Error handling URL change:', error)
      }
    }

    // 初始检查
    handleUrlChange()

    // 监听popstate事件
    window.addEventListener('popstate', handleUrlChange)

    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [])

  const changeLocale = async (newLocale: Locale) => {
    try {
      setLoading(true)
      console.log('🔍 Changing locale to:', newLocale)
      
      // 立即更新状态 - 确保所有组件都能立即响应
      setCurrentLocale(newLocale)
      setCurrentTranslations(TRANSLATIONS_MAP[newLocale])
      setLocale(newLocale)
      
      // 强制触发重新渲染
      setTimeout(() => {
        setLoading(false)
        console.log('✅ Locale changed to:', newLocale)
      }, 50)
      
    } catch (error) {
      console.error('❌ Failed to change locale:', error)
      // 回退到默认语言
      setCurrentLocale('en')
      setCurrentTranslations(TRANSLATIONS_MAP.en)
      setLocale('en')
      setLoading(false)
    }
  }

  const translate = (key: string, params?: Record<string, string>): string => {
    if (loading) {
      console.log('⏳ Translation loading, returning key:', key)
      return key
    }

    try {
      const keys = key.split('.')
      let value: any = keys.reduce((obj, k) => obj?.[k], translations as any)

      if (value === undefined || value === key) {
        console.warn('⚠️ Translation key not found:', key, 'in locale:', locale)
        return key
      }

      let result = String(value)
      if (params) {
        Object.entries(params).forEach(([param, replacement]) => {
          result = result.replace(new RegExp(`{${param}}`, 'g'), replacement)
        })
      }
      return result
    } catch (error) {
      console.error('❌ Translation error:', error)
      return key
    }
  }

  const value: LanguageContextType = {
    locale,
    translations,
    loading,
    changeLocale,
    t: translate
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 为了向后兼容，保留 useTranslation 名称
export function useTranslation() {
  return useLanguage()
}
