/**
 * Simple API Test Script
 * Test TravelTables API with a single city to verify it works
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
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
    }
  } catch (error) {
    console.log('⚠️ Could not load .env file:', error.message);
  }
}

loadEnvFile();

async function testSingleCity() {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('❌ RAPIDAPI_KEY not found');
    return;
  }
  
  console.log('🔍 Testing TravelTables API with Amsterdam...');
  
  // Test different possible endpoints
  const endpoints = [
    'http://api.traveltables.com/cities?apikey=' + rapidApiKey,
    'http://api.traveltables.com/cost-of-living?apikey=' + rapidApiKey,
    'http://api.traveltables.com/cities/Amsterdam?apikey=' + rapidApiKey,
    'http://api.traveltables.com/cost-of-living/Amsterdam?apikey=' + rapidApiKey,
    'https://traveltables.p.rapidapi.com/cost-of-living/Amsterdam'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      let response;
      if (endpoint.includes('rapidapi.com')) {
        // Use RapidAPI headers
        response = await fetch(endpoint, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
          }
        });
      } else {
        // Use direct API call
        response = await fetch(endpoint);
      }
    
      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
      console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      const data = await response.text();
      console.log(`📄 Response Data:`, data.substring(0, 500));
      
      if (response.ok) {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Parsed JSON:`, JSON.stringify(jsonData, null, 2));
          console.log(`🎉 SUCCESS! This endpoint works!`);
          break; // Stop testing if we find a working endpoint
        } catch (parseError) {
          console.log(`⚠️ Could not parse as JSON:`, parseError.message);
        }
      } else {
        console.log(`❌ Endpoint failed with status ${response.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error with ${endpoint}:`, error.message);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testSingleCity();
