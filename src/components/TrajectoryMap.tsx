'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import 'leaflet/dist/leaflet.css'

interface CityTrajectory {
  id: string
  cityName: string
  country: string
  startDate: string
  endDate: string | null
  daysStayed: number
  type: 'residence' | 'visit' | 'work'
  notes: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface TrajectoryMapProps {
  trajectories: CityTrajectory[]
  className?: string
}

// 城市坐标数据（示例数据，实际可以从API获取）
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Chiang Mai': { lat: 18.7883, lng: 98.9853 },
  'Bali': { lat: -8.3405, lng: 115.0920 },
  'Barcelona': { lat: 41.3851, lng: 2.1734 },
  'Lisbon': { lat: 38.7223, lng: -9.1393 },
  'Porto': { lat: 41.1579, lng: -8.6291 },
  'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
  'Hanoi': { lat: 21.0285, lng: 105.8542 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Osaka': { lat: 34.6937, lng: 135.5023 },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'Valencia': { lat: 39.4699, lng: -0.3763 },
  'Seville': { lat: 37.3891, lng: -5.9845 },
  'Granada': { lat: 37.1765, lng: -3.5976 },
  'Faro': { lat: 37.0194, lng: -7.9304 },
  'Coimbra': { lat: 40.2033, lng: -8.4103 },
  'Braga': { lat: 41.5454, lng: -8.4265 },
  'Phuket': { lat: 7.8804, lng: 98.3923 },
  'Koh Samui': { lat: 9.5120, lng: 100.0136 },
  'Da Nang': { lat: 16.0544, lng: 108.2022 },
  'Hoi An': { lat: 15.8801, lng: 108.3383 },
  'Kyoto': { lat: 35.0116, lng: 135.7681 },
  'Fukuoka': { lat: 33.5902, lng: 130.4017 },
  'Yokohama': { lat: 35.4437, lng: 139.6380 },
  'Nagoya': { lat: 35.1815, lng: 136.9066 },
  'Kobe': { lat: 34.6901, lng: 135.1955 },
  'Sapporo': { lat: 43.0618, lng: 141.3545 },
  'Sendai': { lat: 38.2688, lng: 140.8721 },
  'Hiroshima': { lat: 34.3853, lng: 132.4553 },
  'Nara': { lat: 34.6851, lng: 135.8048 },
  'Kanazawa': { lat: 36.5613, lng: 136.6562 },
  'Takayama': { lat: 36.1461, lng: 137.2522 },
  'Hakone': { lat: 35.2324, lng: 139.1067 },
  'Nikko': { lat: 36.7500, lng: 139.6167 },
  'Kamakura': { lat: 35.3192, lng: 139.5467 },
  'Yokosuka': { lat: 35.2815, lng: 139.6722 },
  'Chiba': { lat: 35.6073, lng: 140.1063 },
  'Kawasaki': { lat: 35.5309, lng: 139.7030 },
  'Saitama': { lat: 35.8616, lng: 139.6455 },
  'Kawagoe': { lat: 35.9251, lng: 139.4858 },
  'Kumamoto': { lat: 32.7898, lng: 130.7417 },
  'Kagoshima': { lat: 31.5602, lng: 130.5581 },
  'Miyazaki': { lat: 31.9072, lng: 131.4204 },
  'Oita': { lat: 33.2381, lng: 131.6126 },
  'Fukui': { lat: 36.0652, lng: 136.2197 },
  'Toyama': { lat: 36.6953, lng: 137.2113 },
  'Ishikawa': { lat: 36.5947, lng: 136.6256 },
  'Fukushima': { lat: 37.7500, lng: 140.4678 },
  'Yamagata': { lat: 38.2554, lng: 140.3396 },
  'Akita': { lat: 39.7200, lng: 140.1025 },
  'Aomori': { lat: 40.8243, lng: 140.7404 },
  'Iwate': { lat: 39.7036, lng: 141.1527 },
  'Miyagi': { lat: 38.2688, lng: 140.8721 },
  'Ibaraki': { lat: 36.3414, lng: 140.4468 },
  'Tochigi': { lat: 36.5657, lng: 139.8836 },
  'Gunma': { lat: 36.3912, lng: 139.0608 },
  'Niigata': { lat: 37.9024, lng: 139.0232 },
  'Yamanashi': { lat: 35.6642, lng: 138.5685 },
  'Nagano': { lat: 36.6513, lng: 138.1812 },
  'Gifu': { lat: 35.3912, lng: 136.7223 },
  'Shizuoka': { lat: 34.9769, lng: 138.3831 },
  'Aichi': { lat: 35.1802, lng: 136.9066 },
  'Mie': { lat: 34.7303, lng: 136.5086 },
  'Shiga': { lat: 35.0045, lng: 135.8686 },
  'Hyogo': { lat: 34.6901, lng: 135.1955 },
  'Wakayama': { lat: 34.2261, lng: 135.1675 },
  'Tottori': { lat: 35.5039, lng: 134.2383 },
  'Shimane': { lat: 35.4723, lng: 133.0505 },
  'Okayama': { lat: 34.6618, lng: 133.9344 },
  'Yamaguchi': { lat: 34.1861, lng: 131.4705 },
  'Tokushima': { lat: 34.0658, lng: 134.5593 },
  'Kagawa': { lat: 34.3401, lng: 134.0433 },
  'Ehime': { lat: 33.8416, lng: 132.7660 },
  'Kochi': { lat: 33.5597, lng: 133.5311 },
  'Saga': { lat: 33.2494, lng: 130.2988 },
  'Nagasaki': { lat: 32.7503, lng: 129.8777 },
  'Okinawa': { lat: 26.2124, lng: 127.6809 }
}

export default function TrajectoryMap({ trajectories, className = '' }: TrajectoryMapProps) {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || !trajectories.length) return

    // 动态导入 Leaflet（避免 SSR 问题）
    const initMap = async () => {
      try {
        const L = await import('leaflet')
        
        // Leaflet CSS 应该通过静态导入或本地文件加载，避免 CSP 问题
        // 如果 CSS 未加载，使用内联样式作为备选方案

        // 创建地图实例
        const map = L.map(mapRef.current!).setView([20, 0], 2)
        mapInstanceRef.current = map

        // 添加 OpenStreetMap 图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // 添加城市标记
        const markers: any[] = []
        const lines: any[] = []

        // 按时间排序轨迹
        const sortedTrajectories = [...trajectories].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )

        sortedTrajectories.forEach((trajectory, index) => {
          const cityKey = `${trajectory.cityName}, ${trajectory.country}`
          const coordinates = CITY_COORDINATES[trajectory.cityName] || 
                            CITY_COORDINATES[trajectory.cityName.split(' ')[0]] ||
                            { lat: 0, lng: 0 }

          if (coordinates.lat !== 0 && coordinates.lng !== 0) {
            // 创建标记
            const markerColor = getMarkerColor(trajectory.type)
            const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
              radius: 8,
              fillColor: markerColor,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map)

            // 添加弹出信息
            const popupContent = `
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${trajectory.cityName}</h3>
                <p class="text-sm text-gray-600">${trajectory.country}</p>
                <p class="text-sm text-gray-500">
                  ${trajectory.startDate} - ${trajectory.endDate || '至今'}
                </p>
                <p class="text-sm text-gray-500">
                  ${trajectory.daysStayed} 天 • ${getTypeText(trajectory.type)}
                </p>
                ${trajectory.notes ? `<p class="text-sm text-gray-400 mt-1">${trajectory.notes}</p>` : ''}
              </div>
            `
            marker.bindPopup(popupContent)
            markers.push(marker)

            // 连接线（如果有下一个城市）
            if (index < sortedTrajectories.length - 1) {
              const nextTrajectory = sortedTrajectories[index + 1]
              const nextCityKey = `${nextTrajectory.cityName}, ${nextTrajectory.country}`
              const nextCoordinates = CITY_COORDINATES[nextTrajectory.cityName] || 
                                   CITY_COORDINATES[nextTrajectory.cityName.split(' ')[0]] ||
                                   { lat: 0, lng: 0 }

              if (nextCoordinates.lat !== 0 && nextCoordinates.lng !== 0) {
                const line = L.polyline([
                  [coordinates.lat, coordinates.lng],
                  [nextCoordinates.lat, nextCoordinates.lng]
                ], {
                  color: '#3B82F6',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '5, 10'
                }).addTo(map)
                lines.push(line)
              }
            }
          }
        })

        // 调整地图视图以显示所有标记
        if (markers.length > 0) {
          const group = L.featureGroup(markers)
          map.fitBounds(group.getBounds().pad(0.1))
        }

        setIsMapLoaded(true)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [trajectories])

  // 获取标记颜色
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'residence':
        return '#10B981' // 绿色 - 居住
      case 'work':
        return '#F59E0B' // 橙色 - 工作
      case 'visit':
        return '#3B82F6' // 蓝色 - 访问
      default:
        return '#6B7280' // 灰色 - 默认
    }
  }

  // 获取类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'residence':
        return '居住'
      case 'work':
        return '工作'
      case 'visit':
        return '访问'
      default:
        return '未知'
    }
  }

  if (!trajectories.length) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          暂无轨迹数据，开始记录您的旅行吧！
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          旅行轨迹地图
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>居住</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>工作</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>访问</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ minHeight: '384px' }}
      >
        {!isMapLoaded && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">加载地图中...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        点击城市标记查看详细信息 • 虚线显示旅行路径
      </div>
    </div>
  )
}
