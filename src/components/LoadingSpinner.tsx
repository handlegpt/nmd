'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = '加载中...',
  className = '',
  variant = 'spinner',
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-t-blue-600',
    secondary: 'border-t-gray-600',
    success: 'border-t-green-600',
    warning: 'border-t-yellow-600',
    error: 'border-t-red-600'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`w-2 h-2 bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        )
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
        )
      case 'skeleton':
        return (
          <div className="space-y-3 w-full">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        )
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-300 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
        )
    }
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {renderSpinner()}
      {text && variant !== 'skeleton' && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

// 骨架屏组件
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>
    </div>
  )
}

// 页面加载组件
export function PageLoading({ text = '页面加载中...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="spinner" />
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  )
}

// 列表加载组件
export function ListLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
