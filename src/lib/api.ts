import { supabase, City, Vote, User, Place, PlaceVote, PlaceReview } from './supabase'

// Helper function to log warnings only in development
const devWarn = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message)
  }
}

// Time related APIs
export async function getWorldTime(timezone: string) {
  try {
    // Use our own API route instead of direct external API call
    const response = await fetch(`/api/time?timezone=${encodeURIComponent(timezone)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch time data')
    }
    const data = await response.json()
    
    // Format time for display
    const dateTime = new Date(data.datetime)
    const time = dateTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const date = dateTime.toLocaleDateString()
    
    return {
      time,
      date,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      fallback: data.fallback || false
    }
  } catch (error) {
    console.error('Error fetching world time:', error)
    
    // Return fallback data
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const date = now.toLocaleDateString()
    
    return {
      time,
      date,
      timezone: timezone,
      utc_offset: now.getTimezoneOffset() / -60,
      fallback: true
    }
  }
}



// City related APIs
export async function getCities(): Promise<City[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log('🔍 Fetching cities from Supabase...')
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching cities from Supabase:', error)
      return []
    }

    if (cities && cities.length > 0) {
      console.log(`✅ Successfully fetched ${cities.length} cities from Supabase`)
      return cities
    }

    console.log('⚠️ No cities found in database')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch cities from Supabase:', error)
    return []
  }
}

export async function getTopCities(limit: number = 10): Promise<City[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching top ${limit} cities from Supabase...`)
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching top cities from Supabase:', error)
      return []
    }

    if (cities && cities.length > 0) {
      console.log(`✅ Successfully fetched ${cities.length} top cities from Supabase`)
      return cities
    }

    console.log('⚠️ No top cities found in database')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch top cities from Supabase:', error)
    return []
  }
}

export async function getCityById(id: string): Promise<City | null> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return null
  }

  try {
    console.log(`🔍 Fetching city by ID: ${id}`)
    const { data: city, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching city by ID:', error)
      return null
    }

    if (city) {
      console.log(`✅ Successfully fetched city: ${city.name}`)
      return city
    }

    console.log('⚠️ City not found')
    return null
  } catch (error) {
    console.error('❌ Failed to fetch city by ID:', error)
    return null
  }
}

// Place related APIs
export async function getPlaces(cityId?: string): Promise<Place[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return getFallbackPlaces(cityId)
  }

  try {
    console.log('🔍 Fetching places from Supabase...')
    let query = supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    const { data: places, error } = await query

    if (error) {
      console.error('❌ Error fetching places from Supabase:', error)
      return getFallbackPlaces(cityId)
    }

    if (places && places.length > 0) {
      console.log(`✅ Successfully fetched ${places.length} places from Supabase`)
      return places
    }

    console.log('⚠️ No places found in database, using fallback data')
    return getFallbackPlaces(cityId)
  } catch (error) {
    console.error('❌ Failed to fetch places from Supabase:', error)
    return getFallbackPlaces(cityId)
  }
}

// Fallback places data when database is empty
function getFallbackPlaces(cityId?: string): Place[] {
  const fallbackPlaces: Place[] = [
    {
      id: 'fallback-1',
      name: 'Blue Bottle Coffee',
      category: 'cafe',
      city_id: cityId || 'fallback-city-1',
      address: '123 Main Street',
      latitude: 34.6937,
      longitude: 135.5023,
      description: 'Great coffee shop with excellent WiFi and quiet atmosphere. Perfect for remote work.',
      tags: ['quiet', 'wifi', 'coffee'],
      wifi_speed: 85,
      price_level: 3,
      noise_level: 'quiet',
      social_atmosphere: 'low',
      submitted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      name: 'WeWork Space',
      category: 'coworking',
      city_id: cityId || 'fallback-city-1',
      address: '456 Business District',
      latitude: 34.6938,
      longitude: 135.5024,
      description: 'Professional coworking space with all amenities. Great community for digital nomads.',
      tags: ['professional', 'amenities', 'community'],
      wifi_speed: 120,
      price_level: 4,
      noise_level: 'moderate',
      social_atmosphere: 'high',
      submitted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      name: 'Nomad House',
      category: 'coliving',
      city_id: cityId || 'fallback-city-1',
      address: '789 Nomad Street',
      latitude: 34.6939,
      longitude: 135.5025,
      description: 'Digital nomad accommodation with good WiFi and social atmosphere. Perfect for long-term stays.',
      tags: ['nomad', 'wifi', 'social'],
      wifi_speed: 95,
      price_level: 2,
      noise_level: 'moderate',
      social_atmosphere: 'high',
      submitted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Filter by cityId if provided
  if (cityId) {
    return fallbackPlaces.filter(place => place.city_id === cityId)
  }

  return fallbackPlaces
}

// Vote related APIs
export async function getVotes(cityId: string): Promise<Vote[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching votes for city: ${cityId}`)
    const { data: votes, error } = await supabase
      .from('votes')
      .select('*')
      .eq('city_id', cityId)

    if (error) {
      console.error('❌ Error fetching votes from Supabase:', error)
      return []
    }

    if (votes && votes.length > 0) {
      console.log(`✅ Successfully fetched ${votes.length} votes from Supabase`)
      return votes
    }

    console.log('⚠️ No votes found for this city')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch votes from Supabase:', error)
    return []
  }
}

export async function addVote(cityId: string, userId: string, ratings: {
  overall_rating: number
  wifi_rating: number
  social_rating: number
  value_rating: number
  climate_rating: number
  comment?: string
}): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return false
  }

  try {
    console.log(`🔍 Adding vote for city: ${cityId}, user: ${userId}`)
    const { error } = await supabase
      .from('votes')
      .upsert({
        city_id: cityId,
        user_id: userId,
        ...ratings
      })

    if (error) {
      console.error('❌ Error adding vote to Supabase:', error)
      return false
    }

    console.log('✅ Successfully added vote to Supabase')
    return true
  } catch (error) {
    console.error('❌ Failed to add vote to Supabase:', error)
    return false
  }
}

// User related APIs
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return null
  }

  try {
    console.log('🔍 Fetching current user from Supabase...')
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error fetching current user from Supabase:', error)
      return null
    }

    if (user) {
      console.log(`✅ Successfully fetched user: ${user.email}`)
             return {
         id: user.id,
         email: user.email || '',
         name: user.user_metadata?.name || '',
         avatar_url: user.user_metadata?.avatar_url || '',
         created_at: user.created_at
       }
    }

    console.log('⚠️ No user found')
    return null
  } catch (error) {
    console.error('❌ Failed to fetch current user from Supabase:', error)
    return null
  }
}

// Place vote related APIs
export async function getPlaceVotes(placeId: string): Promise<PlaceVote[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching place votes for place: ${placeId}`)
    const { data: votes, error } = await supabase
      .from('place_votes')
      .select('*')
      .eq('place_id', placeId)

    if (error) {
      console.error('❌ Error fetching place votes from Supabase:', error)
      return []
    }

    if (votes && votes.length > 0) {
      console.log(`✅ Successfully fetched ${votes.length} place votes from Supabase`)
      return votes
    }

    console.log('⚠️ No place votes found for this place')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch place votes from Supabase:', error)
    return []
  }
}

export async function addPlaceVote(placeId: string, userId: string, voteType: 'up' | 'down'): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return false
  }

  try {
    console.log(`🔍 Adding place vote for place: ${placeId}, user: ${userId}, type: ${voteType}`)
    const { error } = await supabase
      .from('place_votes')
      .upsert({
        place_id: placeId,
        user_id: userId,
        vote_type: voteType
      })

    if (error) {
      console.error('❌ Error adding place vote to Supabase:', error)
      return false
    }

    console.log('✅ Successfully added place vote to Supabase')
    return true
  } catch (error) {
    console.error('❌ Failed to add place vote to Supabase:', error)
    return false
  }
}

// Place review related APIs
export async function getPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching place reviews for place: ${placeId}`)
    const { data: reviews, error } = await supabase
      .from('place_reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching place reviews from Supabase:', error)
      return []
    }

    if (reviews && reviews.length > 0) {
      console.log(`✅ Successfully fetched ${reviews.length} place reviews from Supabase`)
      return reviews
    }

    console.log('⚠️ No place reviews found for this place')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch place reviews from Supabase:', error)
    return []
  }
}

export async function addPlaceReview(placeId: string, userId: string, rating: number, comment?: string): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return false
  }

  try {
    console.log(`🔍 Adding place review for place: ${placeId}, user: ${userId}, rating: ${rating}`)
    const { error } = await supabase
      .from('place_reviews')
      .insert({
        place_id: placeId,
        user_id: userId,
        rating,
        comment
      })

    if (error) {
      console.error('❌ Error adding place review to Supabase:', error)
      return false
    }

    console.log('✅ Successfully added place review to Supabase')
    return true
  } catch (error) {
    console.error('❌ Failed to add place review to Supabase:', error)
    return false
  }
}

// Legacy functions for backward compatibility
export async function submitVote(voteData: Omit<Vote, 'id' | 'created_at'>): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return false
  }

  try {
    console.log('🔍 Submitting vote...')
    const { error } = await supabase
      .from('votes')
      .insert(voteData)

    if (error) {
      console.error('❌ Error submitting vote to Supabase:', error)
      return false
    }

    console.log('✅ Successfully submitted vote to Supabase')
    return true
  } catch (error) {
    console.error('❌ Failed to submit vote to Supabase:', error)
    return false
  }
}

export async function getPlacesByCity(cityId: string): Promise<Place[]> {
  return getPlaces(cityId)
}

export async function getPlacesByCategory(category: string, cityId?: string): Promise<Place[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching places by category: ${category}`)
    let query = supabase
      .from('places')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    const { data: places, error } = await query

    if (error) {
      console.error('❌ Error fetching places by category from Supabase:', error)
      return []
    }

    if (places && places.length > 0) {
      console.log(`✅ Successfully fetched ${places.length} places by category from Supabase`)
      return places
    }

    console.log('⚠️ No places found for this category')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch places by category from Supabase:', error)
    return []
  }
}

export async function addPlace(placeData: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Promise<Place | null> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return null
  }

  try {
    console.log('🔍 Adding place...')
    const { data: place, error } = await supabase
      .from('places')
      .insert(placeData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error adding place to Supabase:', error)
      return null
    }

    console.log('✅ Successfully added place to Supabase')
    return place
  } catch (error) {
    console.error('❌ Failed to add place to Supabase:', error)
    return null
  }
}

export async function searchPlaces(query: string, cityId?: string): Promise<Place[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Searching places with query: ${query}`)
    let supabaseQuery = supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)

    if (cityId) {
      supabaseQuery = supabaseQuery.eq('city_id', cityId)
    }

    const { data: places, error } = await supabaseQuery.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error searching places from Supabase:', error)
      return []
    }

    if (places && places.length > 0) {
      console.log(`✅ Successfully found ${places.length} places from search`)
      return places
    }

    console.log('⚠️ No places found for this search query')
    return []
  } catch (error) {
    console.error('❌ Failed to search places from Supabase:', error)
    return []
  }
}

// Utility functions
export async function getCurrentLocation(): Promise<{ lat: number; lon: number; city: string; country: string } | null> {
  try {
    // Use IP-based geolocation instead of browser geolocation
    const response = await fetch('https://api.ipapi.com/api/check?access_key=free')

    if (response.ok) {
      const data = await response.json()
      return {
        lat: data.latitude || 34.6937,
        lon: data.longitude || 135.5023,
        city: data.city || 'Osaka',
        country: data.country_name || 'Japan'
      }
    } else {
      // Fallback to a free IP geolocation service
      const fallbackResponse = await fetch('https://ipapi.co/json/')
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        return {
          lat: fallbackData.latitude || 34.6937,
          lon: fallbackData.longitude || 135.5023,
          city: fallbackData.city || 'Osaka',
          country: fallbackData.country_name || 'Japan'
        }
      }
    }
  } catch (error) {
    console.error('Error getting location from IP:', error)
  }

  // Final fallback to default location
  return {
    lat: 34.6937,
    lon: 135.5023,
    city: 'Osaka',
    country: 'Japan'
  }
}

export function getCategoryIcon(category: string): string {
  const icons = {
    cafe: '☕',
    coworking: '💻',
    coliving: '🏠',
    restaurant: '🍽',
    outdoor: '🌳',
    other: '📍'
  }
  return icons[category as keyof typeof icons] || icons.other
}

export function getCategoryName(category: string): string {
  const names = {
    cafe: '咖啡馆',
    coworking: 'Co-working',
    coliving: 'Coliving',
    restaurant: '餐馆',
    outdoor: '户外',
    other: '其他'
  }
  return names[category as keyof typeof names] || '其他'
}

export function getPriceLevelText(level: number): string {
  return '$'.repeat(level)
}

export function getNoiseLevelText(level: string): string {
  const levels = {
    quiet: '安静',
    moderate: '适中',
    loud: '嘈杂'
  }
  return levels[level as keyof typeof levels] || '未知'
}

export function getSocialAtmosphereText(level: string): string {
  const levels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return levels[level as keyof typeof levels] || '未知'
}

export async function getTopPlaces(limit: number = 10): Promise<Place[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching top ${limit} places...`)
    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching top places from Supabase:', error)
      return []
    }

    if (places && places.length > 0) {
      console.log(`✅ Successfully fetched ${places.length} top places from Supabase`)
      return places
    }

    console.log('⚠️ No top places found')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch top places from Supabase:', error)
    return []
  }
}

export async function getUserPlaces(userId: string): Promise<Place[]> {
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return []
  }

  try {
    console.log(`🔍 Fetching places for user: ${userId}`)
    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user places from Supabase:', error)
      return []
    }

    if (places && places.length > 0) {
      console.log(`✅ Successfully fetched ${places.length} user places from Supabase`)
      return places
    }

    console.log('⚠️ No places found for this user')
    return []
  } catch (error) {
    console.error('❌ Failed to fetch user places from Supabase:', error)
    return []
  }
}

// Calculate visa days remaining
export function calculateVisaDays(visaExpiry: string): number {
  const expiryDate = new Date(visaExpiry)
  const today = new Date()

  // Reset time to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0)
  expiryDate.setHours(0, 0, 0, 0)

  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Timezone mapping function
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // This is a simplified timezone mapping
  // In a real app, you'd use a more sophisticated timezone database

  // Asia
  if (lat >= 20 && lat <= 50 && lon >= 70 && lon <= 140) {
    if (lon >= 100 && lon <= 140) return 'Asia/Tokyo' // Japan
    if (lon >= 70 && lon <= 100) return 'Asia/Shanghai' // China
    return 'Asia/Tokyo'
  }

  // Europe
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
    return 'Europe/London'
  }

  // North America
  if (lat >= 25 && lat <= 70 && lon >= -170 && lon <= -50) {
    if (lon >= -80 && lon <= -50) return 'America/New_York'
    if (lon >= -125 && lon <= -80) return 'America/Los_Angeles'
    return 'America/New_York'
  }

  // Default to UTC
  return 'UTC'
}
