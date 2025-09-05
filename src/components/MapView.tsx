'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Users, Settings, Eye, EyeOff, Navigation, Star } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { MeetupUser } from '@/lib/meetupApi'

interface MapViewProps {
  users: MeetupUser[]
  currentLocation?: { latitude: number; longitude: number }
  onUserClick?: (user: MeetupUser) => void
  className?: string
}

interface MapMarker {
  id: string
  position: { lat: number; lng: number }
  user: MeetupUser
  cluster?: boolean
  clusterCount?: number
}

export default function MapView({ 
  users, 
  currentLocation, 
  onUserClick,
  className = "" 
}: MapViewProps) {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [showMyLocation, setShowMyLocation] = useState(true)
  const [clusterView, setClusterView] = useState(true)
  const [selectedUser, setSelectedUser] = useState<MeetupUser | null>(null)
  const [mapLoading, setMapLoading] = useState(true)

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        setMapLoading(true)
        
        // 模拟地图初始化（实际项目中会使用真实的地图API）
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 这里应该初始化真实的地图（如Google Maps, Mapbox等）
        // 为了演示，我们创建一个模拟的地图容器
        const mapContainer = mapRef.current
        if (!mapContainer) {
          throw new Error('Map container not found')
        }
        
        mapContainer.style.position = 'relative'
        mapContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        mapContainer.style.borderRadius = '12px'
        mapContainer.style.overflow = 'hidden'
        
        setMap({ container: mapContainer })
        setMapLoading(false)
      } catch (error) {
        console.error('Failed to initialize map:', error)
        setMapLoading(false)
      }
    }

    initMap()
  }, [])

  // 生成地图标记
  useEffect(() => {
    if (!map || !users.length) return

    const generateMarkers = () => {
      const newMarkers: MapMarker[] = []
      
      users.forEach(user => {
        // 模拟用户位置（实际项目中会使用真实坐标）
        const lat = (Math.random() - 0.5) * 0.1 + (currentLocation?.latitude || 35.6762)
        const lng = (Math.random() - 0.5) * 0.1 + (currentLocation?.longitude || 139.6503)
        
        newMarkers.push({
          id: user.id,
          position: { lat, lng },
          user
        })
      })

      // 聚类处理
      if (clusterView) {
        const clusteredMarkers = clusterMarkers(newMarkers)
        setMarkers(clusteredMarkers)
      } else {
        setMarkers(newMarkers)
      }
    }

    generateMarkers()
  }, [map, users, clusterView, currentLocation])

  // 简单的聚类算法
  const clusterMarkers = (markers: MapMarker[]): MapMarker[] => {
    const clusters: MapMarker[][] = []
    const clusterRadius = 0.01 // 约1km

    markers.forEach(marker => {
      let addedToCluster = false
      
      for (const cluster of clusters) {
        const clusterCenter = getClusterCenter(cluster)
        const distance = calculateDistance(
          marker.position.lat,
          marker.position.lng,
          clusterCenter.lat,
          clusterCenter.lng
        )
        
        if (distance < clusterRadius) {
          cluster.push(marker)
          addedToCluster = true
          break
        }
      }
      
      if (!addedToCluster) {
        clusters.push([marker])
      }
    })

    return clusters.map(cluster => {
      if (cluster.length === 1) {
        return cluster[0]
      } else {
        const center = getClusterCenter(cluster)
        return {
          id: `cluster-${center.lat}-${center.lng}`,
          position: center,
          user: cluster[0].user, // 使用第一个用户作为代表
          cluster: true,
          clusterCount: cluster.length
        }
      }
    })
  }

  const getClusterCenter = (cluster: MapMarker[]) => {
    const totalLat = cluster.reduce((sum, m) => sum + m.position.lat, 0)
    const totalLng = cluster.reduce((sum, m) => sum + m.position.lng, 0)
    return {
      lat: totalLat / cluster.length,
      lng: totalLng / cluster.length
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.cluster) {
      // 展开聚类
      setClusterView(false)
    } else {
      setSelectedUser(marker.user)
      onUserClick?.(marker.user)
    }
  }

  const handleShowMyLocation = () => {
    setShowMyLocation(!showMyLocation)
    // 实际项目中会调用地图API来显示/隐藏用户位置
  }

  const handleClusterToggle = () => {
    setClusterView(!clusterView)
  }

  if (mapLoading) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`} style={{ height: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('meetup.mapIntegration.title')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 地图容器 */}
      <div 
        ref={mapRef}
        className="w-full h-96 rounded-xl relative overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* 地图标记 */}
        {markers.map(marker => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{
              left: `${50 + (marker.position.lng - (currentLocation?.longitude || 139.6503)) * 1000}%`,
              top: `${50 - (marker.position.lat - (currentLocation?.latitude || 35.6762)) * 1000}%`,
            }}
            onClick={() => handleMarkerClick(marker)}
          >
            {marker.cluster ? (
              <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-medium shadow-lg">
                <Users className="h-4 w-4 inline mr-1" />
                {marker.clusterCount}
              </div>
            ) : (
              <div className="relative">
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>
            )}
          </div>
        ))}

        {/* 我的位置标记 */}
        {showMyLocation && currentLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <Navigation className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* 地图控制按钮 */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={handleShowMyLocation}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title={showMyLocation ? t('meetup.mapIntegration.hideMyLocation') : t('meetup.mapIntegration.showMyLocation')}
          >
            {showMyLocation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handleClusterToggle}
            className={`p-2 rounded-lg shadow-lg transition-colors ${
              clusterView ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
            title={clusterView ? t('meetup.mapIntegration.individualView') : t('meetup.mapIntegration.clusterView')}
          >
            <Users className="h-4 w-4" />
          </button>
        </div>

        {/* 地图信息面板 */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4" />
              <span>{users.length} {t('meetup.mapIntegration.nearbyNomads')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{t('meetup.mapIntegration.distanceRadius')}: 50km</span>
            </div>
          </div>
        </div>
      </div>

      {/* 用户详情面板 */}
      {selectedUser && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {selectedUser.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
              <p className="text-sm text-gray-600">{selectedUser.location}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-gray-500">
                  {selectedUser.meetupCompatibility}% {t('meetup.compatibility', { percentage: selectedUser.meetupCompatibility?.toString() || '0' })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              {t('meetup.quickChat')}
            </button>
            <button className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
              {t('meetup.coffeeMeetup')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
