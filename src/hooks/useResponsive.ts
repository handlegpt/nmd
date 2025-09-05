import { useState, useEffect } from 'react'
import { Breakpoint, DeviceType } from '@/types'

// 断点配置
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// 设备类型判断
const getDeviceType = (width: number): DeviceType => {
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// 当前断点判断
const getCurrentBreakpoint = (width: number): Breakpoint => {
  if (width >= 1536) return '2xl'
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 768) return 'md'
  if (width >= 640) return 'sm'
  return 'xs'
}

// 响应式钩子
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // 只在客户端运行
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })
      
      const newDeviceType = getDeviceType(width)
      const newBreakpoint = getCurrentBreakpoint(width)
      
      setDeviceType(newDeviceType)
      setBreakpoint(newBreakpoint)
      setIsMobile(newDeviceType === 'mobile')
      setIsTablet(newDeviceType === 'tablet')
      setIsDesktop(newDeviceType === 'desktop')
    }

    // 初始化
    handleResize()

    // 添加事件监听器
    window.addEventListener('resize', handleResize)
    
    // 清理
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 断点比较工具
  const isAbove = (bp: Breakpoint): boolean => {
    return windowSize.width >= BREAKPOINTS[bp]
  }

  const isBelow = (bp: Breakpoint): boolean => {
    return windowSize.width < BREAKPOINTS[bp]
  }

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max]
  }

  // 触摸设备检测
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkTouchDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTouchDevice(hasTouchScreen)
    }
    
    checkTouchDevice()
  }, [])

  // 方向检测
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return {
    // 尺寸信息
    width: windowSize.width,
    height: windowSize.height,
    
    // 设备类型
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    
    // 断点信息
    breakpoint,
    isAbove,
    isBelow,
    isBetween,
    
    // 特殊检测
    isTouchDevice,
    orientation,
    
    // 断点常量
    breakpoints: BREAKPOINTS,
  }
}

// 移动端专用钩子
export function useMobile() {
  const { isMobile, isTablet } = useResponsive()
  return {
    isMobile,
    isTablet,
    isMobileOrTablet: isMobile || isTablet,
  }
}

// 桌面端专用钩子
export function useDesktop() {
  const { isDesktop } = useResponsive()
  return { isDesktop }
}

// 触摸设备专用钩子
export function useTouchDevice() {
  const { isTouchDevice } = useResponsive()
  return { isTouchDevice }
}

// 方向专用钩子
export function useOrientation() {
  const { orientation } = useResponsive()
  return { orientation }
}
