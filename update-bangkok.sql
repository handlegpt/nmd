-- Update Bangkok city data with scraped and cleaned data from Nomads.com
-- Generated on: 2025-09-10

-- First, check if Bangkok exists and get its ID
DO $$
DECLARE
    bangkok_id UUID;
BEGIN
    -- Try to find existing Bangkok record
    SELECT id INTO bangkok_id 
    FROM cities 
    WHERE name = 'Bangkok' AND country = 'Thailand';
    
    IF bangkok_id IS NOT NULL THEN
        -- Update existing record
        UPDATE cities SET
            -- Cost of living data
            cost_of_living = 1124,
            cost_of_living_local = 686,
            cost_of_living_expat = 2049,
            
            -- Accommodation costs
            apartment_cost_1br_center = 692,
            apartment_cost_1br_outside = 532,
            hotel_price_night = 60,
            airbnb_price_night = 86,
            
            -- Food costs
            meal_cheap = 7,
            meal_midrange = 17,
            meal_expensive = 69,
            
            -- Transportation costs
            public_transport_cost = 4,
            taxi_cost_km = 13,
            
            -- Utilities
            internet_cost_monthly = 23,
            utilities_cost_monthly = 110,
            
            -- City metrics
            wifi_speed = 45,
            air_quality_score = 3.2,
            safety_score = 3.8,
            nightlife_score = 4.5,
            coworking_spaces_count = 25,
            english_level = 3.2,
            traffic_score = 2.1,
            weather_score = 4.0,
            
            -- Visa information
            visa_days = 30,
            visa_type = 'Tourist Visa',
            visa_extension_possible = true,
            digital_nomad_visa = false,
            work_permit_required = true,
            
            -- Weather data
            temperature_avg = 28,
            humidity_avg = 75,
            rainy_season = 'May-October',
            best_months = 'November-April',
            
            -- Metadata
            data_source = 'Nomads.com',
            last_updated = NOW(),
            data_quality = 'scraped_and_cleaned'
        WHERE id = bangkok_id;
        
        RAISE NOTICE 'Updated existing Bangkok record with ID: %', bangkok_id;
        
    ELSE
        -- Create new record
        INSERT INTO cities (
            id,
            name,
            country,
            country_code,
            latitude,
            longitude,
            timezone,
            currency,
            language,
            population,
            
            -- Cost of living data
            cost_of_living,
            cost_of_living_local,
            cost_of_living_expat,
            
            -- Accommodation costs
            apartment_cost_1br_center,
            apartment_cost_1br_outside,
            hotel_price_night,
            airbnb_price_night,
            
            -- Food costs
            meal_cheap,
            meal_midrange,
            meal_expensive,
            
            -- Transportation costs
            public_transport_cost,
            taxi_cost_km,
            
            -- Utilities
            internet_cost_monthly,
            utilities_cost_monthly,
            
            -- City metrics
            wifi_speed,
            air_quality_score,
            safety_score,
            nightlife_score,
            coworking_spaces_count,
            english_level,
            traffic_score,
            weather_score,
            
            -- Visa information
            visa_days,
            visa_type,
            visa_extension_possible,
            digital_nomad_visa,
            work_permit_required,
            
            -- Weather data
            temperature_avg,
            humidity_avg,
            rainy_season,
            best_months,
            
            -- Metadata
            data_source,
            last_updated,
            data_quality,
            avg_overall_rating,
            vote_count,
            created_at
        ) VALUES (
            gen_random_uuid(),
            'Bangkok',
            'Thailand',
            'TH',
            13.7563,
            100.5018,
            'Asia/Bangkok',
            'THB',
            'Thai',
            10539000,
            
            -- Cost of living data
            1124,
            686,
            2049,
            
            -- Accommodation costs
            692,
            532,
            60,
            86,
            
            -- Food costs
            7,
            17,
            69,
            
            -- Transportation costs
            4,
            13,
            
            -- Utilities
            23,
            110,
            
            -- City metrics
            45,
            3.2,
            3.8,
            4.5,
            25,
            3.2,
            2.1,
            4.0,
            
            -- Visa information
            30,
            'Tourist Visa',
            true,
            false,
            true,
            
            -- Weather data
            28,
            75,
            'May-October',
            'November-April',
            
            -- Metadata
            'Nomads.com',
            NOW(),
            'scraped_and_cleaned',
            4.2,
            0,
            NOW()
        );
        
        RAISE NOTICE 'Created new Bangkok record';
    END IF;
END $$;

-- Verify the update
SELECT 
    name,
    country,
    cost_of_living,
    wifi_speed,
    safety_score,
    visa_days,
    temperature_avg,
    data_source,
    last_updated
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';
