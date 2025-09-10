-- Step 1: Create all cities first
-- Run this script first, then run step2_create_places.sql

INSERT INTO cities (id, name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
-- Core nomad cities
('550e8400-e29b-41d4-a716-446655440001', 'Chiang Mai', 'Thailand', 'TH', 'Asia/Bangkok', 18.7883, 98.9853, 30, 'Tourist Visa', 800, 85),
('550e8400-e29b-41d4-a716-446655440002', 'Bali', 'Indonesia', 'ID', 'Asia/Makassar', -8.3405, 115.0920, 30, 'Tourist Visa', 900, 75),
('550e8400-e29b-41d4-a716-446655440003', 'Lisbon', 'Portugal', 'PT', 'Europe/Lisbon', 38.7223, -9.1393, 90, 'Schengen Visa', 1200, 95),
('550e8400-e29b-41d4-a716-446655440004', 'Porto', 'Portugal', 'PT', 'Europe/Lisbon', 41.1579, -8.6291, 90, 'Schengen Visa', 1000, 90),
('550e8400-e29b-41d4-a716-446655440005', 'Budapest', 'Hungary', 'HU', 'Europe/Budapest', 47.4979, 19.0402, 90, 'Schengen Visa', 900, 80),
('550e8400-e29b-41d4-a716-446655440006', 'Hong Kong', 'Hong Kong', 'HK', 'Asia/Hong_Kong', 22.3193, 114.1694, 90, 'Tourist Visa', 2000, 120),
('550e8400-e29b-41d4-a716-446655440007', 'Ho Chi Minh City', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.8231, 106.6297, 30, 'Tourist Visa', 700, 70),
('550e8400-e29b-41d4-a716-446655440008', 'Osaka', 'Japan', 'JP', 'Asia/Tokyo', 34.6937, 135.5023, 90, 'Tourist Visa', 1800, 100),
('550e8400-e29b-41d4-a716-446655440009', 'Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.6762, 139.6503, 90, 'Tourist Visa', 2500, 110),
('550e8400-e29b-41d4-a716-446655440010', 'Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.3851, 2.1734, 90, 'Schengen Visa', 1400, 85),
('550e8400-e29b-41d4-a716-446655440011', 'Berlin', 'Germany', 'DE', 'Europe/Berlin', 52.5200, 13.4050, 90, 'Schengen Visa', 1300, 95),
('550e8400-e29b-41d4-a716-446655440012', 'Prague', 'Czech Republic', 'CZ', 'Europe/Prague', 50.0755, 14.4378, 90, 'Schengen Visa', 1000, 85),
('550e8400-e29b-41d4-a716-446655440013', 'Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4326, -99.1332, 180, 'Tourist Visa', 800, 60),
('550e8400-e29b-41d4-a716-446655440014', 'Medellin', 'Colombia', 'CO', 'America/Bogota', 6.2442, -75.5812, 90, 'Tourist Visa', 600, 50),
('550e8400-e29b-41d4-a716-446655440015', 'Buenos Aires', 'Argentina', 'AR', 'America/Argentina/Buenos_Aires', -34.6118, -58.3960, 90, 'Tourist Visa', 700, 65),
('550e8400-e29b-41d4-a716-446655440016', 'Seoul', 'South Korea', 'KR', 'Asia/Seoul', 37.5665, 126.9780, 90, 'Tourist Visa', 1500, 130),
('550e8400-e29b-41d4-a716-446655440017', 'Taipei', 'Taiwan', 'TW', 'Asia/Taipei', 25.0330, 121.5654, 90, 'Tourist Visa', 1200, 100),
('550e8400-e29b-41d4-a716-446655440018', 'Kuala Lumpur', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 3.1390, 101.6869, 90, 'Tourist Visa', 800, 80),
('550e8400-e29b-41d4-a716-446655440019', 'Singapore', 'Singapore', 'SG', 'Asia/Singapore', 1.3521, 103.8198, 90, 'Tourist Visa', 2500, 150),
('550e8400-e29b-41d4-a716-446655440020', 'Tbilisi', 'Georgia', 'GE', 'Asia/Tbilisi', 41.7151, 44.8271, 365, 'Tourist Visa', 600, 40),
('550e8400-e29b-41d4-a716-446655440021', 'Yerevan', 'Armenia', 'AM', 'Asia/Yerevan', 40.1792, 44.4991, 180, 'Tourist Visa', 500, 35),
('550e8400-e29b-41d4-a716-446655440022', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.0082, 28.9784, 90, 'Tourist Visa', 800, 70),
('550e8400-e29b-41d4-a716-446655440023', 'Cape Town', 'South Africa', 'ZA', 'Africa/Johannesburg', -33.9249, 18.4241, 90, 'Tourist Visa', 700, 60),
('550e8400-e29b-41d4-a716-446655440024', 'Marrakech', 'Morocco', 'MA', 'Africa/Casablanca', 31.6295, -7.9811, 90, 'Tourist Visa', 500, 45),
('550e8400-e29b-41d4-a716-446655440025', 'Lima', 'Peru', 'PE', 'America/Lima', -12.0464, -77.0428, 90, 'Tourist Visa', 600, 55),
('550e8400-e29b-41d4-a716-446655440026', 'Santiago', 'Chile', 'CL', 'America/Santiago', -33.4489, -70.6693, 90, 'Tourist Visa', 800, 65),
('550e8400-e29b-41d4-a716-446655440027', 'Montevideo', 'Uruguay', 'UY', 'America/Montevideo', -34.9011, -56.1645, 90, 'Tourist Visa', 900, 70),
('550e8400-e29b-41d4-a716-446655440028', 'Cusco', 'Peru', 'PE', 'America/Lima', -13.5319, -71.9675, 90, 'Tourist Visa', 500, 40),
('550e8400-e29b-41d4-a716-446655440029', 'Playa del Carmen', 'Mexico', 'MX', 'America/Cancun', 20.6296, -87.0739, 180, 'Tourist Visa', 700, 50),
('550e8400-e29b-41d4-a716-446655440030', 'San Jose', 'Costa Rica', 'CR', 'America/Costa_Rica', 9.9281, -84.0907, 90, 'Tourist Visa', 800, 60),

-- Additional cities for comprehensive coverage
('550e8400-e29b-41d4-a716-446655440031', 'Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.7563, 100.5018, 30, 'Tourist Visa', 1000, 80),
('550e8400-e29b-41d4-a716-446655440032', 'Phuket', 'Thailand', 'TH', 'Asia/Bangkok', 7.8804, 98.3923, 30, 'Tourist Visa', 900, 70),
('550e8400-e29b-41d4-a716-446655440033', 'Ubud', 'Indonesia', 'ID', 'Asia/Makassar', -8.5069, 115.2625, 30, 'Tourist Visa', 800, 65),
('550e8400-e29b-41d4-a716-446655440034', 'Canggu', 'Indonesia', 'ID', 'Asia/Makassar', -8.6500, 115.1400, 30, 'Tourist Visa', 1000, 75),
('550e8400-e29b-41d4-a716-446655440035', 'Madrid', 'Spain', 'ES', 'Europe/Madrid', 40.4168, -3.7038, 90, 'Schengen Visa', 1200, 85),
('550e8400-e29b-41d4-a716-446655440036', 'Valencia', 'Spain', 'ES', 'Europe/Madrid', 39.4699, -0.3763, 90, 'Schengen Visa', 1000, 80),
('550e8400-e29b-41d4-a716-446655440037', 'Vienna', 'Austria', 'AT', 'Europe/Vienna', 48.2082, 16.3738, 90, 'Schengen Visa', 1400, 90),
('550e8400-e29b-41d4-a716-446655440038', 'Amsterdam', 'Netherlands', 'NL', 'Europe/Amsterdam', 52.3676, 4.9041, 90, 'Schengen Visa', 1800, 100),
('550e8400-e29b-41d4-a716-446655440039', 'Dublin', 'Ireland', 'IE', 'Europe/Dublin', 53.3498, -6.2603, 90, 'EU Visa', 2000, 95),
('550e8400-e29b-41d4-a716-446655440040', 'Edinburgh', 'United Kingdom', 'GB', 'Europe/London', 55.9533, -3.1883, 90, 'UK Visa', 1800, 85),
('550e8400-e29b-41d4-a716-446655440041', 'Kyoto', 'Japan', 'JP', 'Asia/Tokyo', 35.0116, 135.7681, 90, 'Tourist Visa', 2000, 95),
('550e8400-e29b-41d4-a716-446655440042', 'Fukuoka', 'Japan', 'JP', 'Asia/Tokyo', 33.5904, 130.4017, 90, 'Tourist Visa', 1500, 90),
('550e8400-e29b-41d4-a716-446655440043', 'Busan', 'South Korea', 'KR', 'Asia/Seoul', 35.1796, 129.0756, 90, 'Tourist Visa', 1200, 110),
('550e8400-e29b-41d4-a716-446655440044', 'Da Nang', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 16.0544, 108.2022, 30, 'Tourist Visa', 600, 65),
('550e8400-e29b-41d4-a716-446655440045', 'Hanoi', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 21.0285, 105.8542, 30, 'Tourist Visa', 650, 60),
('550e8400-e29b-41d4-a716-446655440046', 'Penang', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 5.4164, 100.3327, 90, 'Tourist Visa', 700, 75),
('550e8400-e29b-41d4-a716-446655440047', 'Krabi', 'Thailand', 'TH', 'Asia/Bangkok', 8.0863, 98.9063, 30, 'Tourist Visa', 800, 60),
('550e8400-e29b-41d4-a716-446655440048', 'Koh Samui', 'Thailand', 'TH', 'Asia/Bangkok', 9.5018, 100.0000, 30, 'Tourist Visa', 900, 55),
('550e8400-e29b-41d4-a716-446655440049', 'Pattaya', 'Thailand', 'TH', 'Asia/Bangkok', 12.9236, 100.8825, 30, 'Tourist Visa', 700, 65),
('550e8400-e29b-41d4-a716-446655440050', 'Koh Phangan', 'Thailand', 'TH', 'Asia/Bangkok', 9.7500, 100.0333, 30, 'Tourist Visa', 600, 45)
ON CONFLICT (name, country) DO NOTHING;

-- Check how many cities were created
SELECT COUNT(*) as cities_created FROM cities;
