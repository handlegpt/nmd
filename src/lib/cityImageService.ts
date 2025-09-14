// City Image Service - Dynamic image management for cities
// This service provides city-specific images and fallback mechanisms

export interface CityImageData {
  id: string
  url: string
  title: string
  description: string
  photographer: string
  location: string
  likes: number
  isUserUploaded: boolean
  tags: string[]
  source: 'unsplash' | 'user' | 'curated'
}

export interface CityImageConfig {
  cityName: string
  country: string
  region?: string
  tags?: string[]
}

// Curated city-specific image collections
const CITY_IMAGE_COLLECTIONS: { [key: string]: Partial<CityImageData>[] } = {
  'bangkok': [
    {
      url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&q=80',
      title: 'Bangkok Temples',
      description: 'Traditional Thai temples and golden architecture',
      location: 'Temple District',
      tags: ['temple', 'culture', 'architecture']
    },
    {
      url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop&q=80',
      title: 'Bangkok Street Food',
      description: 'Famous street food markets and local cuisine',
      location: 'Chinatown',
      tags: ['food', 'street', 'culture']
    },
    {
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      title: 'Bangkok Skyline',
      description: 'Modern skyline with traditional elements',
      location: 'Sukhumvit',
      tags: ['skyline', 'modern', 'urban']
    }
  ],
  'tokyo': [
    {
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80',
      title: 'Tokyo Shibuya',
      description: 'Famous Shibuya crossing and neon lights',
      location: 'Shibuya',
      tags: ['neon', 'crossing', 'urban']
    },
    {
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&q=80',
      title: 'Tokyo Traditional',
      description: 'Traditional temples and peaceful gardens',
      location: 'Asakusa',
      tags: ['temple', 'traditional', 'garden']
    },
    {
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80',
      title: 'Tokyo Cherry Blossoms',
      description: 'Beautiful cherry blossom season',
      location: 'Ueno Park',
      tags: ['cherry-blossom', 'nature', 'spring']
    }
  ],
  'lisbon': [
    {
      url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop&q=80',
      title: 'Lisbon Tram',
      description: 'Famous yellow trams and historic streets',
      location: 'Alfama',
      tags: ['tram', 'historic', 'street']
    },
    {
      url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop&q=80',
      title: 'Lisbon Belem',
      description: 'Historic Belem Tower and waterfront',
      location: 'Belem',
      tags: ['historic', 'waterfront', 'tower']
    },
    {
      url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop&q=80',
      title: 'Lisbon Hills',
      description: 'Beautiful hills and viewpoints',
      location: 'Bairro Alto',
      tags: ['hills', 'viewpoint', 'scenic']
    }
  ],
  'barcelona': [
    {
      url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&q=80',
      title: 'Sagrada Familia',
      description: 'Gaudi\'s masterpiece cathedral',
      location: 'Eixample',
      tags: ['gaudi', 'cathedral', 'architecture']
    },
    {
      url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop&q=80',
      title: 'Barcelona Beach',
      description: 'Beautiful Mediterranean coastline',
      location: 'Barceloneta',
      tags: ['beach', 'mediterranean', 'coastline']
    },
    {
      url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&q=80',
      title: 'Barcelona Gothic Quarter',
      description: 'Historic Gothic Quarter streets',
      location: 'Gothic Quarter',
      tags: ['gothic', 'historic', 'narrow-streets']
    }
  ],
  'berlin': [
    {
      url: 'https://images.unsplash.com/photo-1587330979470-3595ac045cb0?w=800&h=600&fit=crop&q=80',
      title: 'Berlin Wall',
      description: 'Historic Berlin Wall and street art',
      location: 'East Side Gallery',
      tags: ['wall', 'street-art', 'history']
    },
    {
      url: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&fit=crop&q=80',
      title: 'Berlin Nightlife',
      description: 'Vibrant nightlife and culture',
      location: 'Kreuzberg',
      tags: ['nightlife', 'culture', 'vibrant']
    },
    {
      url: 'https://images.unsplash.com/photo-1587330979470-3595ac045cb0?w=800&h=600&fit=crop&q=80',
      title: 'Berlin Brandenburg Gate',
      description: 'Iconic Brandenburg Gate',
      location: 'Mitte',
      tags: ['landmark', 'iconic', 'historic']
    }
  ],
  'amsterdam': [
    {
      url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&h=600&fit=crop&q=80',
      title: 'Amsterdam Canals',
      description: 'Beautiful canal houses and waterways',
      location: 'Canal District',
      tags: ['canals', 'houses', 'waterways']
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      title: 'Amsterdam Bikes',
      description: 'Famous cycling culture and bike paths',
      location: 'City Center',
      tags: ['bikes', 'cycling', 'culture']
    },
    {
      url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&h=600&fit=crop&q=80',
      title: 'Amsterdam Tulips',
      description: 'Beautiful tulip fields and gardens',
      location: 'Keukenhof',
      tags: ['tulips', 'flowers', 'gardens']
    }
  ],
  'paris': [
    {
      url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&q=80',
      title: 'Eiffel Tower',
      description: 'Iconic Eiffel Tower and Paris skyline',
      location: 'Champ de Mars',
      tags: ['eiffel-tower', 'landmark', 'iconic']
    },
    {
      url: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800&h=600&fit=crop&q=80',
      title: 'Paris Cafes',
      description: 'Charming Parisian cafes and streets',
      location: 'Montmartre',
      tags: ['cafes', 'charming', 'streets']
    },
    {
      url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&q=80',
      title: 'Paris Seine',
      description: 'Beautiful Seine River and bridges',
      location: 'Seine River',
      tags: ['river', 'bridges', 'romantic']
    }
  ],
  'london': [
    {
      url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
      title: 'Big Ben',
      description: 'Iconic Big Ben and Westminster',
      location: 'Westminster',
      tags: ['big-ben', 'landmark', 'historic']
    },
    {
      url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
      title: 'London Bridge',
      description: 'Famous Tower Bridge',
      location: 'Tower Bridge',
      tags: ['bridge', 'iconic', 'thames']
    },
    {
      url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
      title: 'London Pubs',
      description: 'Traditional British pubs and culture',
      location: 'Covent Garden',
      tags: ['pubs', 'culture', 'traditional']
    }
  ]
}

// Fallback image categories for unknown cities
const FALLBACK_IMAGE_CATEGORIES = [
  {
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80',
    title: 'City Skyline',
    description: 'Beautiful cityscape view',
    tags: ['skyline', 'urban', 'modern']
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    title: 'Street Life',
    description: 'Vibrant street scene',
    tags: ['street', 'life', 'culture']
  },
  {
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
    title: 'Local Landmarks',
    description: 'Famous landmarks and architecture',
    tags: ['landmarks', 'architecture', 'historic']
  },
  {
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&q=80',
    title: 'Night Life',
    description: 'City lights and nightlife',
    tags: ['nightlife', 'lights', 'entertainment']
  }
]

export class CityImageService {
  /**
   * Generate city-specific images with fallbacks
   */
  static generateCityImages(config: CityImageConfig): CityImageData[] {
    const citySlug = config.cityName.toLowerCase().replace(/\s+/g, '-')
    const countrySlug = config.country.toLowerCase().replace(/\s+/g, '-')
    
    // Try to get curated images for this city
    const curatedImages = CITY_IMAGE_COLLECTIONS[citySlug] || []
    
    let images: CityImageData[] = []
    
    if (curatedImages.length > 0) {
      // Use curated images
      images = curatedImages.map((image, index) => ({
        id: `curated-${index + 1}`,
        url: image.url || '',
        title: image.title || `${config.cityName} View`,
        description: image.description || `Beautiful view of ${config.cityName}`,
        photographer: 'Local Photographer',
        location: image.location || 'City Center',
        likes: Math.floor(Math.random() * 200) + 50,
        isUserUploaded: Math.random() > 0.5,
        tags: image.tags || ['city', 'travel'],
        source: 'curated' as const
      }))
    } else {
      // Use fallback images with city-specific titles
      images = FALLBACK_IMAGE_CATEGORIES.map((image, index) => ({
        id: `fallback-${index + 1}`,
        url: image.url,
        title: `${config.cityName} ${image.title}`,
        description: image.description.replace('city', config.cityName),
        photographer: 'Unsplash',
        location: 'City Center',
        likes: Math.floor(Math.random() * 150) + 30,
        isUserUploaded: Math.random() > 0.5,
        tags: image.tags,
        source: 'unsplash' as const
      }))
    }
    
    return images
  }
  
  /**
   * Get image search suggestions for a city
   */
  static getImageSearchSuggestions(cityName: string, country: string): string[] {
    const suggestions = [
      `${cityName} skyline`,
      `${cityName} landmarks`,
      `${cityName} street life`,
      `${cityName} culture`,
      `${cityName} nightlife`,
      `${cityName} architecture`,
      `${cityName} ${country}`,
      `${cityName} travel`,
      `${cityName} tourism`
    ]
    
    return suggestions
  }
  
  /**
   * Add a new city to the curated collection
   */
  static addCityToCollection(citySlug: string, images: Partial<CityImageData>[]): void {
    CITY_IMAGE_COLLECTIONS[citySlug] = images
  }
  
  /**
   * Get all available city collections
   */
  static getAvailableCities(): string[] {
    return Object.keys(CITY_IMAGE_COLLECTIONS)
  }
  
  /**
   * Check if a city has curated images
   */
  static hasCuratedImages(cityName: string): boolean {
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-')
    return citySlug in CITY_IMAGE_COLLECTIONS
  }
}

export default CityImageService
