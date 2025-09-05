import { useState, useCallback, useMemo } from 'react'
import { City } from '@/types/city'
import { Coordinates } from '@/types'

export interface MapViewState {
  center: Coordinates
  zoom: number
  selectedCity?: City
  hoveredCity?: City
  showLabels: boolean
  showMarkers: boolean
  showHeatmap: boolean
}

export function useCityMap(cities: City[]) {
  const [mapState, setMapState] = useState<MapViewState>({
    center: { lat: 20, lng: 0 }, // 默认中心点
    zoom: 2,
    selectedCity: undefined,
    hoveredCity: undefined,
    showLabels: true,
    showMarkers: true,
    showHeatmap: false
  })

  // 更新地图状态
  const updateMapState = useCallback((updates: Partial<MapViewState>) => {
    setMapState(prev => ({ ...prev, ...updates }))
  }, [])

  // 选择城市
  const selectCity = useCallback((city: City) => {
    setMapState(prev => ({
      ...prev,
      selectedCity: city,
      center: city.coordinates,
      zoom: 8
    }))
  }, [])

  // 取消选择城市
  const deselectCity = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      selectedCity: undefined
    }))
  }, [])

  // 悬停城市
  const hoverCity = useCallback((city?: City) => {
    setMapState(prev => ({
      ...prev,
      hoveredCity: city
    }))
  }, [])

  // 重置地图视图
  const resetMapView = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      center: { lat: 20, lng: 0 },
      zoom: 2,
      selectedCity: undefined,
      hoveredCity: undefined
    }))
  }, [])

  // 缩放到城市
  const zoomToCity = useCallback((city: City, zoomLevel: number = 8) => {
    setMapState(prev => ({
      ...prev,
      center: city.coordinates,
      zoom: zoomLevel
    }))
  }, [])

  // 缩放到区域
  const zoomToRegion = useCallback((cities: City[]) => {
    if (cities.length === 0) return

    const bounds = getBounds(cities)
    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    }
    
    // 计算合适的缩放级别
    const latDiff = bounds.north - bounds.south
    const lngDiff = bounds.east - bounds.west
    const maxDiff = Math.max(latDiff, lngDiff)
    
    let zoom = 2
    if (maxDiff < 1) zoom = 10
    else if (maxDiff < 5) zoom = 8
    else if (maxDiff < 20) zoom = 6
    else if (maxDiff < 50) zoom = 4
    else zoom = 2

    setMapState(prev => ({
      ...prev,
      center,
      zoom
    }))
  }, [])

  // 获取地图边界
  const getBounds = useCallback((citiesToCheck: City[]) => {
    if (citiesToCheck.length === 0) {
      return {
        north: 90,
        south: -90,
        east: 180,
        west: -180
      }
    }

    const lats = citiesToCheck.map(city => city.coordinates.lat)
    const lngs = citiesToCheck.map(city => city.coordinates.lng)

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }, [])

  // 获取城市群组（按距离）
  const getCityClusters = useCallback((maxDistance: number = 100) => {
    const clusters: City[][] = []
    const visited = new Set<string>()

    cities.forEach(city => {
      if (visited.has(city.id)) return

      const cluster = [city]
      visited.add(city.id)

      cities.forEach(otherCity => {
        if (city.id === otherCity.id || visited.has(otherCity.id)) return

        const distance = calculateDistance(
          city.coordinates.lat,
          city.coordinates.lng,
          otherCity.coordinates.lat,
          otherCity.coordinates.lng
        )

        if (distance <= maxDistance) {
          cluster.push(otherCity)
          visited.add(otherCity.id)
        }
      })

      if (cluster.length > 1) {
        clusters.push(cluster)
      }
    })

    return clusters
  }, [cities])

  // 计算两点间距离（公里）
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // 获取附近城市
  const getNearbyCities = useCallback((city: City, maxDistance: number = 100) => {
    return cities
      .filter(otherCity => otherCity.id !== city.id)
      .map(otherCity => ({
        city: otherCity,
        distance: calculateDistance(
          city.coordinates.lat,
          city.coordinates.lng,
          otherCity.coordinates.lat,
          otherCity.coordinates.lng
        )
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  }, [cities, calculateDistance])

  // 地图统计信息
  const mapStats = useMemo(() => {
    const bounds = getBounds(cities)
    const totalCities = cities.length
    const selectedCity = mapState.selectedCity
    const nearbyCities = selectedCity ? getNearbyCities(selectedCity, 100) : []

    return {
      totalCities,
      bounds,
      selectedCity,
      nearbyCities: nearbyCities.length,
      viewportCenter: mapState.center,
      zoomLevel: mapState.zoom
    }
  }, [cities, mapState, getBounds, getNearbyCities])

  return {
    // 地图状态
    mapState,
    updateMapState,
    
    // 城市选择
    selectCity,
    deselectCity,
    hoverCity,
    
    // 地图控制
    resetMapView,
    zoomToCity,
    zoomToRegion,
    
    // 地理计算
    getBounds,
    getCityClusters,
    calculateDistance,
    getNearbyCities,
    
    // 统计信息
    mapStats
  }
}

// 计算距离的辅助函数
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
