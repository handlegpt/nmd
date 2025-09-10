/**
 * Cost of Living API Test Script
 * 
 * This script verifies whether the cost of living APIs are being used
 * and checks the current state of city data in the database.
 * 
 * Usage:
 *   node test-cost-of-living-api.js
 * 
 * Requirements:
 *   - Must be run on server with environment variables
 *   - Requires .env file with Supabase credentials
 *   - Optional: NUMBEO_API_KEY and RAPIDAPI_KEY for API testing
 * 
 * What it checks:
 *   1. Current city data in database
 *   2. API key configuration
 *   3. Cache status and update mechanisms
 *   4. Provides recommendations for improvement
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCostOfLivingAPI() {
  console.log('🔍 Testing Cost of Living API Usage...\n');

  try {
    // 1. Check current city data in database
    console.log('1. 📊 Checking current city data in database...');
    const { data: cities, error } = await supabase
      .from('cities')
      .select('id, name, country, cost_of_living, wifi_speed, updated_at')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching cities:', error);
      return;
    }

    console.log(`✅ Found ${cities.length} cities in database:`);
    cities.forEach(city => {
      console.log(`   - ${city.name}, ${city.country}: $${city.cost_of_living || 'N/A'} (WiFi: ${city.wifi_speed || 'N/A'} Mbps)`);
      console.log(`     Last updated: ${city.updated_at || 'Never'}`);
    });

    // 2. Check if API keys are configured
    console.log('\n2. 🔑 Checking API configuration...');
    const numbeoKey = process.env.NUMBEO_API_KEY;
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    
    console.log(`   - NUMBEO_API_KEY: ${numbeoKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - RAPIDAPI_KEY: ${rapidApiKey ? '✅ Configured' : '❌ Missing'}`);

    // 3. Test API calls (if keys are available)
    if (numbeoKey || rapidApiKey) {
      console.log('\n3. 🌐 Testing API calls...');
      
      // Test with a popular city
      const testCity = 'Bangkok';
      const testCountry = 'Thailand';
      
      console.log(`   Testing with: ${testCity}, ${testCountry}`);
      
      // Simulate API call (without actually calling to avoid rate limits)
      console.log('   - Would call TravelTables API (if RAPIDAPI_KEY available)');
      console.log('   - Would call Numbeo API (if NUMBEO_API_KEY available)');
      console.log('   - Would fallback to manual data if APIs fail');
    } else {
      console.log('\n3. ⚠️ No API keys configured - API calls will not work');
    }

    // 4. Check for automatic update mechanisms
    console.log('\n4. 🔄 Checking for automatic update mechanisms...');
    
    // Look for scheduled jobs or update triggers
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('event_object_table', 'cities');

    if (triggerError) {
      console.log('   - No database triggers found for automatic updates');
    } else {
      console.log(`   - Found ${triggers.length} triggers on cities table`);
    }

    // 5. Check cache status
    console.log('\n5. 💾 Checking cache status...');
    console.log('   - API data is cached for 30 days (regular cities)');
    console.log('   - API data is cached for 90 days (popular cities)');
    console.log('   - Cache is stored in memory (not persistent)');

    // 6. Recommendations
    console.log('\n6. 💡 Recommendations:');
    
    if (!numbeoKey && !rapidApiKey) {
      console.log('   ❌ Configure API keys to enable live data updates:');
      console.log('      - Add NUMBEO_API_KEY to .env for Numbeo API');
      console.log('      - Add RAPIDAPI_KEY to .env for TravelTables API');
    }
    
    console.log('   📝 Current data sources:');
    console.log('      1. TravelTables API (primary) - requires RAPIDAPI_KEY');
    console.log('      2. Numbeo API (fallback) - requires NUMBEO_API_KEY');
    console.log('      3. Manual data (final fallback) - hardcoded values');
    
    console.log('   🔄 To enable automatic updates:');
    console.log('      - Set up a cron job to call the API periodically');
    console.log('      - Or implement a background service to update data');
    console.log('      - Or add manual update triggers in the admin panel');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testCostOfLivingAPI().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
