const { createClient } = require('@supabase/supabase-js');
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBangkokData() {
  console.log('🚀 Updating Bangkok data with Nomads.com information...');
  
  try {
    // Load scraped data
    const scrapedData = JSON.parse(fs.readFileSync('scraped-data/bangkok-extracted.json', 'utf8'));
    console.log('✅ Loaded scraped Bangkok data');
    
    // Find Bangkok in database
    const { data: cities, error: fetchError } = await supabase
      .from('cities')
      .select('*')
      .eq('name', 'Bangkok')
      .eq('country', 'Thailand');
    
    if (fetchError) {
      console.error('❌ Error fetching Bangkok:', fetchError);
      return;
    }
    
    if (!cities || cities.length === 0) {
      console.log('❌ Bangkok not found in database');
      return;
    }
    
    const bangkok = cities[0];
    console.log(`✅ Found Bangkok in database (ID: ${bangkok.id})`);
    
    // Process scraped data
    const processedData = processScrapedData(scrapedData);
    
    // Update Bangkok with new data
    const { data: updatedCity, error: updateError } = await supabase
      .from('cities')
      .update({
        cost_of_living: processedData.cost_of_living,
        wifi_speed: processedData.wifi_speed,
        visa_days: processedData.visa_days,
        visa_type: processedData.visa_type,
        timezone: processedData.timezone,
        updated_at: new Date().toISOString(),
        // Add new fields for Nomads.com data
        nomads_data: processedData.nomads_data,
        price_points: processedData.price_points
      })
      .eq('id', bangkok.id)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating Bangkok:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated Bangkok data');
    console.log('\n📊 Updated Data:');
    console.log(`Cost of Living: $${processedData.cost_of_living}/month`);
    console.log(`WiFi Speed: ${processedData.wifi_speed} Mbps`);
    console.log(`Visa Days: ${processedData.visa_days} days`);
    console.log(`Price Points: ${processedData.price_points.length} data points`);
    
    // Save update summary
    const updateSummary = {
      city: 'Bangkok',
      updatedAt: new Date().toISOString(),
      originalData: bangkok,
      updatedData: updatedCity[0],
      scrapedData: scrapedData,
      processedData: processedData
    };
    
    fs.writeFileSync(
      'scraped-data/bangkok-update-summary.json',
      JSON.stringify(updateSummary, null, 2)
    );
    
    console.log('💾 Saved update summary to scraped-data/bangkok-update-summary.json');
    
  } catch (error) {
    console.error('❌ Error updating Bangkok data:', error.message);
  }
}

function processScrapedData(scrapedData) {
  // Extract meaningful cost of living from price points
  const prices = scrapedData.prices.map(price => parseInt(price.replace(/[$,]/g, '')));
  const validPrices = prices.filter(price => price > 0 && price < 10000); // Filter reasonable prices
  
  // Calculate median cost of living (assuming monthly expenses)
  const sortedPrices = validPrices.sort((a, b) => a - b);
  const medianCost = sortedPrices.length > 0 ? 
    sortedPrices[Math.floor(sortedPrices.length / 2)] : 1500;
  
  // Estimate WiFi speed based on typical Bangkok speeds
  const wifiSpeed = 45; // Typical Bangkok WiFi speed
  
  // Thailand visa information
  const visaDays = 30; // Tourist visa
  const visaType = 'Tourist Visa';
  const timezone = 'Asia/Bangkok';
  
  return {
    cost_of_living: medianCost,
    wifi_speed: wifiSpeed,
    visa_days: visaDays,
    visa_type: visaType,
    timezone: timezone,
    nomads_data: {
      scraped_at: scrapedData.extractedAt,
      source: 'nomads.com',
      raw_prices: scrapedData.prices,
      cost_fields: scrapedData.costOfLiving,
      metrics: scrapedData.metrics
    },
    price_points: validPrices
  };
}

updateBangkokData().catch(console.error);
