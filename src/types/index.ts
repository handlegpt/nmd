// 核心类型定义
export * from './user'
export * from './city'
export * from './place'
export * from './community'
export * from './tax'
export * from './common'

// 全局通用类型
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 主题相关类型
export type Theme = 'light' | 'dark' | 'system'

// 语言相关类型
export type Locale = 'zh-CN' | 'en-US' | 'es-ES' | 'ja-JP'

// 加载状态类型
export interface LoadingState {
  global: boolean
  auth: boolean
  data: boolean
  ui: boolean
}

// 错误状态类型
export interface ErrorState {
  message: string | null
  type: 'auth' | 'data' | 'ui' | null
  code?: string
  details?: any
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

// 地理位置类型
export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  city: string
  country: string
  coordinates?: Coordinates
  timezone?: string
}

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 权限类型
export type Permission = 'read' | 'write' | 'delete' | 'admin'

// 用户角色类型
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'
