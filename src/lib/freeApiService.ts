// Free API service for city data
// This service integrates with free APIs to get cost of living and other city data

export interface CityData {
  name: string;
  country: string;
  countryCode: string;
  costOfLiving: {
    monthly: number;
    currency: string;
    lastUpdated: string;
    source: string;
  };
  wifiSpeed: {
    average: number;
    unit: string;
    lastUpdated: string;
    source: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
}

export interface ApiResponse {
  success: boolean;
  data?: CityData;
  error?: string;
  source: string;
}

class FreeApiService {
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cache = new Map<string, { data: CityData; timestamp: number }>();

  // SmartPandas API (free tier: 500 requests/month)
  private async fetchFromSmartPandas(cityName: string, country: string): Promise<ApiResponse> {
    try {
      // Note: This is a placeholder URL - you'll need to get the actual API endpoint
      const response = await fetch(`https://api.smartpandas.com/cost-of-living?city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SMARTPANDAS_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SmartPandas API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          name: data.city || cityName,
          country: data.country || country,
          countryCode: data.country_code || '',
          costOfLiving: {
            monthly: data.cost_of_living || 0,
            currency: data.currency || 'USD',
            lastUpdated: new Date().toISOString(),
            source: 'SmartPandas'
          },
          wifiSpeed: {
            average: data.wifi_speed || 0,
            unit: 'Mbps',
            lastUpdated: new Date().toISOString(),
            source: 'SmartPandas'
          },
          coordinates: {
            lat: data.latitude || 0,
            lng: data.longitude || 0
          },
          timezone: data.timezone || ''
        },
        source: 'SmartPandas'
      };
    } catch (error) {
      console.error('SmartPandas API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'SmartPandas'
      };
    }
  }

  // Alternative free API - Cities Cost of Living API
  private async fetchFromCitiesAPI(cityName: string, country: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`https://api.cities-cost-of-living.com/v1/city?name=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}`, {
        headers: {
          'X-API-Key': process.env.CITIES_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cities API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          name: data.name || cityName,
          country: data.country || country,
          countryCode: data.country_code || '',
          costOfLiving: {
            monthly: data.cost_of_living || 0,
            currency: data.currency || 'USD',
            lastUpdated: new Date().toISOString(),
            source: 'Cities API'
          },
          wifiSpeed: {
            average: data.internet_speed || 0,
            unit: 'Mbps',
            lastUpdated: new Date().toISOString(),
            source: 'Cities API'
          },
          coordinates: {
            lat: data.latitude || 0,
            lng: data.longitude || 0
          },
          timezone: data.timezone || ''
        },
        source: 'Cities API'
      };
    } catch (error) {
      console.error('Cities API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Cities API'
      };
    }
  }

  // Fallback to manual data
  private getManualData(cityName: string, country: string): CityData | null {
    const manualData: Record<string, CityData> = {
      'lisbon-portugal': {
        name: 'Lisbon',
        country: 'Portugal',
        countryCode: 'PT',
        costOfLiving: {
          monthly: 1100,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        wifiSpeed: {
          average: 90,
          unit: 'Mbps',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        coordinates: { lat: 38.7223, lng: -9.1393 },
        timezone: 'Europe/Lisbon'
      },
      'bangkok-thailand': {
        name: 'Bangkok',
        country: 'Thailand',
        countryCode: 'TH',
        costOfLiving: {
          monthly: 800,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        wifiSpeed: {
          average: 75,
          unit: 'Mbps',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        coordinates: { lat: 13.7563, lng: 100.5018 },
        timezone: 'Asia/Bangkok'
      },
      'chiang-mai-thailand': {
        name: 'Chiang Mai',
        country: 'Thailand',
        countryCode: 'TH',
        costOfLiving: {
          monthly: 600,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        wifiSpeed: {
          average: 65,
          unit: 'Mbps',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        coordinates: { lat: 18.7883, lng: 98.9853 },
        timezone: 'Asia/Bangkok'
      },
      'barcelona-spain': {
        name: 'Barcelona',
        country: 'Spain',
        countryCode: 'ES',
        costOfLiving: {
          monthly: 1300,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        wifiSpeed: {
          average: 95,
          unit: 'Mbps',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        coordinates: { lat: 41.3851, lng: 2.1734 },
        timezone: 'Europe/Madrid'
      },
      'medellin-colombia': {
        name: 'Medellin',
        country: 'Colombia',
        countryCode: 'CO',
        costOfLiving: {
          monthly: 500,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        wifiSpeed: {
          average: 55,
          unit: 'Mbps',
          lastUpdated: '2024-01-01T00:00:00Z',
          source: 'Manual'
        },
        coordinates: { lat: 6.2442, lng: -75.5812 },
        timezone: 'America/Bogota'
      }
    };

    const key = `${cityName.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase()}`;
    return manualData[key] || null;
  }

  // Main method to get city data
  async getCityData(cityName: string, country: string): Promise<ApiResponse> {
    const cacheKey = `${cityName}-${country}`;
    const cached = this.cache.get(cacheKey);
    
    // Check cache first
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        source: 'Cache'
      };
    }

    // Try SmartPandas first
    let response = await this.fetchFromSmartPandas(cityName, country);
    if (response.success) {
      this.cache.set(cacheKey, { data: response.data!, timestamp: Date.now() });
      return response;
    }

    // Try Cities API as fallback
    response = await this.fetchFromCitiesAPI(cityName, country);
    if (response.success) {
      this.cache.set(cacheKey, { data: response.data!, timestamp: Date.now() });
      return response;
    }

    // Fallback to manual data
    const manualData = this.getManualData(cityName, country);
    if (manualData) {
      this.cache.set(cacheKey, { data: manualData, timestamp: Date.now() });
      return {
        success: true,
        data: manualData,
        source: 'Manual'
      };
    }

    return {
      success: false,
      error: 'No data available from any source',
      source: 'None'
    };
  }

  // Get multiple cities data
  async getMultipleCitiesData(cities: Array<{name: string, country: string}>): Promise<CityData[]> {
    const results: CityData[] = [];
    
    for (const city of cities) {
      try {
        const response = await this.getCityData(city.name, city.country);
        if (response.success && response.data) {
          results.push(response.data);
        }
      } catch (error) {
        console.error(`Error fetching data for ${city.name}, ${city.country}:`, error);
      }
    }
    
    return results;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const freeApiService = new FreeApiService();
