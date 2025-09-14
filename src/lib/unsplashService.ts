// Unsplash API Service for automatic city image fetching
// This service integrates with Unsplash API to get high-quality city images

export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  description: string
  user: {
    name: string
    username: string
    profile_image: {
      small: string
    }
  }
  location: {
    name: string
    city: string
    country: string
  }
  tags: Array<{
    title: string
  }>
  likes: number
  downloads: number
  created_at: string
}

export interface UnsplashSearchParams {
  query: string
  page?: number
  per_page?: number
  orientation?: 'landscape' | 'portrait' | 'squarish'
  order_by?: 'relevant' | 'latest'
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue'
}

export class UnsplashService {
  private static readonly BASE_URL = 'https://api.unsplash.com'
  private static readonly ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo_key'
  
  /**
   * Search for images on Unsplash
   */
  static async searchImages(params: UnsplashSearchParams): Promise<UnsplashImage[]> {
    try {
      const searchParams = new URLSearchParams({
        query: params.query,
        page: (params.page || 1).toString(),
        per_page: (params.per_page || 10).toString(),
        orientation: params.orientation || 'landscape',
        order_by: params.order_by || 'relevant'
      })

      if (params.color) {
        searchParams.append('color', params.color)
      }

      const response = await fetch(
        `${this.BASE_URL}/search/photos?${searchParams}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.ACCESS_KEY}`,
            'Accept-Version': 'v1'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error)
      return []
    }
  }

  /**
   * Get city-specific images with multiple search strategies
   */
  static async getCityImages(
    cityName: string, 
    country: string, 
    maxImages: number = 4
  ): Promise<UnsplashImage[]> {
    const searchQueries = [
      `${cityName} ${country}`,
      `${cityName} skyline`,
      `${cityName} landmarks`,
      `${cityName} street`,
      `${cityName} culture`,
      `${cityName} architecture`,
      `${cityName} travel`,
      `${cityName} tourism`
    ]

    const allImages: UnsplashImage[] = []
    const seenIds = new Set<string>()

    // Try different search queries to get diverse images
    for (const query of searchQueries) {
      if (allImages.length >= maxImages) break

      const images = await this.searchImages({
        query,
        per_page: Math.min(5, maxImages - allImages.length),
        orientation: 'landscape',
        order_by: 'relevant'
      })

      // Add unique images only
      for (const image of images) {
        if (!seenIds.has(image.id) && allImages.length < maxImages) {
          seenIds.add(image.id)
          allImages.push(image)
        }
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return allImages
  }

  /**
   * Convert Unsplash image to our CityImageData format
   */
  static convertToCityImageData(
    unsplashImage: UnsplashImage, 
    cityName: string
  ): any {
    return {
      id: `unsplash-${unsplashImage.id}`,
      url: unsplashImage.urls.regular,
      title: unsplashImage.alt_description || `${cityName} View`,
      description: unsplashImage.description || unsplashImage.alt_description || `Beautiful view of ${cityName}`,
      photographer: unsplashImage.user.name,
      location: unsplashImage.location?.name || 'Unknown',
      likes: unsplashImage.likes,
      isUserUploaded: false,
      tags: unsplashImage.tags?.map(tag => tag.title) || [],
      source: 'unsplash' as const,
      unsplashData: {
        id: unsplashImage.id,
        user: unsplashImage.user,
        downloads: unsplashImage.downloads,
        created_at: unsplashImage.created_at
      }
    }
  }

  /**
   * Get fallback images when API is not available
   */
  static getFallbackImages(cityName: string, country: string): any[] {
    const fallbackUrls = [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&q=80'
    ]

    const categories = ['Skyline', 'Street Life', 'Landmarks', 'Culture']

    return fallbackUrls.map((url, index) => ({
      id: `fallback-${cityName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      url,
      title: `${cityName} ${categories[index]}`,
      description: `Beautiful ${categories[index].toLowerCase()} in ${cityName}`,
      photographer: 'Unsplash',
      location: 'City Center',
      likes: Math.floor(Math.random() * 200) + 50,
      isUserUploaded: false,
      tags: [categories[index].toLowerCase(), 'city', 'travel'],
      source: 'unsplash' as const
    }))
  }
}

export default UnsplashService
