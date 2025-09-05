'use client'

import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react'

// 懒加载组件
interface LazyLoadProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
}

export function LazyLoad({ 
  children, 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true)
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasIntersected])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}

// 虚拟滚动组件
interface VirtualScrollProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
}

export function VirtualScroll<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 防抖组件
interface DebounceProps {
  children: ReactNode
  delay?: number
  dependencies?: any[]
}

export function Debounce({ 
  children, 
  delay = 300, 
  dependencies = [] 
}: DebounceProps) {
  const [debouncedValue, setDebouncedValue] = useState(children)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(children)
    }, delay)

    return () => clearTimeout(timer)
  }, [children, delay, ...dependencies])

  return <>{debouncedValue}</>
}

// 节流组件
export function Throttle({ 
  children, 
  delay = 100, 
  dependencies = [] 
}: DebounceProps) {
  const [throttledValue, setThrottledValue] = useState(children)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now - lastRun.current >= delay) {
      setThrottledValue(children)
      lastRun.current = now
    }
  }, [children, delay, ...dependencies])

  return <>{throttledValue}</>
}

// 内存优化组件
interface MemoizedProps {
  children: ReactNode
  dependencies?: any[]
}

export function Memoized({ children, dependencies = [] }: MemoizedProps) {
  const memoizedChildren = useCallback(() => children, dependencies)
  return <>{memoizedChildren()}</>
}

// 预加载组件
interface PreloadProps {
  urls: string[]
  children: ReactNode
}

export function Preload({ urls, children }: PreloadProps) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = url.endsWith('.css') ? 'style' : 
               url.endsWith('.js') ? 'script' : 'fetch'
      link.href = url
      document.head.appendChild(link)
    })
  }, [urls])

  return <>{children}</>
}

// 错误边界组件
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">出错了</h2>
          <p className="text-red-600 text-sm">组件加载失败，请刷新页面重试</p>
        </div>
      )
    }

    return this.props.children
  }
}
