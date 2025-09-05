'use client'

import { useState, useEffect, useCallback } from 'react'
import { Locale } from '@/i18n/config'
import { setLocale } from '@/i18n/utils'
import { Translations } from '@/types/translations'

// 静态导入翻译文件，避免动态导入错误
import zhTranslations from '@/locales/zh.json'
import enTranslations from '@/locales/en.json'
import esTranslations from '@/locales/es.json'
import jaTranslations from '@/locales/ja.json'

// 定义翻译文件的类型
type TranslationFile = Translations

// 翻译文件映射
const TRANSLATIONS_MAP: Record<Locale, TranslationFile> = {
  zh: zhTranslations,
  en: enTranslations,
  es: esTranslations,
  ja: jaTranslations,
}

export function useTranslation() {
  const [locale, setCurrentLocale] = useState<Locale>('en')
  const [translations, setTranslations] = useState<TranslationFile>(TRANSLATIONS_MAP.en)
  const [loading, setLoading] = useState(false)

  // 初始化时设置翻译
  useEffect(() => {
    setTranslations(TRANSLATIONS_MAP[locale])
  }, [locale]) // TRANSLATIONS_MAP是静态对象，不需要作为依赖

  // 监听 URL 变化 - 只在组件挂载时执行一次
  useEffect(() => {
    // 简化URL变化处理，移除复杂的防重复逻辑
    const handleUrlChange = () => {
      try {
        // 首先检查URL参数
        const urlParams = new URLSearchParams(window.location.search)
        const urlLocale = urlParams.get('lang') as Locale
        
        if (urlLocale && ['zh', 'es', 'ja', 'en'].includes(urlLocale)) {
          setCurrentLocale(urlLocale)
          return
        }
        
        // 然后检查路径
        const pathname = window.location.pathname
        if (pathname.startsWith('/zh')) {
          setCurrentLocale('zh')
        } else if (pathname.startsWith('/es')) {
          setCurrentLocale('es')
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
  }, []) // 空依赖数组，只在挂载时执行一次

  const changeLocale = async (newLocale: Locale) => {
    try {
      setLoading(true)
      console.log('🔍 Changing locale to:', newLocale)
      
      // 立即更新状态
      setCurrentLocale(newLocale)
      setLocale(newLocale)
      setTranslations(TRANSLATIONS_MAP[newLocale])
      
      console.log('✅ Locale changed to:', newLocale)
    } catch (error) {
      console.error('❌ Failed to change locale:', error)
      // 回退到默认语言
      setCurrentLocale('en')
      setLocale('en')
      setTranslations(TRANSLATIONS_MAP.en)
    } finally {
      setLoading(false)
    }
  }

  const translate = useCallback((key: string, params?: Record<string, string>): string => {
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
  }, [loading, translations, locale])

  return {
    locale,
    loading,
    t: translate,
    changeLocale
  }
}
