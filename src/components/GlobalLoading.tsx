'use client'

import { useLoading } from '@/contexts/GlobalStateContext'
import LoadingSpinner from './LoadingSpinner'

export default function GlobalLoading() {
  const { loading } = useLoading()

  // 检查是否有任何加载状态
  const isLoading = loading.global || loading.auth || loading.data || loading.ui

  // 如果没有任何加载状态，不显示
  if (!isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {loading.global && '正在加载...'}
              {loading.auth && '正在验证身份...'}
              {loading.data && '正在获取数据...'}
              {loading.ui && '正在更新界面...'}
            </h3>
            <p className="text-sm text-gray-600">
              {loading.global && '请稍候，正在初始化应用'}
              {loading.auth && '正在验证您的登录状态'}
              {loading.data && '正在从服务器获取最新数据'}
              {loading.ui && '正在更新用户界面'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
