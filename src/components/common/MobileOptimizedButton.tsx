import React from 'react'
import { useMobile, useTouchDevice } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

interface MobileOptimizedButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  form?: string
  name?: string
  value?: string
}

export default function MobileOptimizedButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  form,
  name,
  value,
}: MobileOptimizedButtonProps) {
  const { isMobile, isTablet } = useMobile()
  const { isTouchDevice } = useTouchDevice()

  // 移动端优化的尺寸
  const getSizeClasses = () => {
    if (isMobile) {
      switch (size) {
        case 'xs': return 'px-2 py-1.5 text-xs min-h-[32px]'
        case 'sm': return 'px-3 py-2 text-sm min-h-[36px]'
        case 'md': return 'px-4 py-2.5 text-sm min-h-[44px]'
        case 'lg': return 'px-5 py-3 text-base min-h-[48px]'
        case 'xl': return 'px-6 py-4 text-lg min-h-[52px]'
        default: return 'px-4 py-2.5 text-sm min-h-[44px]'
      }
    }
    
    switch (size) {
      case 'xs': return 'px-2 py-1 text-xs min-h-[28px]'
      case 'sm': return 'px-3 py-1.5 text-sm min-h-[32px]'
      case 'md': return 'px-4 py-2 text-sm min-h-[36px]'
      case 'lg': return 'px-5 py-2.5 text-base min-h-[40px]'
      case 'xl': return 'px-6 py-3 text-lg min-h-[44px]'
      default: return 'px-4 py-2 text-sm min-h-[36px]'
    }
  }

  // 变体样式
  const getVariantClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    switch (variant) {
      case 'primary':
        return cn(
          baseClasses,
          'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
          'text-white shadow-sm hover:shadow-md',
          'focus:ring-blue-500',
          'disabled:bg-blue-400 disabled:cursor-not-allowed'
        )
      
      case 'secondary':
        return cn(
          baseClasses,
          'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
          'text-white shadow-sm hover:shadow-md',
          'focus:ring-gray-500',
          'disabled:bg-gray-400 disabled:cursor-not-allowed'
        )
      
      case 'outline':
        return cn(
          baseClasses,
          'border-2 border-blue-600 text-blue-600',
          'hover:bg-blue-50 active:bg-blue-100',
          'focus:ring-blue-500',
          'disabled:border-blue-300 disabled:text-blue-300 disabled:cursor-not-allowed'
        )
      
      case 'ghost':
        return cn(
          baseClasses,
          'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
          'focus:ring-gray-500',
          'disabled:text-gray-400 disabled:cursor-not-allowed'
        )
      
      case 'danger':
        return cn(
          baseClasses,
          'bg-red-600 hover:bg-red-700 active:bg-red-800',
          'text-white shadow-sm hover:shadow-md',
          'focus:ring-red-500',
          'disabled:bg-red-400 disabled:cursor-not-allowed'
        )
      
      case 'success':
        return cn(
          baseClasses,
          'bg-green-600 hover:bg-green-700 active:bg-green-800',
          'text-white shadow-sm hover:shadow-md',
          'focus:ring-green-500',
          'disabled:bg-green-400 disabled:cursor-not-allowed'
        )
      
      default:
        return baseClasses
    }
  }

  // 触摸设备优化
  const getTouchClasses = () => {
    if (isTouchDevice) {
      return 'active:scale-95 touch-manipulation'
    }
    return 'hover:scale-105 active:scale-95'
  }

  // 移动端优化
  const getMobileClasses = () => {
    if (isMobile) {
      return 'rounded-lg shadow-sm'
    }
    if (isTablet) {
      return 'rounded-xl shadow-md'
    }
    return 'rounded-lg shadow-md'
  }

  const baseClasses = cn(
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    getSizeClasses(),
    getVariantClasses(),
    getTouchClasses(),
    getMobileClasses(),
    fullWidth && 'w-full',
    className
  )

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!disabled && !loading) {
        onClick?.()
      }
    }
  }

  return (
    <button
      type={type}
      form={form}
      name={name}
      value={value}
      disabled={disabled || loading}
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className={cn(
        'flex items-center',
        icon && iconPosition === 'left' && 'ml-1',
        icon && iconPosition === 'right' && 'mr-1'
      )}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

// 移动端优化的按钮变体
export const MobileButton = {
  // 主要按钮
  Primary: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="primary" />
  ),
  
  // 次要按钮
  Secondary: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="secondary" />
  ),
  
  // 轮廓按钮
  Outline: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="outline" />
  ),
  
  // 幽灵按钮
  Ghost: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="ghost" />
  ),
  
  // 危险按钮
  Danger: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="danger" />
  ),
  
  // 成功按钮
  Success: (props: Omit<MobileOptimizedButtonProps, 'variant'>) => (
    <MobileOptimizedButton {...props} variant="success" />
  ),
  
  // 小按钮
  Small: (props: Omit<MobileOptimizedButtonProps, 'size'>) => (
    <MobileOptimizedButton {...props} size="sm" />
  ),
  
  // 大按钮
  Large: (props: Omit<MobileOptimizedButtonProps, 'size'>) => (
    <MobileOptimizedButton {...props} size="lg" />
  ),
  
  // 全宽按钮
  FullWidth: (props: Omit<MobileOptimizedButtonProps, 'fullWidth'>) => (
    <MobileOptimizedButton {...props} fullWidth />
  ),
}
