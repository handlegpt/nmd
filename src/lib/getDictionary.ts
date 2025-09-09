// 静态导入翻译文件，避免动态导入错误
import zhTranslations from '../locales/zh.json'
import enTranslations from '../locales/en.json'
import jaTranslations from '../locales/ja.json'

// 翻译文件映射
const TRANSLATIONS_MAP = {
  zh: zhTranslations,
  en: enTranslations,
  ja: jaTranslations,
} as const

export const getDictionary = async (locale: string) => {
  try {
    // 直接返回对应的翻译文件，无需动态导入
    switch (locale) {
      case 'zh':
        return TRANSLATIONS_MAP.zh
      case 'ja':
        return TRANSLATIONS_MAP.ja
      case 'en':
      default:
        return TRANSLATIONS_MAP.en
    }
  } catch (error) {
    console.error('❌ Failed to get dictionary for locale:', locale, error)
    // 如果出错，返回英文
    return TRANSLATIONS_MAP.en
  }
} 