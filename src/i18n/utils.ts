import { Locale, defaultLocale } from './config'

const LOCALE_KEY = 'nomad-locale'

export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  // First try to get from URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const urlLocale = urlParams.get('lang') as Locale
  
  if (urlLocale && ['en', 'zh', 'es', 'ja'].includes(urlLocale)) {
    return urlLocale
  }

  // Then try to get from localStorage
  const storedLocale = localStorage.getItem(LOCALE_KEY) as Locale
  if (storedLocale && ['en', 'zh', 'es', 'ja'].includes(storedLocale)) {
    return storedLocale
  }

  // Always return default locale (English) instead of browser language
  return defaultLocale
}

export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return
  }

  // Save to localStorage
  localStorage.setItem(LOCALE_KEY, locale)

  // Update URL parameter
  const url = new URL(window.location.href)
  url.searchParams.set('lang', locale)
  
  // Update URL without reloading the page
  window.history.replaceState({}, '', url.toString())
}

export function t(key: string, params?: Record<string, string>): string {
  // This function is kept for backward compatibility
  // The actual translation logic is now in the useTranslation hook
  return key
}
