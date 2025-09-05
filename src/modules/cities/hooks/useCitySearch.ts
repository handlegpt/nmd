import { useState, useCallback, useMemo } from 'react'
import { City, CitySearchParams } from '@/types/city'

export function useCitySearch(cities: City[]) {
  const [searchParams, setSearchParams] = useState<CitySearchParams>({
    query: '',
    country: '',
    region: '',
    categories: [],
    tags: [],
    cost_range: undefined,
    wifi_speed_min: 0,
    climate_type: undefined,
    visa_free_for: '',
    sort_by: 'rating',
    sort_order: 'desc',
    page: 1,
    limit: 20
  })

  // 搜索城市
  const searchCities = useCallback((params: Partial<CitySearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params, page: 1 }))
  }, [])

  // 重置搜索
  const resetSearch = useCallback(() => {
    setSearchParams({
      query: '',
      country: '',
      region: '',
      categories: [],
      tags: [],
      cost_range: undefined,
      wifi_speed_min: 0,
      climate_type: undefined,
      visa_free_for: '',
      sort_by: 'rating',
      sort_order: 'desc',
      page: 1,
      limit: 20
    })
  }, [])

  // 过滤后的城市
  const filteredCities = useMemo(() => {
    let result = [...cities]

    // 文本搜索
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase()
      result = result.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 国家筛选
    if (searchParams.country) {
      result = result.filter(city => city.country === searchParams.country)
    }

    // 地区筛选
    if (searchParams.region) {
      result = result.filter(city => city.region === searchParams.region)
    }

    // 分类筛选
    if (searchParams.categories && searchParams.categories.length > 0) {
      result = result.filter(city => 
        searchParams.categories!.some(cat => city.categories.includes(cat))
      )
    }

    // 标签筛选
    if (searchParams.tags && searchParams.tags.length > 0) {
      result = result.filter(city => 
        searchParams.tags!.some(tag => city.tags.includes(tag))
      )
    }

    // 成本范围筛选
    if (searchParams.cost_range) {
      // 这里需要城市详细信息，暂时跳过
      // result = result.filter(city => {
      //   const cost = city.cost_of_living?.total_monthly_usd || 0
      //   return cost >= searchParams.cost_range!.min && cost <= searchParams.cost_range!.max
      // })
    }

    // WiFi速度筛选
    if (searchParams.wifi_speed_min && searchParams.wifi_speed_min > 0) {
      // 这里需要城市详细信息，暂时跳过
      // result = result.filter(city => {
      //   const wifiSpeed = city.infrastructure?.wifi_speed_mbps || 0
      //   return wifiSpeed >= searchParams.wifi_speed_min!
      // })
    }

    // 气候类型筛选
    if (searchParams.climate_type) {
      // 这里需要城市详细信息，暂时跳过
      // result = result.filter(city => city.climate?.type === searchParams.climate_type)
    }

    // 签证筛选
    if (searchParams.visa_free_for) {
      // 这里需要城市详细信息，暂时跳过
      // result = result.filter(city => 
      //   city.visa_info?.visa_free_countries.includes(searchParams.visa_free_for!)
      // )
    }

    return result
  }, [cities, searchParams])

  // 排序后的城市
  const sortedCities = useMemo(() => {
    const sorted = [...filteredCities]
    
    switch (searchParams.sort_by || 'rating') {
      case 'rating':
        sorted.sort((a, b) => 
          (searchParams.sort_order || 'desc') === 'asc' 
            ? a.overall_rating - b.overall_rating
            : b.overall_rating - a.overall_rating
        )
        break
      case 'cost':
        // 暂时按名称排序
        sorted.sort((a, b) => 
          searchParams.sort_order === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
        break
      case 'wifi_speed':
        // 暂时按名称排序
        sorted.sort((a, b) => 
          searchParams.sort_order === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
        break
      case 'safety':
        // 暂时按名称排序
        sorted.sort((a, b) => 
          searchParams.sort_order === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
        break
      case 'created_at':
        sorted.sort((a, b) => 
          searchParams.sort_order === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      default:
        // 默认按评分排序
        sorted.sort((a, b) => b.overall_rating - a.overall_rating)
    }
    
    return sorted
  }, [filteredCities, searchParams.sort_by, searchParams.sort_order])

  // 分页后的城市
  const paginatedCities = useMemo(() => {
    const page = searchParams.page || 1
    const limit = searchParams.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    return sortedCities.slice(start, end)
  }, [sortedCities, searchParams.page, searchParams.limit])

  // 分页信息
  const pagination = useMemo(() => {
    const total = sortedCities.length
    const page = searchParams.page || 1
    const limit = searchParams.limit || 20
    const totalPages = Math.ceil(total / limit)
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, [sortedCities.length, searchParams.page, searchParams.limit])

  // 下一页
  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setSearchParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }, [pagination.hasNext])

  // 上一页
  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setSearchParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))
    }
  }, [pagination.hasPrev])

  // 跳转到指定页
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setSearchParams(prev => ({ ...prev, page }))
    }
  }, [pagination.totalPages])

  return {
    // 搜索参数
    searchParams,
    searchCities,
    resetSearch,
    
    // 搜索结果
    filteredCities,
    sortedCities,
    paginatedCities,
    
    // 分页
    pagination,
    nextPage,
    prevPage,
    goToPage,
    
    // 统计
    totalCities: cities.length,
    filteredCount: filteredCities.length
  }
}
