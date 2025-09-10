const fs = require('fs');
const path = require('path');

function extractNomadsData() {
  console.log('🔍 Extracting data from Nomads.com...');
  
  try {
    const htmlContent = fs.readFileSync('scraped-data/nomads-com-simple.html', 'utf8');
    
    // Extract city data from the HTML
    const cityData = [];
    
    // Look for city images and names
    const cityImagePattern = /<img[^>]*alt="([^"]*)"[^>]*data-src="[^"]*\/places\/([^"]*)"[^>]*>/gi;
    let match;
    
    while ((match = cityImagePattern.exec(htmlContent)) !== null) {
      const cityName = match[1];
      const imagePath = match[2];
      
      if (cityName && imagePath) {
        cityData.push({
          name: cityName,
          image: `https://nomads.com/assets/img/places/${imagePath}`,
          slug: imagePath.replace('.jpg', '').replace('.png', '')
        });
      }
    }
    
    console.log(`✅ Found ${cityData.length} cities with images`);
    
    // Look for cost of living data
    const costPattern = /data-sort="([^"]*_cost_in_usd)"[^>]*data-prefix="([^"]*)"[^>]*data-postfix="([^"]*)"[^>]*>([^<]*)</gi;
    const costFields = [];
    
    while ((match = costPattern.exec(htmlContent)) !== null) {
      costFields.push({
        field: match[1],
        prefix: match[2],
        postfix: match[3],
        label: match[4]
      });
    }
    
    console.log(`✅ Found ${costFields.length} cost of living fields`);
    
    // Look for city links
    const linkPattern = /href="([^"]*)"[^>]*>([^<]*<img[^>]*alt="([^"]*)"[^>]*>)/gi;
    const cityLinks = [];
    
    while ((match = linkPattern.exec(htmlContent)) !== null) {
      const href = match[1];
      const cityName = match[3];
      
      if (href && cityName && href.includes('/')) {
        cityLinks.push({
          name: cityName,
          url: href.startsWith('http') ? href : `https://nomads.com${href}`
        });
      }
    }
    
    console.log(`✅ Found ${cityLinks.length} city links`);
    
    // Look for specific city mentions
    const cityMentions = [];
    const cityNames = ['Bangkok', 'Chiang Mai', 'Bali', 'Canggu', 'Lisbon', 'Porto', 'Budapest', 'Ho Chi Minh', 'Hong Kong', 'Tokyo', 'Osaka'];
    
    cityNames.forEach(cityName => {
      const regex = new RegExp(cityName, 'gi');
      const matches = htmlContent.match(regex);
      if (matches) {
        cityMentions.push({
          name: cityName,
          mentions: matches.length
        });
      }
    });
    
    console.log(`✅ Found mentions for ${cityMentions.length} specific cities`);
    
    // Save extracted data
    const outputDir = path.join(__dirname, 'scraped-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const extractedData = {
      cities: cityData,
      costFields: costFields,
      cityLinks: cityLinks,
      cityMentions: cityMentions,
      extractedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'nomads-extracted-data.json'),
      JSON.stringify(extractedData, null, 2)
    );
    
    console.log('💾 Saved extracted data to scraped-data/nomads-extracted-data.json');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`Cities with images: ${cityData.length}`);
    console.log(`Cost of living fields: ${costFields.length}`);
    console.log(`City links: ${cityLinks.length}`);
    console.log(`Specific city mentions: ${cityMentions.length}`);
    
    // Show some examples
    if (cityData.length > 0) {
      console.log('\n🏙️ Sample cities:');
      cityData.slice(0, 5).forEach((city, index) => {
        console.log(`${index + 1}. ${city.name} (${city.slug})`);
      });
    }
    
    if (costFields.length > 0) {
      console.log('\n💰 Cost of living fields:');
      costFields.forEach((field, index) => {
        console.log(`${index + 1}. ${field.label} (${field.field})`);
      });
    }
    
    if (cityMentions.length > 0) {
      console.log('\n📍 City mentions:');
      cityMentions.forEach((city, index) => {
        console.log(`${index + 1}. ${city.name}: ${city.mentions} mentions`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
  }
}

extractNomadsData();
