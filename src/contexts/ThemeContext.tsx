'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 只在客户端环境下从localStorage加载主题设置
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    }
  }, [])

  useEffect(() => {
    // 只在客户端环境下保存主题设置到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
      
      // 应用主题
      applyTheme(theme)
    }
  }, [theme])

  const applyTheme = (selectedTheme: Theme) => {
    // 只在客户端环境下应用主题
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    if (selectedTheme === 'auto') {
      // 检测系统主题
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const systemIsDark = mediaQuery.matches
      
      setIsDark(systemIsDark)
      root.classList.toggle('dark', systemIsDark)
      
      // 监听系统主题变化
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
        root.classList.toggle('dark', e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      const isDarkTheme = selectedTheme === 'dark'
      setIsDark(isDarkTheme)
      root.classList.toggle('dark', isDarkTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
