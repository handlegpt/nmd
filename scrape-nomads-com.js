const puppeteer = require('puppeteer');
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

async function scrapeNomadsCom() {
  console.log('🚀 Starting Nomads.com scraping...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to Nomads.com
    console.log('📡 Navigating to Nomads.com...');
    await page.goto('https://nomads.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit for content to load
    await page.waitForTimeout(3000);
    
    // Check if we can access the site
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Try to find city data or cost of living information
    console.log('🔍 Looking for city data...');
    
    // Look for common selectors that might contain city data
    const citySelectors = [
      'a[href*="/city/"]',
      'a[href*="/cities/"]',
      '.city-link',
      '.city-item',
      '[data-city]',
      '.location-item'
    ];
    
    let cityLinks = [];
    for (const selector of citySelectors) {
      try {
        const links = await page.$$eval(selector, elements => 
          elements.map(el => ({
            text: el.textContent?.trim(),
            href: el.href,
            city: el.getAttribute('data-city') || el.textContent?.trim()
          }))
        );
        if (links.length > 0) {
          cityLinks = links;
          console.log(`✅ Found ${links.length} city links with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }
    
    // If no city links found, try to get page content
    if (cityLinks.length === 0) {
      console.log('🔍 No city links found, trying to get page content...');
      
      // Get all links on the page
      const allLinks = await page.$$eval('a', elements => 
        elements.map(el => ({
          text: el.textContent?.trim(),
          href: el.href
        })).filter(link => link.text && link.href)
      );
      
      console.log(`📊 Found ${allLinks.length} total links on the page`);
      
      // Look for links that might be related to cities
      const potentialCityLinks = allLinks.filter(link => 
        link.text && (
          link.text.toLowerCase().includes('city') ||
          link.text.toLowerCase().includes('cost') ||
          link.text.toLowerCase().includes('living') ||
          link.href.includes('/city/') ||
          link.href.includes('/cities/')
        )
      );
      
      console.log(`🏙️ Found ${potentialCityLinks.length} potential city-related links`);
      cityLinks = potentialCityLinks.slice(0, 10); // Take first 10
    }
    
    // Display found links
    if (cityLinks.length > 0) {
      console.log('\n📋 Found city links:');
      cityLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link.text} - ${link.href}`);
      });
    }
    
    // Try to scrape a specific city page if we found links
    if (cityLinks.length > 0) {
      const firstCityLink = cityLinks[0];
      console.log(`\n🔍 Testing city page: ${firstCityLink.text}`);
      
      try {
        await page.goto(firstCityLink.href, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        
        // Look for cost of living data
        const costSelectors = [
          '.cost-of-living',
          '.prices',
          '.expenses',
          '[data-cost]',
          '.budget',
          '.living-cost'
        ];
        
        let costData = null;
        for (const selector of costSelectors) {
          try {
            const elements = await page.$(selector);
            if (elements) {
              costData = await page.$eval(selector, el => el.textContent?.trim());
              console.log(`✅ Found cost data with selector: ${selector}`);
              console.log(`💰 Cost data: ${costData}`);
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (!costData) {
          console.log('❌ No cost of living data found on city page');
        }
        
      } catch (error) {
        console.log(`❌ Error accessing city page: ${error.message}`);
      }
    }
    
    // Get page content for analysis
    console.log('\n📊 Analyzing page structure...');
    const pageContent = await page.content();
    
    // Save page content for analysis
    const outputDir = path.join(__dirname, 'scraped-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'nomads-com-homepage.html'), 
      pageContent
    );
    
    console.log('💾 Saved page content to scraped-data/nomads-com-homepage.html');
    
    // Look for specific data patterns
    const dataPatterns = [
      /cost.*living/gi,
      /monthly.*budget/gi,
      /accommodation.*cost/gi,
      /food.*price/gi,
      /\$[\d,]+/g,
      /€[\d,]+/g
    ];
    
    console.log('\n🔍 Searching for data patterns...');
    dataPatterns.forEach((pattern, index) => {
      const matches = pageContent.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`✅ Pattern ${index + 1} found ${matches.length} matches:`, matches.slice(0, 5));
      } else {
        console.log(`❌ Pattern ${index + 1} not found`);
      }
    });
    
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require('puppeteer');
  scrapeNomadsCom().catch(console.error);
} catch (error) {
  console.log('❌ Puppeteer not installed. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run this script again.');
}
