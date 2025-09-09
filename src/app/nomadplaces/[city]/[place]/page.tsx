'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getPlaces } from '@/lib/api'
import { Place } from '@/lib/supabase'
import { parsePlaceUrl } from '@/lib/urlUtils'
import PageLayout from '@/components/PageLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { logInfo, logError } from '@/lib/logger'

export default function PlaceDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const { city, place } = params
  
  const [placeData, setPlaceData] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaceData()
  }, [city, place])

  const fetchPlaceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 从URL参数中解析城市和地点信息
      const citySlug = Array.isArray(city) ? city[0] : city
      const placeSlug = Array.isArray(place) ? place[0] : place
      
      logInfo('Fetching place data', { citySlug, placeSlug }, 'PlaceDetailPage')
      
      // 获取所有地点数据
      const places = await getPlaces()
      logInfo('Places data loaded', { count: places.length, places: places.map(p => ({ name: p.name, city_id: p.city_id })) }, 'PlaceDetailPage')
      
      // 根据城市和地点名称查找匹配的地点
      const matchedPlace = places.find(p => {
        const placeCitySlug = p.city_id.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const placeNameSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        
        logInfo('Matching place', { 
          placeName: p.name, 
          placeCityId: p.city_id,
          placeCitySlug, 
          placeNameSlug,
          targetCitySlug: citySlug,
          targetPlaceSlug: placeSlug,
          cityMatch: placeCitySlug === citySlug,
          nameMatch: placeNameSlug === placeSlug
        }, 'PlaceDetailPage')
        
        return placeCitySlug === citySlug && placeNameSlug === placeSlug
      })
      
      if (matchedPlace) {
        setPlaceData(matchedPlace)
        logInfo('Place found', { place: matchedPlace.name }, 'PlaceDetailPage')
      } else {
        setError('Place not found')
        // 改为info级别，因为这是正常的业务逻辑，不是错误
        logInfo('Place not found', { citySlug, placeSlug }, 'PlaceDetailPage')
      }
    } catch (error) {
      logError('Error fetching place data', error, 'PlaceDetailPage')
      setError('Failed to load place data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (error || !placeData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            title="Place Not Found"
            message={error || 'The place you are looking for does not exist.'}
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {placeData.name}
          </h1>
          <p className="text-gray-600">
            {placeData.address}
          </p>
        </div>

        {/* Place Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {placeData.description}
              </p>
            </div>

            {/* Tags */}
            {placeData.tags && placeData.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {placeData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{placeData.category}</span>
                </div>
                {placeData.wifi_speed && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">WiFi Speed:</span>
                    <span className="font-medium">{placeData.wifi_speed} Mbps</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Level:</span>
                  <span className="font-medium">{placeData.price_level}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Noise Level:</span>
                  <span className="font-medium capitalize">{placeData.noise_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Atmosphere:</span>
                  <span className="font-medium capitalize">{placeData.social_atmosphere}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            {placeData.rating && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {placeData.rating.toFixed(1)}
                  </div>
                  <div className="text-gray-600">
                    {placeData.review_count || 0} reviews
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}