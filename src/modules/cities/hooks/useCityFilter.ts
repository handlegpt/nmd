import { useState, useCallback, useMemo } from 'react'
import { City, CityCategory } from '@/types/city'

export interface CityFilterState {
  categories: CityCategory[]
  costRange: [number, number]
  wifiSpeedMin: number
  climateType?: string
  tags: string[]
  countries: string[]
  regions: string[]
}

export function useCityFilter(cities: City[]) {
  const [filters, setFilters] = useState<CityFilterState>({
    categories: [],
    costRange: [0, 5000],
    wifiSpeedMin: 0,
    climateType: undefined,
    tags: [],
    countries: [],
    regions: []
  })

  // 更新筛选器
  const updateFilter = useCallback((updates: Partial<CityFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // 重置筛选器
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      costRange: [0, 5000],
      wifiSpeedMin: 0,
      climateType: undefined,
      tags: [],
      countries: [],
      regions: []
    })
  }, [])

  // 应用筛选器
  const applyFilters = useCallback((citiesToFilter: City[]) => {
    let result = [...citiesToFilter]

    // 分类筛选
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(city => 
        filters.categories.some(cat => city.categories.includes(cat))
      )
    }

    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(city => 
        filters.tags.some(tag => city.tags.includes(tag))
      )
    }

    // 国家筛选
    if (filters.countries && filters.countries.length > 0) {
      result = result.filter(city => 
        filters.countries.includes(city.country)
      )
    }

    // 地区筛选
    if (filters.regions && filters.regions.length > 0) {
      result = result.filter(city => 
        city.region && filters.regions.includes(city.region)
      )
    }

    // 成本范围筛选（需要详细信息）
    if (filters.costRange[0] > 0 || filters.costRange[1] < 5000) {
      // 暂时跳过，需要城市详细信息
    }

    // WiFi速度筛选（需要详细信息）
    if (filters.wifiSpeedMin > 0) {
      // 暂时跳过，需要城市详细信息
    }

    // 气候类型筛选（需要详细信息）
    if (filters.climateType) {
      // 暂时跳过，需要城市详细信息
    }

    return result
  }, [filters])

  // 获取可用的筛选选项
  const availableOptions = useMemo(() => {
    const categories = new Set<CityCategory>()
    const tags = new Set<string>()
    const countries = new Set<string>()
    const regions = new Set<string>()

    cities.forEach(city => {
      city.categories.forEach(cat => categories.add(cat))
      city.tags.forEach(tag => tags.add(tag))
      countries.add(city.country)
      if (city.region) regions.add(city.region)
    })

    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
      countries: Array.from(countries).sort(),
      regions: Array.from(regions).sort()
    }
  }, [cities])

  // 获取筛选统计
  const filterStats = useMemo(() => {
    const totalCities = cities.length
    const filteredCities = applyFilters(cities)
    const filteredCount = filteredCities.length

    return {
      totalCities,
      filteredCount,
      filterPercentage: totalCities > 0 ? (filteredCount / totalCities) * 100 : 0
    }
  }, [cities, applyFilters])

  // 检查是否有活跃的筛选器
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.categories && filters.categories.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.countries && filters.countries.length > 0) ||
      (filters.regions && filters.regions.length > 0) ||
      filters.costRange[0] > 0 ||
      filters.costRange[1] < 5000 ||
      filters.wifiSpeedMin > 0 ||
      filters.climateType !== undefined
    )
  }, [filters])

  // 清除特定筛选器
  const clearCategoryFilter = useCallback(() => {
    updateFilter({ categories: [] })
  }, [updateFilter])

  const clearTagFilter = useCallback(() => {
    updateFilter({ tags: [] })
  }, [updateFilter])

  const clearCountryFilter = useCallback(() => {
    updateFilter({ countries: [] })
  }, [updateFilter])

  const clearRegionFilter = useCallback(() => {
    updateFilter({ regions: [] })
  }, [updateFilter])

  const clearCostFilter = useCallback(() => {
    updateFilter({ costRange: [0, 5000] })
  }, [updateFilter])

  const clearWifiFilter = useCallback(() => {
    updateFilter({ wifiSpeedMin: 0 })
  }, [updateFilter])

  const clearClimateFilter = useCallback(() => {
    updateFilter({ climateType: undefined })
  }, [updateFilter])

  return {
    // 筛选器状态
    filters,
    updateFilter,
    resetFilters,
    
    // 筛选功能
    applyFilters,
    hasActiveFilters,
    
    // 可用选项
    availableOptions,
    
    // 统计信息
    filterStats,
    
    // 清除特定筛选器
    clearCategoryFilter,
    clearTagFilter,
    clearCountryFilter,
    clearRegionFilter,
    clearCostFilter,
    clearWifiFilter,
    clearClimateFilter
  }
}
