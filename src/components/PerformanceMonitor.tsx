'use client'

import { useEffect, useRef } from 'react'

// 扩展Window接口以包含gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

interface PerformanceMetrics {
  FCP: number
  LCP: number
  FID: number
  CLS: number
  TTFB: number
  TTI: number
}

export default function PerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
    TTI: 0
  })

  useEffect(() => {
    // 监控First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metricsRef.current.FCP = entry.startTime
          console.log('FCP:', entry.startTime)
        }
      })
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // 监控Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        metricsRef.current.LCP = lastEntry.startTime
        console.log('LCP:', lastEntry.startTime)
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // 监控First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          metricsRef.current.FID = entry.processingStart - entry.startTime
          console.log('FID:', entry.processingStart - entry.startTime)
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // 监控Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          metricsRef.current.CLS = clsValue
          console.log('CLS:', clsValue)
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // 监控Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      metricsRef.current.TTFB = navigationEntry.responseStart - navigationEntry.requestStart
      console.log('TTFB:', navigationEntry.responseStart - navigationEntry.requestStart)
    }

    // 监控Time to Interactive (TTI)
    const ttiObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'TTI') {
          metricsRef.current.TTI = entry.startTime
          console.log('TTI:', entry.startTime)
        }
      })
    })
    ttiObserver.observe({ entryTypes: ['measure'] })

    // 发送性能数据到分析服务
    const sendMetrics = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'performance_metrics', {
          event_category: 'Performance',
          event_label: 'Core Web Vitals',
          value: Math.round(metricsRef.current.LCP),
          custom_map: {
            fcp: metricsRef.current.FCP,
            lcp: metricsRef.current.LCP,
            fid: metricsRef.current.FID,
            cls: metricsRef.current.CLS,
            ttfb: metricsRef.current.TTFB,
            tti: metricsRef.current.TTI
          }
        })
      }
    }

    // 页面卸载时发送数据
    window.addEventListener('beforeunload', sendMetrics)

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      ttiObserver.disconnect()
      window.removeEventListener('beforeunload', sendMetrics)
    }
  }, [])

  return null
}
