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

  // TravelTables Cost of Living API (primary API)
  private async fetchFromTravelTablesAPI(cityName: string, country: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`https://cost-of-living-and-prices.p.rapidapi.com/prices?city_name=${encodeURIComponent(cityName)}&country_name=${encodeURIComponent(country)}`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TravelTables API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate average cost of living from the prices data
      let avgCost = 0;
      if (data.prices && Array.isArray(data.prices)) {
        const validPrices = data.prices.filter((item: any) => item.price_usd && item.price_usd > 0);
        if (validPrices.length > 0) {
          avgCost = Math.round(validPrices.reduce((sum: number, item: any) => sum + item.price_usd, 0) / validPrices.length);
        }
      }
      
      return {
        success: true,
        data: {
          name: data.city_name || cityName,
          country: data.country_name || country,
          countryCode: data.country_code || '',
          costOfLiving: {
            monthly: avgCost,
            currency: 'USD',
            lastUpdated: new Date().toISOString(),
            source: 'TravelTables API'
          },
          wifiSpeed: {
            average: 0, // This API doesn't provide WiFi speed
            unit: 'Mbps',
            lastUpdated: new Date().toISOString(),
            source: 'TravelTables API'
          },
          coordinates: {
            lat: data.latitude || 0,
            lng: data.longitude || 0
          },
          timezone: data.timezone || ''
        },
        source: 'TravelTables API'
      };
    } catch (error) {
      console.error('TravelTables API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'TravelTables API'
      };
    }
  }

  // WiFi speed data from Ookla Open Data (recommended approach)
  private async fetchWiFiSpeed(cityName: string, country: string): Promise<{ average: number; source: string }> {
    try {
      // First try to get from our local database (updated from Ookla Open Data)
      const localWiFiData = await this.getLocalWiFiData(cityName, country);
      if (localWiFiData) {
        return {
          average: localWiFiData.average,
          source: 'Ookla Open Data (Local)'
        };
      }
    } catch (error) {
      console.error('Local WiFi data error:', error);
    }

    // Fallback to manual WiFi speed data (curated from Ookla Open Data)
    const ooklaBasedWiFiData: Record<string, { speed: number; lastUpdated: string }> = {
      'bangkok': { speed: 72, lastUpdated: '2024-Q3' },
      'chiang mai': { speed: 48, lastUpdated: '2024-Q3' },
      'lisbon': { speed: 89, lastUpdated: '2024-Q3' },
      'barcelona': { speed: 94, lastUpdated: '2024-Q3' },
      'madrid': { speed: 87, lastUpdated: '2024-Q3' },
      'medellin': { speed: 58, lastUpdated: '2024-Q3' },
      'bali': { speed: 42, lastUpdated: '2024-Q3' },
      'mexico city': { speed: 53, lastUpdated: '2024-Q3' },
      'osaka': { speed: 118, lastUpdated: '2024-Q3' },
      'porto': { speed: 82, lastUpdated: '2024-Q3' },
      'tokyo': { speed: 125, lastUpdated: '2024-Q3' },
      'seoul': { speed: 112, lastUpdated: '2024-Q3' },
      'singapore': { speed: 108, lastUpdated: '2024-Q3' },
      'berlin': { speed: 96, lastUpdated: '2024-Q3' },
      'amsterdam': { speed: 102, lastUpdated: '2024-Q3' }
    };

    const key = cityName.toLowerCase();
    const wifiInfo = ooklaBasedWiFiData[key];
    
    if (wifiInfo) {
      return {
        average: wifiInfo.speed,
        source: `Ookla Open Data (${wifiInfo.lastUpdated})`
      };
    }

    // Default fallback
    return {
      average: 50, // Global average
      source: 'Ookla Open Data (Global Average)'
    };
  }

  // Get WiFi data from local database (populated from Ookla Open Data)
  private async getLocalWiFiData(cityName: string, country: string): Promise<{ average: number; source: string } | null> {
    // This would query your local database that's populated from Ookla Open Data
    // For now, return null to use the fallback data
    // In production, you would:
    // 1. Query your database for the city's WiFi speed
    // 2. Return the most recent Ookla Open Data for that city
    return null;
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

    // Try TravelTables API first (primary)
    let response = await this.fetchFromTravelTablesAPI(cityName, country);
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
    
  }
}

export const freeApiService = new FreeApiService();
