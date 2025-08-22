// Reverse geocoding utility for getting city and country names
export interface GeocodingResult {
  city: string;
  country: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, GeocodingResult>();

// Generate cache key from coordinates
const getCacheKey = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
};

// Reverse geocoding using OpenStreetMap Nominatim API
export const reverseGeocode = async (
  latitude: number, 
  longitude: number
): Promise<GeocodingResult> => {
  const cacheKey = getCacheKey(latitude, longitude);
  
  // Check cache first
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NomadNow/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    const result: GeocodingResult = {
      city: data.address?.city || 
            data.address?.town || 
            data.address?.village || 
            data.address?.municipality ||
            'Unknown City',
      country: data.address?.country || 'Unknown Country',
      address: data.display_name || 'Unknown Address',
      coordinates: { latitude, longitude },
    };

    // Cache the result
    geocodingCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Return fallback data
    const fallback: GeocodingResult = {
      city: 'Unknown City',
      country: 'Unknown Country',
      address: 'Location not available',
      coordinates: { latitude, longitude },
    };
    
    return fallback;
  }
};

// Batch reverse geocoding for multiple coordinates
export const batchReverseGeocode = async (
  coordinates: Array<{ latitude: number; longitude: number }>
): Promise<GeocodingResult[]> => {
  const results: GeocodingResult[] = [];
  
  for (const coord of coordinates) {
    try {
      const result = await reverseGeocode(coord.latitude, coord.longitude);
      results.push(result);
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Batch geocoding error for coordinate:', coord, error);
      results.push({
        city: 'Unknown City',
        country: 'Unknown Country',
        address: 'Location not available',
        coordinates: coord,
      });
    }
  }
  
  return results;
};

// Clear geocoding cache
export const clearGeocodingCache = (): void => {
  geocodingCache.clear();
};

// Get cache size for debugging
export const getGeocodingCacheSize = (): number => {
  return geocodingCache.size;
};
