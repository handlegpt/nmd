import { supabase } from '../lib/supabase';

export interface NomadCity {
  id: string;
  name: string;
  country: string;
  continent: string;
  image: string;
  description: string;
  costOfLiving: 'Low' | 'Medium' | 'High';
  internetSpeed: number; // Mbps
  weather: string;
  timezone: string;
  nomadScore: number;
  monthlyBudget: {
    accommodation: number;
    food: number;
    transport: number;
    entertainment: number;
  };
  highlights: string[];
  cons: string[];
  isFavorite: boolean;
  latitude?: number;
  longitude?: number;
  population?: number;
  language?: string;
  currency?: string;
  visaInfo?: string;
  coworkingSpaces?: number;
  cafes?: number;
  safetyScore?: number;
}

export class CityService {
  // Cache for cities data
  private static citiesCache: NomadCity[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get all cities with caching
  static async getCities(): Promise<NomadCity[]> {
    // Check cache first
    if (this.citiesCache && Date.now() < this.cacheExpiry) {
      return this.citiesCache;
    }

    try {
      // Try to get from database first
      const { data: dbCities, error } = await supabase
        .from('cities')
        .select('*')
        .order('nomad_score', { ascending: false });

      if (error) {
        console.error('Error fetching cities from database:', error);
        // Fallback to static data
        return this.getStaticCities();
      }

      if (dbCities && dbCities.length > 0) {
        // Transform database data to match our interface
        const transformedCities = dbCities.map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
          continent: city.continent,
          image: city.image_url || this.getDefaultCityImage(city.name),
          description: city.description,
          costOfLiving: city.cost_of_living as 'Low' | 'Medium' | 'High',
          internetSpeed: city.internet_speed || 25,
          weather: city.weather || 'Tropical',
          timezone: city.timezone || 'GMT+7',
          nomadScore: city.nomad_score || 8.0,
          monthlyBudget: {
            accommodation: city.monthly_budget?.accommodation || 800,
            food: city.monthly_budget?.food || 400,
            transport: city.monthly_budget?.transport || 150,
            entertainment: city.monthly_budget?.entertainment || 300,
          },
          highlights: city.highlights || [],
          cons: city.cons || [],
          isFavorite: false,
          latitude: city.latitude,
          longitude: city.longitude,
          population: city.population,
          language: city.language,
          currency: city.currency,
          visaInfo: city.visa_info,
          coworkingSpaces: city.coworking_spaces,
          cafes: city.cafes,
          safetyScore: city.safety_score,
        }));

        // Cache the data
        this.citiesCache = transformedCities;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        return transformedCities;
      }

      // If no database data, use static data
      return this.getStaticCities();
    } catch (error) {
      console.error('Error in getCities:', error);
      return this.getStaticCities();
    }
  }

  // Get static cities data (fallback)
  private static getStaticCities(): NomadCity[] {
    return [
      {
        id: '1',
        name: 'Bali',
        country: 'Indonesia',
        continent: 'Asia',
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
        description: 'Tropical paradise with vibrant digital nomad community, affordable living, and stunning beaches.',
        costOfLiving: 'Low',
        internetSpeed: 25,
        weather: 'Tropical (25-32°C)',
        timezone: 'GMT+8',
        nomadScore: 9.2,
        monthlyBudget: {
          accommodation: 800,
          food: 400,
          transport: 150,
          entertainment: 300,
        },
        highlights: ['Affordable living', 'Great community', 'Beautiful beaches', 'Rich culture'],
        cons: ['Rainy season', 'Traffic congestion', 'Limited public transport'],
        isFavorite: false,
        latitude: -8.3405,
        longitude: 115.0920,
        population: 4300000,
        language: 'Indonesian, English',
        currency: 'IDR',
        visaInfo: '30-day visa on arrival, extendable',
        coworkingSpaces: 50,
        cafes: 200,
        safetyScore: 8.5,
      },
      {
        id: '2',
        name: 'Chiang Mai',
        country: 'Thailand',
        continent: 'Asia',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
        description: 'Cultural hub with excellent food, affordable living, and strong digital nomad scene.',
        costOfLiving: 'Low',
        internetSpeed: 30,
        weather: 'Tropical (20-35°C)',
        timezone: 'GMT+7',
        nomadScore: 8.8,
        monthlyBudget: {
          accommodation: 600,
          food: 300,
          transport: 100,
          entertainment: 250,
        },
        highlights: ['Excellent food', 'Cultural sites', 'Affordable', 'Good community'],
        cons: ['Burning season', 'Limited nightlife', 'Language barrier'],
        isFavorite: false,
        latitude: 18.7883,
        longitude: 98.9853,
        population: 1300000,
        language: 'Thai, English',
        currency: 'THB',
        visaInfo: '30-day visa on arrival, extendable',
        coworkingSpaces: 30,
        cafes: 150,
        safetyScore: 8.8,
      },
      {
        id: '3',
        name: 'Porto',
        country: 'Portugal',
        continent: 'Europe',
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
        description: 'Charming coastal city with rich history, excellent wine, and growing tech scene.',
        costOfLiving: 'Medium',
        internetSpeed: 100,
        weather: 'Mediterranean (10-25°C)',
        timezone: 'GMT+0',
        nomadScore: 8.5,
        monthlyBudget: {
          accommodation: 1200,
          food: 500,
          transport: 200,
          entertainment: 400,
        },
        highlights: ['Rich culture', 'Great food', 'Affordable Europe', 'Wine region'],
        cons: ['Hilly terrain', 'Rainy winters', 'Limited English'],
        isFavorite: false,
        latitude: 41.1579,
        longitude: -8.6291,
        population: 230000,
        language: 'Portuguese, English',
        currency: 'EUR',
        visaInfo: 'Schengen visa, D7 visa available',
        coworkingSpaces: 25,
        cafes: 100,
        safetyScore: 9.0,
      },
      {
        id: '4',
        name: 'Mexico City',
        country: 'Mexico',
        continent: 'Americas',
        image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800',
        description: 'Vibrant metropolis with rich culture, excellent food, and affordable living.',
        costOfLiving: 'Low',
        internetSpeed: 50,
        weather: 'Subtropical (15-30°C)',
        timezone: 'GMT-6',
        nomadScore: 8.3,
        monthlyBudget: {
          accommodation: 900,
          food: 350,
          transport: 120,
          entertainment: 300,
        },
        highlights: ['Rich culture', 'Excellent food', 'Affordable', 'Great community'],
        cons: ['Air pollution', 'Traffic congestion', 'Safety concerns'],
        isFavorite: false,
        latitude: 19.4326,
        longitude: -99.1332,
        population: 9200000,
        language: 'Spanish, English',
        currency: 'MXN',
        visaInfo: '180-day tourist visa',
        coworkingSpaces: 40,
        cafes: 180,
        safetyScore: 7.5,
      },
      {
        id: '5',
        name: 'Cape Town',
        country: 'South Africa',
        continent: 'Africa',
        image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
        description: 'Stunning coastal city with mountains, beaches, and growing digital nomad community.',
        costOfLiving: 'Medium',
        internetSpeed: 40,
        weather: 'Mediterranean (10-25°C)',
        timezone: 'GMT+2',
        nomadScore: 8.0,
        monthlyBudget: {
          accommodation: 1000,
          food: 400,
          transport: 150,
          entertainment: 350,
        },
        highlights: ['Beautiful nature', 'Affordable', 'Great weather', 'Wine region'],
        cons: ['Safety concerns', 'Load shedding', 'Limited public transport'],
        isFavorite: false,
        latitude: -33.9249,
        longitude: 18.4241,
        population: 4400000,
        language: 'English, Afrikaans',
        currency: 'ZAR',
        visaInfo: '90-day tourist visa',
        coworkingSpaces: 20,
        cafes: 80,
        safetyScore: 7.0,
      },
    ];
  }

  // Get default city image
  private static getDefaultCityImage(cityName: string): string {
    const defaultImages = {
      'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
      'Chiang Mai': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      'Porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
      'Mexico City': 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800',
      'Cape Town': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    };
    return defaultImages[cityName as keyof typeof defaultImages] || 'https://images.unsplash.com/photo-1480714378408-67cf0d13bcff?w=800';
  }

  // Search cities
  static async searchCities(query: string): Promise<NomadCity[]> {
    const cities = await this.getCities();
    const lowerQuery = query.toLowerCase();
    
    return cities.filter(city => 
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery) ||
      city.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get cities by continent
  static async getCitiesByContinent(continent: string): Promise<NomadCity[]> {
    const cities = await this.getCities();
    
    if (continent === 'All') {
      return cities;
    }
    
    return cities.filter(city => city.continent === continent);
  }

  // Get city by ID
  static async getCityById(id: string): Promise<NomadCity | null> {
    const cities = await this.getCities();
    return cities.find(city => city.id === id) || null;
  }

  // Get top cities by nomad score
  static async getTopCities(limit: number = 10): Promise<NomadCity[]> {
    const cities = await this.getCities();
    return cities
      .sort((a, b) => b.nomadScore - a.nomadScore)
      .slice(0, limit);
  }

  // Clear cache
  static clearCache(): void {
    this.citiesCache = null;
    this.cacheExpiry = 0;
  }
}
