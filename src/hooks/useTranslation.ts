'use client'

// 重新导出 LanguageContext 的 useTranslation 以保持向后兼容
// 这样所有使用 @/hooks/useTranslation 的组件都会自动使用统一的语言上下文
export { useTranslation } from '@/contexts/LanguageContext'