import { logInfo, logError } from '@/lib/logger'

export interface DirectusCity {
  id: string
  slug: string
  name: Record<string, string> // Multi-language names
  description: Record<string, string> // Multi-language descriptions
  country: string
  timezone: string
  coordinates: { lat: number; lng: number }
  cost_of_living: string
  wifi_rating: string
  visa_requirements: Record<string, string>
  highlights: string[]
  images: string[]
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface DirectusPlace {
  id: string
  name: string
  type: string // cafe, restaurant, coworking
  city_id: string
  category: string
  rating: number
  price_range: string
  address: string
  coordinates: { lat: number; lng: number }
  description: string
  features: string[]
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
  updated_at: string
}

class DirectusService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token
  }

  // Get authentication headers
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  // Get cities list
  async getCities(locale = 'en'): Promise<DirectusCity[]> {
    try {
      logInfo('Fetching cities from Directus', { locale }, 'DirectusService')
      
      const response = await fetch(
        `${this.baseUrl}/items/cities?filter[status][_eq]=published&fields=*,translations.${locale}.*`,
        {
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      logError('Failed to fetch cities from Directus', error, 'DirectusService')
      throw error
    }
  }

  // Get city by slug
  async getCityBySlug(slug: string, locale = 'en'): Promise<DirectusCity | null> {
    try {
      logInfo('Fetching city by slug from Directus', { slug, locale }, 'DirectusService')
      
      const response = await fetch(
        `${this.baseUrl}/items/cities?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,translations.${locale}.*`,
        {
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      logError('Failed to fetch city by slug from Directus', error, 'DirectusService')
      throw error
    }
  }

  // Get places by city
  async getPlacesByCity(cityId: string, locale = 'en'): Promise<DirectusPlace[]> {
    try {
      logInfo('Fetching places by city from Directus', { cityId, locale }, 'DirectusService')
      
      const response = await fetch(
        `${this.baseUrl}/items/places?filter[city_id][_eq]=${cityId}&filter[status][_eq]=approved&fields=*,city_id.*`,
        {
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      logError('Failed to fetch places by city from Directus', error, 'DirectusService')
      throw error
    }
  }

  // Create place recommendation
  async createPlace(placeData: Partial<DirectusPlace>): Promise<DirectusPlace> {
    try {
      logInfo('Creating place in Directus', placeData, 'DirectusService')
      
      if (!this.token) {
        throw new Error('Authentication token required')
      }

      const response = await fetch(`${this.baseUrl}/items/places`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(placeData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      logError('Failed to create place in Directus', error, 'DirectusService')
      throw error
    }
  }

  // Update place information
  async updatePlace(id: string, updateData: Partial<DirectusPlace>): Promise<DirectusPlace> {
    try {
      logInfo('Updating place in Directus', { id, updateData }, 'DirectusService')
      
      if (!this.token) {
        throw new Error('Authentication token required')
      }

      const response = await fetch(`${this.baseUrl}/items/places/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      logError('Failed to update place in Directus', error, 'DirectusService')
      throw error
    }
  }

  // Delete place
  async deletePlace(id: string): Promise<void> {
    try {
      logInfo('Deleting place from Directus', { id }, 'DirectusService')
      
      if (!this.token) {
        throw new Error('Authentication token required')
      }

      const response = await fetch(`${this.baseUrl}/items/places/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      logError('Failed to delete place from Directus', error, 'DirectusService')
      throw error
    }
  }

  // Get place types
  async getPlaceTypes(): Promise<string[]> {
    try {
      logInfo('Fetching place types from Directus', null, 'DirectusService')
      
      const response = await fetch(
        `${this.baseUrl}/items/places?fields=type&group_by=type`,
        {
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.map((item: any) => item.type) || []
    } catch (error) {
      logError('Failed to fetch place types from Directus', error, 'DirectusService')
      throw error
    }
  }

  // Search places
  async searchPlaces(query: string, cityId?: string): Promise<DirectusPlace[]> {
    try {
      logInfo('Searching places in Directus', { query, cityId }, 'DirectusService')
      
      let filter = `filter[status][_eq]=approved`
      if (cityId) {
        filter += `&filter[city_id][_eq]=${cityId}`
      }
      
      const response = await fetch(
        `${this.baseUrl}/items/places?${filter}&search=${encodeURIComponent(query)}&fields=*,city_id.*`,
        {
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      logError('Failed to search places in Directus', error, 'DirectusService')
      throw error
    }
  }
}

// Create singleton instance
export const directusService = new DirectusService()
export default directusService
