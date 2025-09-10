const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
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
    console.log('⚠️ .env file not found');
  }
}

loadEnvFile();

const rapidApiKey = process.env.RAPIDAPI_KEY;

if (!rapidApiKey) {
  console.log('❌ RAPIDAPI_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔍 Testing TravelTables API endpoints...\n');

async function testEndpoint(url, headers = {}) {
  try {
    console.log(`📡 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; API-Test/1.0)',
        ...headers
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('📋 Response Headers:', JSON.stringify(responseHeaders, null, 2));
    
    const data = await response.text();
    console.log('📄 Response Data:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ Parsed JSON:`, JSON.stringify(jsonData, null, 2));
        console.log(`🎉 SUCCESS! This endpoint works!`);
        return true;
      } catch (parseError) {
        console.log(`⚠️ Could not parse as JSON:`, parseError.message);
        return false;
      }
    } else {
      console.log(`❌ Endpoint failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Network error:`, error.message);
    return false;
  }
}

async function testAllEndpoints() {
  const endpoints = [
    // Test root endpoint first
    {
      url: 'http://api.traveltables.com/',
      headers: {}
    },
    {
      url: `http://api.traveltables.com/?apikey=${rapidApiKey}`,
      headers: {}
    },
    // Test with different parameter formats
    {
      url: `http://api.traveltables.com/cities?apikey=${rapidApiKey}`,
      headers: {}
    },
    {
      url: `http://api.traveltables.com/cities?key=${rapidApiKey}`,
      headers: {}
    },
    {
      url: `http://api.traveltables.com/cities?api_key=${rapidApiKey}`,
      headers: {}
    },
    // Test RapidAPI endpoints with proper headers
    {
      url: 'https://traveltables.p.rapidapi.com/',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
      }
    },
    {
      url: 'https://traveltables.p.rapidapi.com/cities',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
      }
    },
    {
      url: 'https://traveltables.p.rapidapi.com/cost-of-living',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'traveltables.p.rapidapi.com'
      }
    }
  ];

  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.headers);
    if (success) {
      console.log('\n🎯 Found working endpoint! Stopping tests.');
      break;
    }
    console.log(''); // Empty line for readability
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  }
}

testAllEndpoints().catch(console.error);
