import { supabase } from './supabase'
import { decodeTokenClient, isTokenExpiredClient, JWTPayload } from './jwt'
import { encryptLocalStorage, decryptLocalStorage, secureRemoveLocalStorage } from './encryption'
import { logInfo, logError } from './logger'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  current_city?: string
  created_at: string
}

export interface SessionToken {
  userId: string
  email: string
  exp: number
}

// 客户端获取会话令牌（从加密的localStorage）
export function getSessionToken(): SessionToken | null {
  try {
    if (typeof window === 'undefined') {
      return null
    }
    
    const encryptedToken = localStorage.getItem('session_token')
    
    if (!encryptedToken) {
      return null
    }

    const token = decryptLocalStorage<string>('session_token')
    if (!token) {
      logError('Failed to decrypt session token', null, 'Auth')
      return null
    }

    // 客户端解码JWT令牌（不验证签名）
    const decoded = decodeTokenClient(token)
    if (!decoded) {
      logError('Failed to decode session token', null, 'Auth')
      clearSession()
      return null
    }
    
    // 检查令牌是否过期
    if (isTokenExpiredClient(token)) {
      logInfo('Session token expired, removing', { userId: decoded.userId }, 'Auth')
      clearSession()
      return null
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      exp: decoded.exp || 0
    }
  } catch (error) {
    logError('Failed to get session token', error, 'Auth')
    clearSession()
    return null
  }
}

// 设置会话令牌（从服务器接收的token）
export function setSessionToken(token: string): void {
  try {
    encryptLocalStorage('session_token', token)
    logInfo('Session token set successfully', { token: token.substring(0, 20) + '...' }, 'Auth')
  } catch (error) {
    logError('Failed to set session token', error, 'Auth')
    throw error
  }
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionToken = getSessionToken()
    
    if (!sessionToken) {
      return null
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionToken.userId)
      .single()

    if (error || !user) {
      logError('Failed to fetch user data', error, 'Auth')
      return null
    }

    return user
  } catch (error) {
    logError('Failed to get current user', error, 'Auth')
    return null
  }
}

// 检查用户是否已登录
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user !== null
  } catch (error) {
    logError('Failed to check authentication status', error, 'Auth')
    return false
  }
}

// 清除会话
export function clearSession() {
  try {
    if (typeof window !== 'undefined') {
      secureRemoveLocalStorage('session_token')
      logInfo('Session cleared successfully', null, 'Auth')
    }
  } catch (error) {
    logError('Failed to clear session', error, 'Auth')
  }
}

// 刷新会话令牌
export async function refreshSession(): Promise<boolean> {
  try {
    const currentToken = localStorage.getItem('session_token')
    if (!currentToken) return false

    const token = decryptLocalStorage<string>('session_token')
    if (!token) return false

    if (!isTokenExpiredClient(token)) {
      return true // 令牌仍然有效
    }

    // 令牌过期，需要重新登录
    clearSession()
    return false
  } catch (error) {
    logError('Failed to refresh session', error, 'Auth')
    clearSession()
    return false
  }
}
