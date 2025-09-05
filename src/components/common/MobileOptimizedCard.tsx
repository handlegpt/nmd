import React from 'react'
import { useMobile } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

interface MobileOptimizedCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

export default function MobileOptimizedCard({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'lg',
  hover = false,
  clickable = false,
  onClick,
}: MobileOptimizedCardProps) {
  const { isMobile, isTablet } = useMobile()

  // 移动端优化的样式
  const mobileStyles = {
    padding: isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6',
    shadow: isMobile ? 'shadow-sm' : isTablet ? 'shadow-md' : 'shadow-lg',
    rounded: isMobile ? 'rounded-lg' : isTablet ? 'rounded-xl' : 'rounded-2xl',
    touchTarget: isMobile ? 'min-h-[44px]' : '',
  }

  // 响应式padding
  const getPaddingClass = () => {
    if (isMobile) {
      switch (padding) {
        case 'none': return 'p-0'
        case 'sm': return 'p-3'
        case 'md': return 'p-4'
        case 'lg': return 'p-5'
        default: return 'p-4'
      }
    }
    
    switch (padding) {
      case 'none': return 'p-0'
      case 'sm': return 'p-4'
      case 'md': return 'p-6'
      case 'lg': return 'p-8'
      default: return 'p-6'
    }
  }

  // 响应式shadow
  const getShadowClass = () => {
    if (isMobile) {
      switch (shadow) {
        case 'none': return ''
        case 'sm': return 'shadow-sm'
        case 'md': return 'shadow-md'
        case 'lg': return 'shadow-lg'
        default: return 'shadow-md'
      }
    }
    
    switch (shadow) {
      case 'none': return ''
      case 'sm': return 'shadow-sm'
      case 'md': return 'shadow-md'
      case 'lg': return 'shadow-lg'
      default: return 'shadow-md'
    }
  }

  // 响应式rounded
  const getRoundedClass = () => {
    if (isMobile) {
      switch (rounded) {
        case 'none': return ''
        case 'sm': return 'rounded-md'
        case 'md': return 'rounded-lg'
        case 'lg': return 'rounded-xl'
        case 'xl': return 'rounded-2xl'
        default: return 'rounded-lg'
      }
    }
    
    switch (rounded) {
      case 'none': return ''
      case 'sm': return 'rounded-lg'
      case 'md': return 'rounded-xl'
      case 'lg': return 'rounded-2xl'
      case 'xl': return 'rounded-3xl'
      default: return 'rounded-xl'
    }
  }

  const baseClasses = cn(
    'bg-white dark:bg-gray-800',
    'transition-all duration-200 ease-in-out',
    getPaddingClass(),
    getShadowClass(),
    getRoundedClass(),
    border && 'border border-gray-200 dark:border-gray-700',
    hover && 'hover:shadow-lg hover:-translate-y-1',
    clickable && 'cursor-pointer active:scale-95',
    className
  )

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      aria-label={clickable ? 'Clickable card' : undefined}
    >
      {children}
    </div>
  )
}

// 移动端优化的卡片变体
export const MobileCard = {
  // 基础卡片
  Basic: (props: Omit<MobileOptimizedCardProps, 'shadow' | 'hover'>) => (
    <MobileOptimizedCard {...props} shadow="sm" hover={false} />
  ),
  
  // 交互式卡片
  Interactive: (props: Omit<MobileOptimizedCardProps, 'clickable' | 'hover'>) => (
    <MobileOptimizedCard {...props} clickable hover />
  ),
  
  // 强调卡片
  Emphasized: (props: Omit<MobileOptimizedCardProps, 'shadow' | 'border'>) => (
    <MobileOptimizedCard {...props} shadow="lg" border={false} />
  ),
  
  // 紧凑卡片
  Compact: (props: Omit<MobileOptimizedCardProps, 'padding'>) => (
    <MobileOptimizedCard {...props} padding="sm" />
  ),
  
  // 宽松卡片
  Spacious: (props: Omit<MobileOptimizedCardProps, 'padding'>) => (
    <MobileOptimizedCard {...props} padding="lg" />
  ),
}
