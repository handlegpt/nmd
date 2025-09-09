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
  // 生活成本数据变化很慢，可以长时间缓存
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly POPULAR_CITIES_CACHE_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 days for popular cities
  private cache = new Map<string, { data: CityData; timestamp: number }>();
  
  // 热门城市列表，这些城市数据更稳定，可以缓存更久
  private readonly POPULAR_CITIES = [
    'Bangkok', 'Chiang Mai', 'Lisbon', 'Barcelona', 'Madrid',
    'Medellin', 'Bali', 'Mexico City', 'Osaka', 'Porto'
  ];

  // Numbeo API (free tier: 1000 requests/month)
  private async fetchFromNumbeo(cityName: string, country: string): Promise<ApiResponse> {
    try {
      // Numbeo free API endpoint
      const response = await fetch(`https://www.numbeo.com/api/city_prices?api_key=${process.env.NUMBEO_API_KEY || ''}&query=${encodeURIComponent(cityName)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Numbeo API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate average cost of living from Numbeo data
      const avgCost = data.prices ? 
        Math.round(data.prices.reduce((sum: number, item: any) => sum + (item.average_price || 0), 0) / data.prices.length) : 0;
      
      return {
        success: true,
        data: {
          name: data.name || cityName,
          country: data.country || country,
          countryCode: data.country_code || '',
          costOfLiving: {
            monthly: avgCost,
            currency: data.currency || 'USD',
            lastUpdated: new Date().toISOString(),
            source: 'Numbeo'
          },
          wifiSpeed: {
            average: 0, // Numbeo doesn't provide WiFi speed
            unit: 'Mbps',
            lastUpdated: new Date().toISOString(),
            source: 'Numbeo'
          },
          coordinates: {
            lat: data.latitude || 0,
            lng: data.longitude || 0
          },
          timezone: data.timezone || ''
        },
        source: 'Numbeo'
      };
    } catch (error) {
      console.error('Numbeo API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Numbeo'
      };
    }
  }

  // Cities Cost of Living API (primary API)
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

  // Free WiFi speed data from Speedtest.net API
  private async fetchWiFiSpeed(cityName: string, country: string): Promise<{ average: number; source: string }> {
    try {
      // Use Ookla's free API for WiFi speed data
      const response = await fetch(`https://api.ookla.com/v1/speedtest/cities?search=${encodeURIComponent(cityName)}`, {
        headers: {
          'User-Agent': 'NomadNow/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cities && data.cities.length > 0) {
          const city = data.cities.find((c: any) => c.name.toLowerCase().includes(cityName.toLowerCase()));
          if (city && city.speed) {
            return {
              average: Math.round(city.speed.download || 0),
              source: 'Ookla Speedtest'
            };
          }
        }
      }
    } catch (error) {
      console.error('WiFi speed API error:', error);
    }

    // Fallback to manual WiFi speed data
    const manualWiFiData: Record<string, number> = {
      'bangkok': 70,
      'chiang mai': 50,
      'lisbon': 90,
      'barcelona': 95,
      'madrid': 85,
      'medellin': 60,
      'bali': 40,
      'mexico city': 55,
      'osaka': 120,
      'porto': 80
    };

    const key = cityName.toLowerCase();
    const speed = manualWiFiData[key] || 50; // Default 50 Mbps

    return {
      average: speed,
      source: 'Manual Data'
    };
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
    
    // 根据城市类型选择不同的缓存时间
    const isPopularCity = this.POPULAR_CITIES.includes(cityName);
    const cacheDuration = isPopularCity ? this.POPULAR_CITIES_CACHE_DURATION : this.CACHE_DURATION;
    
    // Check cache first
    if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
      return {
        success: true,
        data: cached.data,
        source: `Cache (${isPopularCity ? '90d' : '30d'})`
      };
    }

    // Try Cities API first (primary)
    let response = await this.fetchFromCitiesAPI(cityName, country);
    if (response.success) {
      this.cache.set(cacheKey, { data: response.data!, timestamp: Date.now() });
      return response;
    }

    // Try Numbeo API as fallback
    response = await this.fetchFromNumbeo(cityName, country);
    if (response.success) {
      // Enhance with WiFi speed data
      const wifiData = await this.fetchWiFiSpeed(cityName, country);
      response.data!.wifiSpeed = {
        average: wifiData.average,
        unit: 'Mbps',
        lastUpdated: new Date().toISOString(),
        source: wifiData.source
      };
      
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

  // 预加载热门城市数据
  async preloadPopularCities(): Promise<void> {
    console.log('🚀 Preloading popular cities data...');
    
    const popularCitiesData = [
      { name: 'Bangkok', country: 'Thailand' },
      { name: 'Chiang Mai', country: 'Thailand' },
      { name: 'Lisbon', country: 'Portugal' },
      { name: 'Barcelona', country: 'Spain' },
      { name: 'Madrid', country: 'Spain' },
      { name: 'Medellin', country: 'Colombia' },
      { name: 'Bali', country: 'Indonesia' },
      { name: 'Mexico City', country: 'Mexico' },
      { name: 'Osaka', country: 'Japan' },
      { name: 'Porto', country: 'Portugal' }
    ];

    for (const city of popularCitiesData) {
      try {
        // 检查是否已有缓存数据
        const cacheKey = `${city.name}-${city.country}`;
        const cached = this.cache.get(cacheKey);
        
        if (!cached || (Date.now() - cached.timestamp) > this.POPULAR_CITIES_CACHE_DURATION) {
          console.log(`📊 Loading data for ${city.name}, ${city.country}...`);
          await this.getCityData(city.name, city.country);
          
          // 添加延迟避免API速率限制
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(`✅ ${city.name}, ${city.country} already cached`);
        }
      } catch (error) {
        console.error(`❌ Error preloading ${city.name}, ${city.country}:`, error);
      }
    }
    
    console.log('✅ Popular cities preloading completed');
  }

  // 获取缓存状态信息
  getCacheInfo(): { 
    totalCached: number; 
    popularCitiesCached: number; 
    cacheAge: Record<string, number>;
    nextRefresh: Record<string, string>;
  } {
    const now = Date.now();
    const cacheInfo = {
      totalCached: this.cache.size,
      popularCitiesCached: 0,
      cacheAge: {} as Record<string, number>,
      nextRefresh: {} as Record<string, string>
    };

    this.cache.forEach((value, key) => {
      const age = Math.floor((now - value.timestamp) / (1000 * 60 * 60 * 24)); // days
      cacheInfo.cacheAge[key] = age;
      
      const isPopularCity = this.POPULAR_CITIES.some(city => key.includes(city));
      if (isPopularCity) {
        cacheInfo.popularCitiesCached++;
      }
      
      const cacheDuration = isPopularCity ? this.POPULAR_CITIES_CACHE_DURATION : this.CACHE_DURATION;
      const nextRefreshTime = new Date(value.timestamp + cacheDuration);
      cacheInfo.nextRefresh[key] = nextRefreshTime.toLocaleDateString();
    });

    return cacheInfo;
  }

  // 手动刷新特定城市数据
  async refreshCityData(cityName: string, country: string): Promise<ApiResponse> {
    const cacheKey = `${cityName}-${country}`;
    
    // 清除缓存
    this.cache.delete(cacheKey);
    
    // 重新获取数据
    return await this.getCityData(cityName, country);
  }

  // 批量刷新过期数据
  async refreshExpiredData(): Promise<void> {
    console.log('🔄 Refreshing expired cache data...');
    
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((value, key) => {
      const isPopularCity = this.POPULAR_CITIES.some(city => key.includes(city));
      const cacheDuration = isPopularCity ? this.POPULAR_CITIES_CACHE_DURATION : this.CACHE_DURATION;
      
      if ((now - value.timestamp) > cacheDuration) {
        expiredKeys.push(key);
      }
    });
    
    for (const key of expiredKeys) {
      const [cityName, country] = key.split('-');
      console.log(`🔄 Refreshing expired data for ${cityName}, ${country}`);
      await this.refreshCityData(cityName, country);
      
      // 添加延迟避免API速率限制
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`✅ Refreshed ${expiredKeys.length} expired cache entries`);
  }
}

export const freeApiService = new FreeApiService();
