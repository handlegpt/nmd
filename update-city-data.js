/**
 * Manual City Data Update Script
 * 
 * This script manually updates city data using the cost of living APIs
 * to force refresh data that might be cached or outdated.
 * 
 * Usage:
 *   node update-city-data.js [city_name] [country]
 * 
 * Examples:
 *   node update-city-data.js                    # Update all cities
 *   node update-city-data.js Bangkok Thailand   # Update specific city
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value.trim();
          }
        }
      });
      console.log('✅ Loaded environment variables from .env file');
    } else {
      console.log('⚠️ No .env file found, using system environment variables');
    }
  } catch (error) {
    console.log('⚠️ Could not load .env file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Simple Supabase client using fetch
async function supabaseRequest(table, options = {}) {
  const { select = '*', limit, order, method = 'GET', body } = options;
  let url = `${supabaseUrl}/rest/v1/${table}`;
  
  if (method === 'GET') {
    url += `?select=${select}`;
    if (limit) url += `&limit=${limit}`;
    if (order) url += `&order=${order}`;
  }
  
  const requestOptions = {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Cost of Living API Service (simplified version)
class CostOfLivingAPI {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.numbeoKey = process.env.NUMBEO_API_KEY;
  }

  async fetchFromTravelTablesAPI(cityName, country) {
    if (!this.rapidApiKey) {
      return { success: false, error: 'RAPIDAPI_KEY not configured' };
    }

    try {
      const response = await fetch(`https://traveltables.p.rapidapi.com/cost-of-living/${cityName}`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`TravelTables API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract cost of living data
      const costOfLiving = data.cost_of_living || data.average_cost || 0;
      
      return {
        success: true,
        data: {
          cost_of_living: Math.round(costOfLiving),
          source: 'TravelTables API',
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fetchFromNumbeo(cityName, country) {
    if (!this.numbeoKey) {
      return { success: false, error: 'NUMBEO_API_KEY not configured' };
    }

    try {
      const response = await fetch(`https://www.numbeo.com/api/city_prices?api_key=${this.numbeoKey}&query=${encodeURIComponent(cityName)}`);
      
      if (!response.ok) {
        throw new Error(`Numbeo API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate average cost of living from Numbeo data
      const avgCost = data.prices ? 
        Math.round(data.prices.reduce((sum, item) => sum + (item.average_price || 0), 0) / data.prices.length) : 0;
      
      return {
        success: true,
        data: {
          cost_of_living: avgCost,
          source: 'Numbeo API',
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCityData(cityName, country) {
    // Check if we have any API keys configured
    if (!this.rapidApiKey && !this.numbeoKey) {
      return {
        success: false,
        error: 'No API keys configured. Please set RAPIDAPI_KEY or NUMBEO_API_KEY in .env file'
      };
    }

    // Try TravelTables API first (if key is available)
    if (this.rapidApiKey) {
      let response = await this.fetchFromTravelTablesAPI(cityName, country);
      if (response.success) {
        return response;
      }
    }

    // Try Numbeo API as fallback (if key is available)
    if (this.numbeoKey) {
      let response = await this.fetchFromNumbeo(cityName, country);
      if (response.success) {
        return response;
      }
    }

    return {
      success: false,
      error: 'No data available from any API source. Check API keys and city names.'
    };
  }
}

async function updateCityData(cityName, country) {
  console.log(`\n🔄 Updating data for ${cityName}, ${country}...`);
  
  const api = new CostOfLivingAPI();
  const response = await api.getCityData(cityName, country);
  
  if (response.success) {
    console.log(`✅ API data retrieved: $${response.data.cost_of_living} (${response.data.source})`);
    
    // Update database
    try {
      // First, find the city by name and country
      const cities = await supabaseRequest('cities', {
        select: 'id,name,country',
        method: 'GET'
      });
      
      const city = cities.find(c => 
        c.name.toLowerCase() === cityName.toLowerCase() && 
        c.country.toLowerCase() === country.toLowerCase()
      );
      
      if (!city) {
        console.log(`⚠️ City not found in database: ${cityName}, ${country}`);
        return false;
      }
      
      // Update the specific city
      const updateResult = await supabaseRequest(`cities?id=eq.${city.id}`, {
        method: 'PATCH',
        body: {
          cost_of_living: response.data.cost_of_living,
          updated_at: new Date().toISOString()
        }
      });
      
      console.log(`✅ Database updated successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update database:`, error.message);
      return false;
    }
  } else {
    console.log(`❌ Failed to get API data: ${response.error}`);
    return false;
  }
}

async function testAPIKeys() {
  console.log('🔍 Testing API keys...');
  
  const api = new CostOfLivingAPI();
  
  if (api.rapidApiKey) {
    console.log(`✅ RAPIDAPI_KEY configured (${api.rapidApiKey.substring(0, 10)}...)`);
  } else {
    console.log('❌ RAPIDAPI_KEY not configured');
  }
  
  if (api.numbeoKey) {
    console.log(`✅ NUMBEO_API_KEY configured (${api.numbeoKey.substring(0, 10)}...)`);
  } else {
    console.log('❌ NUMBEO_API_KEY not configured');
  }
  
  if (!api.rapidApiKey && !api.numbeoKey) {
    console.log('\n⚠️ No API keys configured! Please add RAPIDAPI_KEY or NUMBEO_API_KEY to .env file');
    return false;
  }
  
  console.log('');
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const targetCity = args[0];
  const targetCountry = args[1];

  console.log('🚀 Starting manual city data update...\n');
  
  // Test API keys first
  const keysValid = await testAPIKeys();
  if (!keysValid) {
    process.exit(1);
  }

  try {
    if (targetCity && targetCountry) {
      // Update specific city
      console.log(`📍 Updating specific city: ${targetCity}, ${targetCountry}`);
      await updateCityData(targetCity, targetCountry);
    } else {
      // Update all cities
      console.log('📍 Updating all cities...');
      
      const cities = await supabaseRequest('cities', {
        select: 'id,name,country,cost_of_living,updated_at',
        order: 'name'
      });

      console.log(`Found ${cities.length} cities to update\n`);

      let successCount = 0;
      let failCount = 0;

      for (const city of cities) {
        const success = await updateCityData(city.name, city.country);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n📊 Update Summary:`);
      console.log(`   ✅ Successfully updated: ${successCount} cities`);
      console.log(`   ❌ Failed to update: ${failCount} cities`);
    }

  } catch (error) {
    console.error('❌ Error during update:', error);
  }
}

// Run the update
main().then(() => {
  console.log('\n✅ Update completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
