-- Update Bangkok city data with scraped and cleaned data from Nomads.com
-- Simplified version that only updates existing fields
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
        -- Update existing record with only the fields that exist in our table
        UPDATE cities SET
            -- Basic cost of living data (this field exists)
            cost_of_living = 1124,
            
            -- WiFi speed (this field exists)
            wifi_speed = 45,
            
            -- Visa information (these fields exist)
            visa_days = 30,
            visa_type = 'Tourist Visa',
            
            -- Update timestamp
            updated_at = NOW()
        WHERE id = bangkok_id;
        
        RAISE NOTICE 'Updated existing Bangkok record with ID: %', bangkok_id;
        
    ELSE
        -- Create new record with only the fields that exist in our table
        INSERT INTO cities (
            id,
            name,
            country,
            country_code,
            timezone,
            latitude,
            longitude,
            visa_days,
            visa_type,
            cost_of_living,
            wifi_speed,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Bangkok',
            'Thailand',
            'TH',
            'Asia/Bangkok',
            13.7563,
            100.5018,
            30,
            'Tourist Visa',
            1124,
            45,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new Bangkok record';
    END IF;
END $$;

-- Verify the update
SELECT 
    name,
    country,
    country_code,
    cost_of_living,
    wifi_speed,
    visa_days,
    visa_type,
    timezone,
    latitude,
    longitude,
    created_at,
    updated_at
FROM cities 
WHERE name = 'Bangkok' AND country = 'Thailand';
