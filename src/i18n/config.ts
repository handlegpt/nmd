export const locales = ['en', 'zh', 'ja'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames = {
  en: 'English',
  zh: '中文',
  ja: '日本語'
} as const

export const localeFlags = {
  en: '🇺🇸',
  zh: '🇨🇳',
  ja: '🇯🇵'
} as const
