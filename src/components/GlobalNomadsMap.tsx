'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  MapPin, 
  Users, 
  Coffee, 
  Clock, 
  Star,
  ZoomIn,
  ZoomOut,
  Target,
  Filter,
  Globe
} from 'lucide-react'

interface NomadLocation {
  id: string
  name: string
  city: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  status: 'online' | 'offline' | 'available' | 'busy'
  onlineCount: number
  totalCount: number
  meetups: number
  rating: number
  tags: string[]
}

interface GlobalNomadsMapProps {
  onCityClick?: (city: string) => void
  onMeetupClick?: (meetupId: string) => void
}

export default function GlobalNomadsMap({ onCityClick, onMeetupClick }: GlobalNomadsMapProps) {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'meetups'>('all')
  const [zoomLevel, setZoomLevel] = useState(3)
  const [center, setCenter] = useState({ lat: 20, lng: 0 })

  // Mock data for demonstration
  const mockNomadLocations: NomadLocation[] = [
    {
      id: '1',
      name: 'Chiang Mai',
      city: 'Chiang Mai',
      country: 'Thailand',
      coordinates: { lat: 18.7883, lng: 98.9853 },
      status: 'online',
      onlineCount: 56,
      totalCount: 89,
      meetups: 12,
      rating: 4.8,
      tags: ['Digital Nomad', 'Low Cost', 'Good WiFi']
    },
    {
      id: '2',
      name: 'Bali',
      city: 'Denpasar',
      country: 'Indonesia',
      coordinates: { lat: -8.6500, lng: 115.2167 },
      status: 'online',
      onlineCount: 43,
      totalCount: 67,
      meetups: 8,
      rating: 4.6,
      tags: ['Beach', 'Coworking', 'Community']
    },
    {
      id: '3',
      name: 'Lisbon',
      city: 'Lisbon',
      country: 'Portugal',
      coordinates: { lat: 38.7223, lng: -9.1393 },
      status: 'online',
      onlineCount: 28,
      totalCount: 45,
      meetups: 6,
      rating: 4.7,
      tags: ['Digital Nomad Visa', 'European', 'Startup']
    },
    {
      id: '4',
      name: 'Porto',
      city: 'Porto',
      country: 'Portugal',
      coordinates: { lat: 41.1579, lng: -8.6291 },
      status: 'online',
      onlineCount: 19,
      totalCount: 32,
      meetups: 4,
      rating: 4.5,
      tags: ['Wine', 'Culture', 'Affordable']
    },
    {
      id: '5',
      name: 'Mexico City',
      city: 'Mexico City',
      country: 'Mexico',
      coordinates: { lat: 19.4326, lng: -99.1332 },
      status: 'online',
      onlineCount: 34,
      totalCount: 52,
      meetups: 7,
      rating: 4.4,
      tags: ['Big City', 'Food', 'Culture']
    },
    {
      id: '6',
      name: 'Barcelona',
      city: 'Barcelona',
      country: 'Spain',
      coordinates: { lat: 41.3851, lng: 2.1734 },
      status: 'online',
      onlineCount: 31,
      totalCount: 48,
      meetups: 9,
      rating: 4.6,
      tags: ['Beach', 'Architecture', 'Nightlife']
    }
  ]

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true)
        
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        if (!apiKey || apiKey === 'your-api-key-here') {
    // console.warn('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.')
    console.warn('[REDACTED] Sensitive information logged at GlobalNomadsMap.tsx:145')
          setMapError('Google Maps API key not configured')
          setIsLoading(false)
          return
        }
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        })

        const google = await loader.load()
        
        if (!mapRef.current) return

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 3,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map
        infoWindowRef.current = new google.maps.InfoWindow()

        // Add markers for each location
        mockNomadLocations.forEach(location => {
          const marker = new google.maps.Marker({
            position: location.coordinates,
            map: map,
            title: location.name,
            icon: {
              url: getMarkerIcon(location.status),
              scaledSize: new google.maps.Size(32, 32)
            }
          })

          // Add click listener
          marker.addListener('click', () => {
            showInfoWindow(marker, location)
          })

          markersRef.current.push(marker)
        })

        // Add map event listeners
        map.addListener('zoom_changed', () => {
          setZoomLevel(map.getZoom() || 3)
        })

        map.addListener('center_changed', () => {
          const center = map.getCenter()
          if (center) {
            setCenter({ lat: center.lat(), lng: center.lng() })
          }
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing map:', error)
        setMapError('Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()
  }, [])

  // Get marker icon based on status
  const getMarkerIcon = (status: string) => {
    const baseUrl = 'data:image/svg+xml;charset=UTF-8,'
    
    const icons = {
      online: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>`,
      offline: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#6B7280" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>`,
      available: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>`,
      busy: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>`
    }

    return baseUrl + encodeURIComponent(icons[status as keyof typeof icons] || icons.online)
  }

  // Show info window for marker
  const showInfoWindow = (marker: google.maps.Marker, location: NomadLocation) => {
    if (!infoWindowRef.current) return

    const content = `
      <div class="p-4 max-w-xs">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 font-semibold">${location.name.charAt(0)}</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">${location.name}</h3>
            <p class="text-sm text-gray-600">${location.city}, ${location.country}</p>
          </div>
        </div>
        
        <div class="space-y-2 mb-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Online:</span>
            <span class="font-medium text-green-600">${location.onlineCount}/${location.totalCount}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Meetups:</span>
            <span class="font-medium text-blue-600">${location.meetups}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Rating:</span>
            <span class="font-medium text-yellow-600">${location.rating}/5</span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1 mb-3">
          ${location.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${tag}</span>`).join('')}
        </div>
        
        <div class="flex space-x-2">
          <button onclick="window.nomadMap?.onCityClick('${location.city}')" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
            View Details
          </button>
          <button onclick="window.nomadMap?.onMeetupClick('${location.id}')" class="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
            Join Meetup
          </button>
        </div>
      </div>
    `

    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open(mapInstanceRef.current, marker)

    // Expose functions to global scope for onclick handlers
    ;(window as any).nomadMap = {
      onCityClick: onCityClick,
      onMeetupClick: onMeetupClick
    }
  }

  // Map controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 3) + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 3) - 1)
    }
  }

  const handleCenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 20, lng: 0 })
      mapInstanceRef.current.setZoom(3)
    }
  }

  // Filter locations
  const filteredLocations = mockNomadLocations.filter(location => {
    if (selectedFilter === 'online') return location.status === 'online'
    if (selectedFilter === 'meetups') return location.meetups > 0
    return true
  })

                if (isLoading) {
                return (
                  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Globe className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('localNomads.loadingGlobalMap')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {t('localNomads.discoverGlobalHotspots')}
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )
              }

                if (mapError) {
                return (
                  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-dashed border-orange-200 dark:border-orange-700">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Globe className="w-10 h-10 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-2">
                        {t('localNomads.mapLoadFailed')}
                      </h3>
                      <p className="text-orange-700 dark:text-orange-300 mb-4">
                        {t('localNomads.mapLoadFailedDescription')}
                      </p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => window.location.reload()}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          {t('localNomads.retry')}
                        </button>
                        <button 
                          onClick={() => setMapError(null)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {t('localNomads.switchToListView')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('localNomads.allLocations')}</option>
              <option value="online">{t('localNomads.onlineOnly')}</option>
              <option value="meetups">{t('localNomads.withMeetups')}</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('localNomads.showingLocations', { count: filteredLocations.length.toString(), total: mockNomadLocations.length.toString() })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterMap}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Center Map"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700" />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('localNomads.legend')}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{t('localNomads.online')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{t('localNomads.available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{t('localNomads.busy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>{t('localNomads.offline')}</span>
            </div>
          </div>
        </div>

        {/* Current Position Info */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div>{t('localNomads.zoom')}: {zoomLevel}</div>
            <div>{t('localNomads.center')}: {center.lat.toFixed(2)}, {center.lng.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{t('localNomads.totalCities')}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockNomadLocations.length}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{t('localNomads.onlineNow')}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockNomadLocations.reduce((sum, loc) => sum + loc.onlineCount, 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Active Meetups</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockNomadLocations.reduce((sum, loc) => sum + loc.meetups, 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(mockNomadLocations.reduce((sum, loc) => sum + loc.rating, 0) / mockNomadLocations.length).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
