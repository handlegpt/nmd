import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import directusService, { DirectusCity, DirectusPlace } from '@/services/directusService'

// Hook to get cities list
export const useCities = () => {
  const { locale } = useLanguage()
  const [cities, setCities] = useState<DirectusCity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await directusService.getCities(locale)
      setCities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cities')
      console.error('Error fetching cities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [locale])

  return { cities, loading, error, refetch: fetchCities }
}

// Hook to get city by slug
export const useCityBySlug = (slug: string) => {
  const { locale } = useLanguage()
  const [city, setCity] = useState<DirectusCity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCity = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await directusService.getCityBySlug(slug, locale)
      setCity(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch city')
        console.error('Error fetching city:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!slug) {
      setCity(null)
      setLoading(false)
      return
    }

    fetchCity()
  }, [slug, locale])

  return { city, loading, error, refetch: fetchCity }
}

// Hook to get places by city
export const usePlacesByCity = (cityId: string) => {
  const { locale } = useLanguage()
  const [places, setPlaces] = useState<DirectusPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await directusService.getPlacesByCity(cityId, locale)
      setPlaces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places')
      console.error('Error fetching places:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!cityId) {
      setPlaces([])
      setLoading(false)
      return
    }

    fetchPlaces()
  }, [cityId, locale])

  return { places, loading, error, refetch: fetchPlaces }
}

// Hook to search places
export const useSearchPlaces = (query: string, cityId?: string) => {
  const [places, setPlaces] = useState<DirectusPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setPlaces([])
      return
    }

    const searchPlaces = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await directusService.searchPlaces(query, cityId)
        setPlaces(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search places')
        console.error('Error searching places:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounced search
    const timeoutId = setTimeout(searchPlaces, 300)
    return () => clearTimeout(timeoutId)
  }, [query, cityId])

  return { places, loading, error }
}

// Hook to get place types
export const usePlaceTypes = () => {
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await directusService.getPlaceTypes()
        setTypes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch place types')
        console.error('Error fetching place types:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [])

  return { types, loading, error }
}

// Hook to create place
export const useCreatePlace = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPlace = async (placeData: Partial<DirectusPlace>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await directusService.createPlace(placeData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create place'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createPlace, loading, error }
}

// Hook to update place
export const useUpdatePlace = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePlace = async (id: string, updateData: Partial<DirectusPlace>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await directusService.updatePlace(id, updateData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update place'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { updatePlace, loading, error }
}

// Hook to delete place
export const useDeletePlace = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deletePlace = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await directusService.deletePlace(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete place'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { deletePlace, loading, error }
}
