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
  
  // Test the most likely working endpoint
  const endpoint = 'https://traveltables.p.rapidapi.com/cost-of-living/Amsterdam';
  
  try {
    console.log(`📡 Calling: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log(`📄 Response Data:`, data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ Parsed JSON:`, JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log(`⚠️ Could not parse as JSON:`, parseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSingleCity();
