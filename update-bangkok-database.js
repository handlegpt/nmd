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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBangkokDatabase() {
  console.log('🚀 Updating Bangkok data in database...');
  
  try {
    // Load cleaned data
    const cleanedData = JSON.parse(fs.readFileSync('scraped-data/bangkok-cleaned.json', 'utf8'));
    
    console.log('📊 Loaded cleaned data:');
    console.log(`- City: ${cleanedData.name}, ${cleanedData.country}`);
    console.log(`- Cost of living fields: ${Object.keys(cleanedData.costOfLiving).length}`);
    console.log(`- Metrics: ${Object.keys(cleanedData.metrics).length}`);
    
    // First, check if Bangkok exists in the database
    const { data: existingCity, error: fetchError } = await supabase
      .from('cities')
      .select('*')
      .eq('name', 'Bangkok')
      .eq('country', 'Thailand')
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching existing city:', fetchError);
      return;
    }
    
    // Prepare the update data
    const updateData = {
      name: cleanedData.name,
      country: cleanedData.country,
      country_code: cleanedData.country_code,
      
      // Cost of living data
      cost_of_living: cleanedData.costOfLiving.monthly_budget_nomad,
      cost_of_living_local: cleanedData.costOfLiving.monthly_budget_local,
      cost_of_living_expat: cleanedData.costOfLiving.monthly_budget_expat,
      
      // Accommodation costs
      apartment_cost_1br_center: cleanedData.costOfLiving.apartment_1br_center,
      apartment_cost_1br_outside: cleanedData.costOfLiving.apartment_1br_outside,
      hotel_price_night: cleanedData.costOfLiving.hotel_night,
      airbnb_price_night: cleanedData.costOfLiving.airbnb_night,
      
      // Food costs
      meal_cheap: cleanedData.costOfLiving.meal_cheap,
      meal_midrange: cleanedData.costOfLiving.meal_midrange,
      meal_expensive: cleanedData.costOfLiving.meal_expensive,
      
      // Transportation costs
      public_transport_cost: cleanedData.costOfLiving.public_transport,
      taxi_cost_km: cleanedData.costOfLiving.taxi_km,
      
      // Utilities
      internet_cost_monthly: cleanedData.costOfLiving.internet_monthly,
      utilities_cost_monthly: cleanedData.costOfLiving.utilities_monthly,
      
      // City metrics
      wifi_speed: cleanedData.metrics.wifi_speed,
      air_quality_score: cleanedData.metrics.air_quality,
      safety_score: cleanedData.metrics.safety_score,
      nightlife_score: cleanedData.metrics.nightlife_score,
      coworking_spaces_count: cleanedData.metrics.coworking_spaces,
      english_level: cleanedData.metrics.english_level,
      traffic_score: cleanedData.metrics.traffic_score,
      weather_score: cleanedData.metrics.weather_score,
      
      // Visa information
      visa_days: cleanedData.visa.visa_free_days,
      visa_type: cleanedData.visa.visa_type,
      visa_extension_possible: cleanedData.visa.extension_possible,
      digital_nomad_visa: cleanedData.visa.digital_nomad_visa,
      work_permit_required: cleanedData.visa.work_permit_required,
      
      // Weather data
      temperature_avg: cleanedData.weather.temperature_avg,
      humidity_avg: cleanedData.weather.humidity_avg,
      rainy_season: cleanedData.weather.rainy_season,
      best_months: cleanedData.weather.best_months,
      
      // Metadata
      data_source: 'Nomads.com',
      last_updated: new Date().toISOString(),
      data_quality: 'scraped_and_cleaned'
    };
    
    if (existingCity) {
      // Update existing city
      console.log('🔄 Updating existing Bangkok record...');
      
      const { data, error } = await supabase
        .from('cities')
        .update(updateData)
        .eq('id', existingCity.id)
        .select();
      
      if (error) {
        console.error('❌ Error updating city:', error);
        return;
      }
      
      console.log('✅ Successfully updated Bangkok data');
      console.log(`📊 Updated city ID: ${data[0].id}`);
      
    } else {
      // Create new city record
      console.log('🆕 Creating new Bangkok record...');
      
      // Add required fields for new record
      updateData.id = `bangkok-${Date.now()}`;
      updateData.latitude = 13.7563; // Bangkok coordinates
      updateData.longitude = 100.5018;
      updateData.timezone = 'Asia/Bangkok';
      updateData.currency = 'THB';
      updateData.language = 'Thai';
      updateData.population = 10539000; // Bangkok population
      updateData.avg_overall_rating = 4.2; // Default rating
      updateData.vote_count = 0;
      updateData.created_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('cities')
        .insert([updateData])
        .select();
      
      if (error) {
        console.error('❌ Error creating city:', error);
        return;
      }
      
      console.log('✅ Successfully created Bangkok data');
      console.log(`📊 Created city ID: ${data[0].id}`);
    }
    
    // Display updated data summary
    console.log('\n📊 Updated Data Summary:');
    console.log(`- Monthly budget (nomad): $${updateData.cost_of_living}`);
    console.log(`- Monthly budget (local): $${updateData.cost_of_living_local}`);
    console.log(`- Monthly budget (expat): $${updateData.cost_of_living_expat}`);
    console.log(`- 1BR apartment (center): $${updateData.apartment_cost_1br_center}`);
    console.log(`- WiFi speed: ${updateData.wifi_speed} Mbps`);
    console.log(`- Safety score: ${updateData.safety_score}/5`);
    console.log(`- Visa days: ${updateData.visa_days}`);
    console.log(`- Temperature avg: ${updateData.temperature_avg}°C`);
    
    console.log('\n🎉 Bangkok data update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
  }
}

updateBangkokDatabase().catch(console.error);
