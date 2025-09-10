const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Load extracted data
const extractedData = JSON.parse(fs.readFileSync('scraped-data/nomads-extracted-data.json', 'utf8'));

async function scrapeCityDetails() {
  console.log('🚀 Starting city details scraping...');
  
  const cityDetails = [];
  
  // Test with a few cities first
  const testCities = extractedData.cities.slice(0, 3);
  
  for (const city of testCities) {
    console.log(`\n🔍 Scraping ${city.name} (${city.slug})...`);
    
    try {
      const cityUrl = `https://nomads.com/${city.slug}`;
      const cityData = await fetchPage(cityUrl);
      
      if (cityData) {
        console.log(`✅ Successfully scraped ${city.name}`);
        
        // Extract cost of living data
        const costData = extractCostData(cityData);
        
        // Extract other metrics
        const metrics = extractMetrics(cityData);
        
        cityDetails.push({
          name: city.name,
          slug: city.slug,
          url: cityUrl,
          image: city.image,
          costOfLiving: costData,
          metrics: metrics,
          scrapedAt: new Date().toISOString()
        });
        
        console.log(`💰 Cost data: ${Object.keys(costData).length} fields`);
        console.log(`📊 Metrics: ${Object.keys(metrics).length} fields`);
        
      } else {
        console.log(`❌ Failed to scrape ${city.name}`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error scraping ${city.name}: ${error.message}`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, 'scraped-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'city-details.json'),
    JSON.stringify(cityDetails, null, 2)
  );
  
  console.log(`\n💾 Saved ${cityDetails.length} city details to scraped-data/city-details.json`);
  
  // Display summary
  if (cityDetails.length > 0) {
    console.log('\n📊 Scraped Cities Summary:');
    cityDetails.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name}`);
      if (city.costOfLiving && Object.keys(city.costOfLiving).length > 0) {
        console.log(`   💰 Cost fields: ${Object.keys(city.costOfLiving).join(', ')}`);
      }
      if (city.metrics && Object.keys(city.metrics).length > 0) {
        console.log(`   📊 Metrics: ${Object.keys(city.metrics).join(', ')}`);
      }
    });
  }
}

function extractCostData(htmlContent) {
  const costData = {};
  
  // Look for cost of living values
  const costPatterns = [
    { pattern: /cost.*for.*nomad[^>]*>([^<]*)/gi, field: 'cost_for_nomad' },
    { pattern: /cost.*for.*local[^>]*>([^<]*)/gi, field: 'cost_for_local' },
    { pattern: /cost.*for.*expat[^>]*>([^<]*)/gi, field: 'cost_for_expat' },
    { pattern: /rent.*price[^>]*>([^<]*)/gi, field: 'rent_price' },
    { pattern: /apartment.*cost[^>]*>([^<]*)/gi, field: 'apartment_cost' },
    { pattern: /hotel.*price[^>]*>([^<]*)/gi, field: 'hotel_price' },
    { pattern: /airbnb.*price[^>]*>([^<]*)/gi, field: 'airbnb_price' }
  ];
  
  costPatterns.forEach(({ pattern, field }) => {
    const match = pattern.exec(htmlContent);
    if (match) {
      costData[field] = match[1].trim();
    }
  });
  
  // Look for dollar amounts
  const dollarPattern = /\$[\d,]+/g;
  const dollarMatches = htmlContent.match(dollarPattern);
  if (dollarMatches) {
    costData.dollar_amounts = dollarMatches.slice(0, 10); // Take first 10
  }
  
  return costData;
}

function extractMetrics(htmlContent) {
  const metrics = {};
  
  // Look for common metrics
  const metricPatterns = [
    { pattern: /internet.*speed[^>]*>([^<]*)/gi, field: 'internet_speed' },
    { pattern: /weather[^>]*>([^<]*)/gi, field: 'weather' },
    { pattern: /temperature[^>]*>([^<]*)/gi, field: 'temperature' },
    { pattern: /humidity[^>]*>([^<]*)/gi, field: 'humidity' },
    { pattern: /air.*quality[^>]*>([^<]*)/gi, field: 'air_quality' },
    { pattern: /safety[^>]*>([^<]*)/gi, field: 'safety' },
    { pattern: /nightlife[^>]*>([^<]*)/gi, field: 'nightlife' },
    { pattern: /coworking[^>]*>([^<]*)/gi, field: 'coworking' }
  ];
  
  metricPatterns.forEach(({ pattern, field }) => {
    const match = pattern.exec(htmlContent);
    if (match) {
      metrics[field] = match[1].trim();
    }
  });
  
  return metrics;
}

function fetchPage(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      console.log('❌ Too many redirects');
      resolve(null);
      return;
    }
    
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`🔄 Redirecting to: ${redirectUrl}`);
          resolve(fetchPage(redirectUrl, maxRedirects - 1));
          return;
        }
      }
      
      let stream = response;
      
      // Handle gzip compression
      if (response.headers['content-encoding'] === 'gzip') {
        stream = response.pipe(zlib.createGunzip());
      } else if (response.headers['content-encoding'] === 'deflate') {
        stream = response.pipe(zlib.createInflate());
      }
      
      let data = '';
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          console.log(`❌ HTTP ${response.statusCode}: ${response.statusMessage}`);
          resolve(null);
        }
      });
      
      stream.on('error', (error) => {
        console.log(`❌ Stream error: ${error.message}`);
        resolve(null);
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      resolve(null);
    });
    
    request.setTimeout(15000, () => {
      console.log('❌ Request timeout');
      request.destroy();
      resolve(null);
    });
  });
}

scrapeCityDetails().catch(console.error);
