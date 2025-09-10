-- Verify Bangkok data after update
-- This script checks if the data was updated correctly

SELECT 
    'Bangkok Data Verification' as check_type,
    name,
    country,
    country_code,
    latitude,
    longitude,
    timezone,
    currency,
    language,
    population
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Cost of living verification
SELECT 
    'Cost of Living' as category,
    cost_of_living as nomad_budget,
    cost_of_living_local as local_budget,
    cost_of_living_expat as expat_budget,
    apartment_cost_1br_center,
    apartment_cost_1br_outside,
    hotel_price_night,
    airbnb_price_night
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Food costs verification
SELECT 
    'Food Costs' as category,
    meal_cheap,
    meal_midrange,
    meal_expensive
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Transportation costs verification
SELECT 
    'Transportation' as category,
    public_transport_cost,
    taxi_cost_km
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Utilities verification
SELECT 
    'Utilities' as category,
    internet_cost_monthly,
    utilities_cost_monthly
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- City metrics verification
SELECT 
    'City Metrics' as category,
    wifi_speed,
    air_quality_score,
    safety_score,
    nightlife_score,
    coworking_spaces_count,
    english_level,
    traffic_score,
    weather_score
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Visa information verification
SELECT 
    'Visa Information' as category,
    visa_days,
    visa_type,
    visa_extension_possible,
    digital_nomad_visa,
    work_permit_required
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Weather data verification
SELECT 
    'Weather Data' as category,
    temperature_avg,
    humidity_avg,
    rainy_season,
    best_months
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';

-- Metadata verification
SELECT 
    'Metadata' as category,
    data_source,
    data_quality,
    last_updated,
    avg_overall_rating,
    vote_count
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';
