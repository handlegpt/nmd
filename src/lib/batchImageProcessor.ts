// Batch Image Processor for handling 501+ cities
// This service processes cities in batches to avoid API rate limits

import { UnsplashService } from './unsplashService'
import { CityImageService } from './cityImageService'

export interface CityData {
  name: string
  country: string
  country_code: string
  region?: string
  population?: number
  latitude?: number
  longitude?: number
}

export interface BatchProcessResult {
  cityName: string
  country: string
  success: boolean
  imagesCount: number
  error?: string
  processingTime: number
}

export interface BatchProcessConfig {
  batchSize: number
  delayBetweenBatches: number
  delayBetweenRequests: number
  maxRetries: number
  useFallback: boolean
}

export class BatchImageProcessor {
  private static readonly DEFAULT_CONFIG: BatchProcessConfig = {
    batchSize: 10,
    delayBetweenBatches: 2000, // 2 seconds
    delayBetweenRequests: 500, // 0.5 seconds
    maxRetries: 3,
    useFallback: true
  }

  /**
   * Process all cities in batches
   */
  static async processAllCities(
    cities: CityData[],
    config: Partial<BatchProcessConfig> = {}
  ): Promise<BatchProcessResult[]> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    const results: BatchProcessResult[] = []
    
    console.log(`Starting batch processing for ${cities.length} cities...`)
    console.log(`Batch size: ${finalConfig.batchSize}, Delay: ${finalConfig.delayBetweenBatches}ms`)

    // Process cities in batches
    for (let i = 0; i < cities.length; i += finalConfig.batchSize) {
      const batch = cities.slice(i, i + finalConfig.batchSize)
      console.log(`Processing batch ${Math.floor(i / finalConfig.batchSize) + 1}/${Math.ceil(cities.length / finalConfig.batchSize)}`)
      
      const batchResults = await this.processBatch(batch, finalConfig)
      results.push(...batchResults)
      
      // Delay between batches to respect rate limits
      if (i + finalConfig.batchSize < cities.length) {
        console.log(`Waiting ${finalConfig.delayBetweenBatches}ms before next batch...`)
        await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenBatches))
      }
    }

    return results
  }

  /**
   * Process a single batch of cities
   */
  private static async processBatch(
    cities: CityData[],
    config: BatchProcessConfig
  ): Promise<BatchProcessResult[]> {
    const results: BatchProcessResult[] = []
    
    // Process cities in parallel within the batch
    const promises = cities.map(city => this.processCity(city, config))
    const batchResults = await Promise.allSettled(promises)
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          cityName: cities[index].name,
          country: cities[index].country,
          success: false,
          imagesCount: 0,
          error: result.reason?.message || 'Unknown error',
          processingTime: 0
        })
      }
    })
    
    return results
  }

  /**
   * Process a single city
   */
  private static async processCity(
    city: CityData,
    config: BatchProcessConfig
  ): Promise<BatchProcessResult> {
    const startTime = Date.now()
    
    try {
      // Try to get images from Unsplash
      const unsplashImages = await UnsplashService.getCityImages(
        city.name,
        city.country,
        4
      )
      
      let imagesCount = 0
      
      if (unsplashImages.length > 0) {
        // Convert and store images
        const cityImages = unsplashImages.map(img => 
          UnsplashService.convertToCityImageData(img, city.name)
        )
        
        // Add to city collection
        CityImageService.addCityToCollection(
          city.name.toLowerCase().replace(/\s+/g, '-'),
          cityImages
        )
        
        imagesCount = cityImages.length
        console.log(`✅ ${city.name}: Found ${imagesCount} images`)
      } else if (config.useFallback) {
        // Use fallback images
        const fallbackImages = UnsplashService.getFallbackImages(city.name, city.country)
        CityImageService.addCityToCollection(
          city.name.toLowerCase().replace(/\s+/g, '-'),
          fallbackImages
        )
        imagesCount = fallbackImages.length
        console.log(`⚠️ ${city.name}: Using ${imagesCount} fallback images`)
      }
      
      const processingTime = Date.now() - startTime
      
      return {
        cityName: city.name,
        country: city.country,
        success: true,
        imagesCount,
        processingTime
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ ${city.name}: Error processing city`, error)
      
      return {
        cityName: city.name,
        country: city.country,
        success: false,
        imagesCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      }
    }
  }

  /**
   * Generate sample city data for testing
   */
  static generateSampleCities(count: number = 50): CityData[] {
    const sampleCities: CityData[] = [
      // Major digital nomad cities
      { name: 'Bangkok', country: 'Thailand', country_code: 'TH' },
      { name: 'Chiang Mai', country: 'Thailand', country_code: 'TH' },
      { name: 'Tokyo', country: 'Japan', country_code: 'JP' },
      { name: 'Seoul', country: 'South Korea', country_code: 'KR' },
      { name: 'Singapore', country: 'Singapore', country_code: 'SG' },
      { name: 'Kuala Lumpur', country: 'Malaysia', country_code: 'MY' },
      { name: 'Ho Chi Minh City', country: 'Vietnam', country_code: 'VN' },
      { name: 'Hanoi', country: 'Vietnam', country_code: 'VN' },
      { name: 'Manila', country: 'Philippines', country_code: 'PH' },
      { name: 'Jakarta', country: 'Indonesia', country_code: 'ID' },
      
      // European cities
      { name: 'Lisbon', country: 'Portugal', country_code: 'PT' },
      { name: 'Porto', country: 'Portugal', country_code: 'PT' },
      { name: 'Barcelona', country: 'Spain', country_code: 'ES' },
      { name: 'Madrid', country: 'Spain', country_code: 'ES' },
      { name: 'Valencia', country: 'Spain', country_code: 'ES' },
      { name: 'Berlin', country: 'Germany', country_code: 'DE' },
      { name: 'Hamburg', country: 'Germany', country_code: 'DE' },
      { name: 'Amsterdam', country: 'Netherlands', country_code: 'NL' },
      { name: 'Rotterdam', country: 'Netherlands', country_code: 'NL' },
      { name: 'Prague', country: 'Czech Republic', country_code: 'CZ' },
      { name: 'Budapest', country: 'Hungary', country_code: 'HU' },
      { name: 'Krakow', country: 'Poland', country_code: 'PL' },
      { name: 'Warsaw', country: 'Poland', country_code: 'PL' },
      { name: 'Vienna', country: 'Austria', country_code: 'AT' },
      { name: 'Zurich', country: 'Switzerland', country_code: 'CH' },
      { name: 'Geneva', country: 'Switzerland', country_code: 'CH' },
      { name: 'Stockholm', country: 'Sweden', country_code: 'SE' },
      { name: 'Copenhagen', country: 'Denmark', country_code: 'DK' },
      { name: 'Oslo', country: 'Norway', country_code: 'NO' },
      { name: 'Helsinki', country: 'Finland', country_code: 'FI' },
      
      // Americas
      { name: 'Mexico City', country: 'Mexico', country_code: 'MX' },
      { name: 'Guadalajara', country: 'Mexico', country_code: 'MX' },
      { name: 'Playa del Carmen', country: 'Mexico', country_code: 'MX' },
      { name: 'Buenos Aires', country: 'Argentina', country_code: 'AR' },
      { name: 'Santiago', country: 'Chile', country_code: 'CL' },
      { name: 'Lima', country: 'Peru', country_code: 'PE' },
      { name: 'Bogota', country: 'Colombia', country_code: 'CO' },
      { name: 'Medellin', country: 'Colombia', country_code: 'CO' },
      { name: 'Sao Paulo', country: 'Brazil', country_code: 'BR' },
      { name: 'Rio de Janeiro', country: 'Brazil', country_code: 'BR' },
      { name: 'Florianopolis', country: 'Brazil', country_code: 'BR' },
      
      // Middle East & Africa
      { name: 'Dubai', country: 'UAE', country_code: 'AE' },
      { name: 'Abu Dhabi', country: 'UAE', country_code: 'AE' },
      { name: 'Tel Aviv', country: 'Israel', country_code: 'IL' },
      { name: 'Cape Town', country: 'South Africa', country_code: 'ZA' },
      { name: 'Johannesburg', country: 'South Africa', country_code: 'ZA' },
      { name: 'Cairo', country: 'Egypt', country_code: 'EG' },
      { name: 'Marrakech', country: 'Morocco', country_code: 'MA' },
      { name: 'Casablanca', country: 'Morocco', country_code: 'MA' },
      
      // Additional cities to reach 50+
      { name: 'Istanbul', country: 'Turkey', country_code: 'TR' },
      { name: 'Antalya', country: 'Turkey', country_code: 'TR' },
      { name: 'Tbilisi', country: 'Georgia', country_code: 'GE' },
      { name: 'Yerevan', country: 'Armenia', country_code: 'AM' },
      { name: 'Baku', country: 'Azerbaijan', country_code: 'AZ' },
      { name: 'Almaty', country: 'Kazakhstan', country_code: 'KZ' },
      { name: 'Tashkent', country: 'Uzbekistan', country_code: 'UZ' },
      { name: 'Kathmandu', country: 'Nepal', country_code: 'NP' },
      { name: 'Colombo', country: 'Sri Lanka', country_code: 'LK' },
      { name: 'Dhaka', country: 'Bangladesh', country_code: 'BD' }
    ]
    
    return sampleCities.slice(0, count)
  }

  /**
   * Get processing statistics
   */
  static getProcessingStats(results: BatchProcessResult[]) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const failed = total - successful
    const totalImages = results.reduce((sum, r) => sum + r.imagesCount, 0)
    const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / total
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      totalImages,
      avgProcessingTime: Math.round(avgProcessingTime)
    }
  }
}

export default BatchImageProcessor
