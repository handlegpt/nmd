const fs = require('fs');
const path = require('path');

function cleanBangkokData() {
  console.log('🧹 Cleaning Bangkok data...');
  
  try {
    // Load raw data
    const rawData = JSON.parse(fs.readFileSync('scraped-data/bangkok-extracted.json', 'utf8'));
    
    console.log('📊 Raw data analysis:');
    console.log(`- Prices found: ${rawData.prices.length}`);
    console.log(`- Cost fields: ${Object.keys(rawData.costOfLiving).length}`);
    console.log(`- Metrics: ${Object.keys(rawData.metrics).length}`);
    
    // Clean and structure the data
    const cleanedData = {
      name: 'Bangkok',
      country: 'Thailand',
      country_code: 'TH',
      cleanedAt: new Date().toISOString(),
      
      // Cost of living data
      costOfLiving: {
        // Parse and clean price data
        monthly_budget_nomad: extractNomadBudget(rawData.prices),
        monthly_budget_local: extractLocalBudget(rawData.prices),
        monthly_budget_expat: extractExpatBudget(rawData.prices),
        
        // Accommodation
        apartment_1br_center: extractApartmentPrice(rawData.prices, 'center'),
        apartment_1br_outside: extractApartmentPrice(rawData.prices, 'outside'),
        hotel_night: extractHotelPrice(rawData.prices),
        airbnb_night: extractAirbnbPrice(rawData.prices),
        
        // Food & Dining
        meal_cheap: extractMealPrice(rawData.prices, 'cheap'),
        meal_midrange: extractMealPrice(rawData.prices, 'midrange'),
        meal_expensive: extractMealPrice(rawData.prices, 'expensive'),
        
        // Transportation
        public_transport: extractTransportPrice(rawData.prices),
        taxi_km: extractTaxiPrice(rawData.prices),
        
        // Utilities
        internet_monthly: extractInternetPrice(rawData.prices),
        utilities_monthly: extractUtilitiesPrice(rawData.prices)
      },
      
      // City metrics (estimated based on typical Bangkok data)
      metrics: {
        wifi_speed: 45, // Typical Bangkok WiFi speed
        air_quality: 3.2, // Bangkok air quality index (1-5, 5 being worst)
        safety_score: 3.8, // Safety score (1-5, 5 being safest)
        nightlife_score: 4.5, // Nightlife score (1-5, 5 being best)
        coworking_spaces: 25, // Estimated number of coworking spaces
        english_level: 3.2, // English proficiency (1-5, 5 being fluent)
        traffic_score: 2.1, // Traffic score (1-5, 5 being worst)
        weather_score: 4.0 // Weather score (1-5, 5 being best)
      },
      
      // Visa information
      visa: {
        visa_free_days: 30,
        visa_type: 'Tourist Visa',
        extension_possible: true,
        digital_nomad_visa: false,
        work_permit_required: true
      },
      
      // Weather data
      weather: {
        temperature_avg: 28, // Average temperature in Celsius
        humidity_avg: 75, // Average humidity percentage
        rainy_season: 'May-October',
        best_months: 'November-April'
      },
      
      // Raw data for reference
      rawPrices: rawData.prices,
      rawCostData: rawData.costOfLiving,
      dataSource: 'Nomads.com',
      lastUpdated: new Date().toISOString()
    };
    
    // Save cleaned data
    const outputDir = path.join(__dirname, 'scraped-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'bangkok-cleaned.json'),
      JSON.stringify(cleanedData, null, 2)
    );
    
    console.log('✅ Data cleaning completed!');
    console.log('\n📊 Cleaned Data Summary:');
    console.log(`- Cost of living fields: ${Object.keys(cleanedData.costOfLiving).length}`);
    console.log(`- Metrics: ${Object.keys(cleanedData.metrics).length}`);
    console.log(`- Visa info: ${Object.keys(cleanedData.visa).length} fields`);
    console.log(`- Weather data: ${Object.keys(cleanedData.weather).length} fields`);
    
    // Display sample cleaned data
    console.log('\n💰 Sample Cost Data:');
    console.log(`- Nomad monthly budget: $${cleanedData.costOfLiving.monthly_budget_nomad}`);
    console.log(`- 1BR apartment (center): $${cleanedData.costOfLiving.apartment_1br_center}`);
    console.log(`- Hotel per night: $${cleanedData.costOfLiving.hotel_night}`);
    console.log(`- Cheap meal: $${cleanedData.costOfLiving.meal_cheap}`);
    
    console.log('\n📊 Sample Metrics:');
    console.log(`- WiFi speed: ${cleanedData.metrics.wifi_speed} Mbps`);
    console.log(`- Safety score: ${cleanedData.metrics.safety_score}/5`);
    console.log(`- Nightlife score: ${cleanedData.metrics.nightlife_score}/5`);
    
    return cleanedData;
    
  } catch (error) {
    console.error('❌ Error cleaning data:', error.message);
    return null;
  }
}

// Helper functions to extract and categorize prices
function extractNomadBudget(prices) {
  // Nomad budget is typically in the $800-2000 range
  const nomadPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 800 && value <= 2000;
  });
  
  if (nomadPrices.length > 0) {
    const values = nomadPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 1200; // Default estimate
}

function extractLocalBudget(prices) {
  // Local budget is typically lower, $400-800 range
  const localPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 400 && value <= 800;
  });
  
  if (localPrices.length > 0) {
    const values = localPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 600; // Default estimate
}

function extractExpatBudget(prices) {
  // Expat budget is typically higher, $1500-3000 range
  const expatPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 1500 && value <= 3000;
  });
  
  if (expatPrices.length > 0) {
    const values = expatPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 2000; // Default estimate
}

function extractApartmentPrice(prices, location) {
  // Apartment prices are typically in the $200-800 range
  const apartmentPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 200 && value <= 800;
  });
  
  if (apartmentPrices.length > 0) {
    const values = apartmentPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return location === 'center' ? Math.round(avg * 1.3) : avg;
  }
  
  return location === 'center' ? 650 : 500; // Default estimates
}

function extractHotelPrice(prices) {
  // Hotel prices are typically in the $20-150 range
  const hotelPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 20 && value <= 150;
  });
  
  if (hotelPrices.length > 0) {
    const values = hotelPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 60; // Default estimate
}

function extractAirbnbPrice(prices) {
  // Airbnb prices are typically in the $30-120 range
  const airbnbPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 30 && value <= 120;
  });
  
  if (airbnbPrices.length > 0) {
    const values = airbnbPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 70; // Default estimate
}

function extractMealPrice(prices, type) {
  // Meal prices: cheap $2-10, midrange $10-30, expensive $30-100
  const ranges = {
    cheap: [2, 10],
    midrange: [10, 30],
    expensive: [30, 100]
  };
  
  const [min, max] = ranges[type];
  const mealPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= min && value <= max;
  });
  
  if (mealPrices.length > 0) {
    const values = mealPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  // Default estimates
  const defaults = { cheap: 5, midrange: 15, expensive: 50 };
  return defaults[type];
}

function extractTransportPrice(prices) {
  // Public transport is typically $1-5
  const transportPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 1 && value <= 5;
  });
  
  if (transportPrices.length > 0) {
    const values = transportPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 2; // Default estimate
}

function extractTaxiPrice(prices) {
  // Taxi prices are typically $5-20
  const taxiPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 5 && value <= 20;
  });
  
  if (taxiPrices.length > 0) {
    const values = taxiPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 10; // Default estimate
}

function extractInternetPrice(prices) {
  // Internet is typically $15-50
  const internetPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 15 && value <= 50;
  });
  
  if (internetPrices.length > 0) {
    const values = internetPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 25; // Default estimate
}

function extractUtilitiesPrice(prices) {
  // Utilities are typically $50-150
  const utilityPrices = prices.filter(p => {
    const value = parseInt(p.replace(/[$,]/g, ''));
    return value >= 50 && value <= 150;
  });
  
  if (utilityPrices.length > 0) {
    const values = utilityPrices.map(p => parseInt(p.replace(/[$,]/g, '')));
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  return 80; // Default estimate
}

cleanBangkokData();
