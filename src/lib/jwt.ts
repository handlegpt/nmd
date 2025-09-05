import { logInfo, logError } from './logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface SessionToken {
  userId: string
  email: string
  exp: number
}

// 检查是否在服务器端环境
function isServerSide(): boolean {
  return typeof window === 'undefined'
}

// 动态导入JWT库（仅在服务器端）
async function getJWT() {
  if (!isServerSide()) {
    throw new Error('JWT operations are only available on the server side')
  }
  
  try {
    const jwt = await import('jsonwebtoken')
    return jwt.default
  } catch (error) {
    throw new Error('Failed to import JWT library')
  }
}

// 客户端安全的JWT解码（不验证签名）
export function decodeTokenClient(token: string): JWTPayload | null {
  try {
    if (!token) return null
    
    // 简单的base64解码，不验证签名
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload))
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    }
  } catch (error) {
    logError('Failed to decode JWT token on client', error, 'JWT')
    return null
  }
}

// 客户端检查令牌是否过期
export function isTokenExpiredClient(token: string): boolean {
  try {
    const decoded = decodeTokenClient(token)
    if (!decoded || !decoded.exp) return true
    
    return Date.now() >= decoded.exp * 1000
  } catch (error) {
    return true
  }
}

// 生成JWT令牌
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    // 确保在服务器端
    if (!isServerSide()) {
      throw new Error('JWT generation is only available on the server side')
    }
    
    // 确保JWT_SECRET存在且有效
    if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      console.warn('Using default JWT secret - not recommended for production')
    }
    
    // 验证payload
    if (!payload || !payload.userId || !payload.email) {
      throw new Error('Invalid payload: userId and email are required')
    }
    
    const jwt = await getJWT()
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'nomad-now',
      audience: 'nomad-now-users'
    })
    
    logInfo('JWT token generated successfully', { userId: payload.userId }, 'JWT')
    return token
  } catch (error) {
    logError('Failed to generate JWT token', error, 'JWT')
    throw new Error('Token generation failed')
  }
}

// 验证JWT令牌
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    // 确保在服务器端
    if (!isServerSide()) {
      throw new Error('JWT verification is only available on the server side')
    }
    
    const jwt = await getJWT()
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'nomad-now',
      audience: 'nomad-now-users'
    }) as JWTPayload
    
    logInfo('JWT token verified successfully', { userId: decoded.userId }, 'JWT')
    return decoded
  } catch (error) {
    logError('Failed to verify JWT token', error, 'JWT')
    throw new Error('Invalid token')
  }
}

// 解码令牌（不验证）
export async function decodeToken(token: string): Promise<JWTPayload | null> {
  try {
    // 确保在服务器端
    if (!isServerSide()) {
      throw new Error('JWT decoding is only available on the server side')
    }
    
    const jwt = await getJWT()
    
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    logError('Failed to decode JWT token', error, 'JWT')
    return null
  }
}

// 检查令牌是否过期
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = await decodeToken(token)
    if (!decoded || !decoded.exp) return true
    
    return Date.now() >= decoded.exp * 1000
  } catch (error) {
    return true
  }
}

// 刷新令牌
export async function refreshToken(token: string): Promise<string> {
  try {
    const decoded = await verifyToken(token)
    const { iat, exp, ...payload } = decoded
    
    return await generateToken(payload)
  } catch (error) {
    logError('Failed to refresh JWT token', error, 'JWT')
    throw new Error('Token refresh failed')
  }
}
