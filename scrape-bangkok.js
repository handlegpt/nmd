const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function scrapeBangkok() {
  console.log('🚀 Scraping Bangkok data from Nomads.com...');
  
  try {
    const bangkokUrl = 'https://nomads.com/bangkok';
    const cityData = await fetchPage(bangkokUrl);
    
    if (cityData) {
      console.log('✅ Successfully scraped Bangkok data');
      
      // Extract detailed data
      const extractedData = extractBangkokData(cityData);
      
      // Save raw data
      const outputDir = path.join(__dirname, 'scraped-data');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      
      fs.writeFileSync(
        path.join(outputDir, 'bangkok-raw.html'),
        cityData
      );
      
      fs.writeFileSync(
        path.join(outputDir, 'bangkok-extracted.json'),
        JSON.stringify(extractedData, null, 2)
      );
      
      console.log('💾 Saved Bangkok data to scraped-data/');
      
      // Display extracted data
      console.log('\n📊 Bangkok Data Summary:');
      console.log(`Cost of Living: ${Object.keys(extractedData.costOfLiving).length} fields`);
      console.log(`Metrics: ${Object.keys(extractedData.metrics).length} fields`);
      console.log(`Prices: ${extractedData.prices.length} price points`);
      
      if (extractedData.prices.length > 0) {
        console.log('\n💰 Sample Prices:');
        extractedData.prices.slice(0, 10).forEach((price, index) => {
          console.log(`${index + 1}. ${price}`);
        });
      }
      
      return extractedData;
      
    } else {
      console.log('❌ Failed to scrape Bangkok data');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error scraping Bangkok:', error.message);
    return null;
  }
}

function extractBangkokData(htmlContent) {
  const data = {
    name: 'Bangkok',
    country: 'Thailand',
    extractedAt: new Date().toISOString(),
    costOfLiving: {},
    metrics: {},
    prices: [],
    rawData: {}
  };
  
  // Extract cost of living data
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
    if (match && match[1].trim()) {
      data.costOfLiving[field] = match[1].trim();
    }
  });
  
  // Extract metrics
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
    if (match && match[1].trim()) {
      data.metrics[field] = match[1].trim();
    }
  });
  
  // Extract all dollar amounts
  const dollarPattern = /\$[\d,]+/g;
  const dollarMatches = htmlContent.match(dollarPattern);
  if (dollarMatches) {
    data.prices = [...new Set(dollarMatches)]; // Remove duplicates
  }
  
  // Extract specific data points
  const specificPatterns = [
    { pattern: /data-sort="cost_for_nomad_in_usd"[^>]*>([^<]*)/gi, field: 'nomad_cost' },
    { pattern: /data-sort="local_cost_in_usd"[^>]*>([^<]*)/gi, field: 'local_cost' },
    { pattern: /data-sort="apartment_cost_in_usd"[^>]*>([^<]*)/gi, field: 'apartment_cost' },
    { pattern: /data-sort="hotel_price_in_usd"[^>]*>([^<]*)/gi, field: 'hotel_price' }
  ];
  
  specificPatterns.forEach(({ pattern, field }) => {
    const match = pattern.exec(htmlContent);
    if (match && match[1].trim()) {
      data.rawData[field] = match[1].trim();
    }
  });
  
  // Look for Bangkok-specific mentions
  const bangkokMentions = (htmlContent.match(/bangkok/gi) || []).length;
  data.rawData.bangkok_mentions = bangkokMentions;
  
  return data;
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

scrapeBangkok().catch(console.error);
