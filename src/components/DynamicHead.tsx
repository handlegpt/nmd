'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/hooks/useTranslation'

export default function DynamicHead() {
  const { locale } = useLanguage()
  const { t } = useTranslation()

  useEffect(() => {
    // 更新页面标题
    document.title = t('site.title')
    
    // 更新meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t('site.description'))
    }
    
    // 更新Open Graph标题
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', t('site.ogTitle'))
    }
    
    // 更新Open Graph描述
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', t('site.ogDescription'))
    }
    
    // 更新Twitter标题
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', t('site.ogTitle'))
    }
    
    // 更新Twitter描述
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', t('site.ogDescription'))
    }
    
    // 更新语言属性
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en-US'
    
  }, [locale, t])

  return null
}
