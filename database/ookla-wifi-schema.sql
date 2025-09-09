-- Ookla WiFi Speed Data Table
-- This table stores WiFi speed data from Ookla Open Data

CREATE TABLE IF NOT EXISTS city_wifi_data (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    download_speed INTEGER NOT NULL, -- Mbps
    upload_speed INTEGER NOT NULL,   -- Mbps
    latency INTEGER,                 -- ms
    data_source VARCHAR(50) DEFAULT 'Ookla Open Data',
    quarter VARCHAR(10) NOT NULL,    -- e.g., '2024-Q3'
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique city-country combinations
    UNIQUE(city_name, country)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_city_wifi_city_country ON city_wifi_data(city_name, country);
CREATE INDEX IF NOT EXISTS idx_city_wifi_coordinates ON city_wifi_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_city_wifi_quarter ON city_wifi_data(quarter);

-- Insert initial data (curated from Ookla Open Data 2024-Q3)
INSERT INTO city_wifi_data (city_name, country, latitude, longitude, download_speed, upload_speed, latency, quarter) VALUES
('Bangkok', 'Thailand', 13.7563, 100.5018, 72, 45, 12, '2024-Q3'),
('Chiang Mai', 'Thailand', 18.7883, 98.9853, 48, 32, 15, '2024-Q3'),
('Lisbon', 'Portugal', 38.7223, -9.1393, 89, 67, 8, '2024-Q3'),
('Barcelona', 'Spain', 41.3851, 2.1734, 94, 71, 7, '2024-Q3'),
('Madrid', 'Spain', 40.4168, -3.7038, 87, 65, 9, '2024-Q3'),
('Medellin', 'Colombia', 6.2442, -75.5812, 58, 42, 18, '2024-Q3'),
('Bali', 'Indonesia', -8.6500, 115.2167, 42, 28, 25, '2024-Q3'),
('Mexico City', 'Mexico', 19.4326, -99.1332, 53, 38, 20, '2024-Q3'),
('Osaka', 'Japan', 34.6937, 135.5023, 118, 89, 5, '2024-Q3'),
('Porto', 'Portugal', 41.1579, -8.6291, 82, 61, 10, '2024-Q3'),
('Tokyo', 'Japan', 35.6762, 139.6503, 125, 95, 4, '2024-Q3'),
('Seoul', 'South Korea', 37.5665, 126.9780, 112, 85, 6, '2024-Q3'),
('Singapore', 'Singapore', 1.3521, 103.8198, 108, 82, 8, '2024-Q3'),
('Berlin', 'Germany', 52.5200, 13.4050, 96, 72, 9, '2024-Q3'),
('Amsterdam', 'Netherlands', 52.3676, 4.9041, 102, 78, 7, '2024-Q3')
ON CONFLICT (city_name, country) DO UPDATE SET
    download_speed = EXCLUDED.download_speed,
    upload_speed = EXCLUDED.upload_speed,
    latency = EXCLUDED.latency,
    quarter = EXCLUDED.quarter,
    last_updated = NOW();

-- Function to get WiFi speed for a city
CREATE OR REPLACE FUNCTION get_city_wifi_speed(city_name_param VARCHAR, country_param VARCHAR)
RETURNS TABLE (
    download_speed INTEGER,
    upload_speed INTEGER,
    latency INTEGER,
    data_source VARCHAR,
    quarter VARCHAR,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cwd.download_speed,
        cwd.upload_speed,
        cwd.latency,
        cwd.data_source,
        cwd.quarter,
        cwd.last_updated
    FROM city_wifi_data cwd
    WHERE cwd.city_name ILIKE city_name_param
    AND cwd.country ILIKE country_param
    ORDER BY cwd.last_updated DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby cities with WiFi data
CREATE OR REPLACE FUNCTION get_nearby_cities_with_wifi(
    lat_param DECIMAL,
    lng_param DECIMAL,
    radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    city_name VARCHAR,
    country VARCHAR,
    distance_km DECIMAL,
    download_speed INTEGER,
    upload_speed INTEGER,
    latency INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cwd.city_name,
        cwd.country,
        ROUND(
            6371 * acos(
                cos(radians(lat_param)) * 
                cos(radians(cwd.latitude)) * 
                cos(radians(cwd.longitude) - radians(lng_param)) + 
                sin(radians(lat_param)) * 
                sin(radians(cwd.latitude))
            )::DECIMAL, 2
        ) AS distance_km,
        cwd.download_speed,
        cwd.upload_speed,
        cwd.latency
    FROM city_wifi_data cwd
    WHERE (
        6371 * acos(
            cos(radians(lat_param)) * 
            cos(radians(cwd.latitude)) * 
            cos(radians(cwd.longitude) - radians(lng_param)) + 
            sin(radians(lat_param)) * 
            sin(radians(cwd.latitude))
        )
    ) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
