'use client'

import { useState, useEffect, useContext, createContext } from 'react'

export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
  lastLoginAt: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (email: string, code: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从localStorage或sessionStorage获取用户信息
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, code: string) => {
    try {
      setLoading(true)
      
      // 调用登录API
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      // 创建用户对象
      const userData: User = {
        id: data.user.id || `user_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }

      // 保存到localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    // 这里可以添加刷新用户信息的逻辑
    // 比如从服务器获取最新的用户信息
    console.log('Refreshing user data...')
  }

  const value: UserContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
