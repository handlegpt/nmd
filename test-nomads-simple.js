const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testNomadsCom() {
  console.log('🚀 Testing Nomads.com accessibility...');
  
  try {
    // Test main page
    console.log('📡 Testing main page...');
    const mainPageData = await fetchPage('https://nomads.com');
    
    if (mainPageData) {
      console.log('✅ Successfully accessed Nomads.com');
      console.log(`📄 Page length: ${mainPageData.length} characters`);
      
      // Look for city-related content
      const cityPatterns = [
        /city/gi,
        /cost.*living/gi,
        /budget/gi,
        /accommodation/gi,
        /nomad/gi
      ];
      
      console.log('\n🔍 Searching for relevant content...');
      cityPatterns.forEach((pattern, index) => {
        const matches = mainPageData.match(pattern);
        if (matches) {
          console.log(`✅ Pattern ${index + 1} found ${matches.length} matches`);
        } else {
          console.log(`❌ Pattern ${index + 1} not found`);
        }
      });
      
      // Save content for analysis
      const outputDir = path.join(__dirname, 'scraped-data');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      
      fs.writeFileSync(
        path.join(outputDir, 'nomads-com-simple.html'), 
        mainPageData
      );
      
      console.log('💾 Saved content to scraped-data/nomads-com-simple.html');
      
      // Look for potential city URLs
      const urlPattern = /href=["']([^"']*\/city\/[^"']*)["']/gi;
      const cityUrls = [];
      let match;
      
      while ((match = urlPattern.exec(mainPageData)) !== null) {
        cityUrls.push(match[1]);
      }
      
      if (cityUrls.length > 0) {
        console.log(`\n🏙️ Found ${cityUrls.length} potential city URLs:`);
        cityUrls.slice(0, 5).forEach((url, index) => {
          console.log(`${index + 1}. ${url}`);
        });
        
        // Test first city URL
        if (cityUrls[0]) {
          console.log(`\n🔍 Testing city page: ${cityUrls[0]}`);
          const cityData = await fetchPage(cityUrls[0]);
          if (cityData) {
            console.log(`✅ City page accessible, length: ${cityData.length} characters`);
            
            // Look for cost data
            const costPatterns = [
              /\$[\d,]+/g,
              /€[\d,]+/g,
              /monthly.*budget/gi,
              /cost.*living/gi
            ];
            
            costPatterns.forEach((pattern, index) => {
              const matches = cityData.match(pattern);
              if (matches && matches.length > 0) {
                console.log(`💰 Cost pattern ${index + 1}: ${matches.slice(0, 3).join(', ')}`);
              }
            });
          }
        }
      }
      
    } else {
      console.log('❌ Failed to access Nomads.com');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const zlib = require('zlib');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
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
    
    request.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      request.destroy();
      resolve(null);
    });
  });
}

testNomadsCom().catch(console.error);
