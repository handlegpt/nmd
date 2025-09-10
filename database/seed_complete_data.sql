-- Complete Seed Data Script
-- First creates all cities, then inserts places data

-- Step 1: Insert all required cities
INSERT INTO cities (id, name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
-- Core nomad cities (from original seed_places_data.sql)
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

-- Step 2: Insert places data using only basic columns
INSERT INTO places (id, name, category, city_id, address, latitude, longitude, description) VALUES
-- Bangkok Places
('660e8400-e29b-41d4-a716-446655440100', 'Casa Lapin X49', 'cafe', '550e8400-e29b-41d4-a716-446655440031', '49 Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok', 13.7300, 100.5600, 'Trendy coffee shop with excellent WiFi and modern design'),
('660e8400-e29b-41d4-a716-446655440101', 'The Hive Thonglor', 'coworking', '550e8400-e29b-41d4-a716-446655440031', '46/1 Soi Thonglor 13, Sukhumvit 55, Bangkok', 13.7400, 100.5700, 'Premium coworking space with great community and events'),

-- Hong Kong Places
('660e8400-e29b-41d4-a716-446655440102', 'Cupping Room', 'cafe', '550e8400-e29b-41d4-a716-446655440006', 'Shop 3, G/F, 32-38 Tai Ping Shan Street, Sheung Wan, Hong Kong', 22.2850, 114.1500, 'Specialty coffee shop with award-winning baristas'),
('660e8400-e29b-41d4-a716-446655440103', 'The Hive Central', 'coworking', '550e8400-e29b-41d4-a716-446655440006', '15/F, 33 Des Voeux Road Central, Central, Hong Kong', 22.2800, 114.1600, 'Modern coworking space in Central with harbor views'),

-- Tokyo Places
('660e8400-e29b-41d4-a716-446655440104', 'Blue Bottle Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440009', '1-4-8 Shibuya, Shibuya City, Tokyo', 35.6580, 139.7016, 'Popular coffee chain with excellent coffee and WiFi'),
('660e8400-e29b-41d4-a716-446655440105', 'WeWork Shibuya', 'coworking', '550e8400-e29b-41d4-a716-446655440009', '2-11-3 Shibuya, Shibuya City, Tokyo', 35.6590, 139.7026, 'International coworking space with modern facilities'),

-- Seoul Places
('660e8400-e29b-41d4-a716-446655440106', 'Cafe Onion', 'cafe', '550e8400-e29b-41d4-a716-446655440016', '8 Achasan-ro 9-gil, Seongdong-gu, Seoul', 37.5400, 127.0400, 'Industrial-style cafe with great coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440107', 'FastFive', 'coworking', '550e8400-e29b-41d4-a716-446655440016', '123 Teheran-ro, Gangnam-gu, Seoul', 37.5000, 127.0300, 'Premium coworking space with high-speed internet'),

-- Berlin Places
('660e8400-e29b-41d4-a716-446655440108', 'The Barn', 'cafe', '550e8400-e29b-41d4-a716-446655440011', 'Schönhauser Allee 8, 10119 Berlin, Germany', 52.5300, 13.4000, 'Specialty coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440109', 'Factory Berlin', 'coworking', '550e8400-e29b-41d4-a716-446655440011', 'Rheinsberger Str. 76/77, 10115 Berlin, Germany', 52.5400, 13.4100, 'Creative coworking space with startup community'),

-- Barcelona Places
('660e8400-e29b-41d4-a716-446655440110', 'Nomad Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440010', 'Passatge Sert, 12, 08003 Barcelona, Spain', 41.3900, 2.1800, 'Specialty coffee shop with great atmosphere'),
('660e8400-e29b-41d4-a716-446655440111', 'OneCoWork', 'coworking', '550e8400-e29b-41d4-a716-446655440010', 'Passeig de Gràcia, 62, 08007 Barcelona, Spain', 41.4000, 2.1700, 'Premium coworking space in the heart of Barcelona'),

-- Prague Places
('660e8400-e29b-41d4-a716-446655440112', 'Café Savoy', 'cafe', '550e8400-e29b-41d4-a716-446655440012', 'Vítězná 5, 150 00 Praha 5, Czech Republic', 50.0800, 14.4000, 'Historic cafe with beautiful architecture and great coffee'),
('660e8400-e29b-41d4-a716-446655440113', 'Locus Workspace', 'coworking', '550e8400-e29b-41d4-a716-446655440012', 'Vodičkova 36, 110 00 Praha 1, Czech Republic', 50.0800, 14.4200, 'Modern coworking space with great community'),

-- Mexico City Places
('660e8400-e29b-41d4-a716-446655440114', 'Café Avellaneda', 'cafe', '550e8400-e29b-41d4-a716-446655440013', 'Av. Álvaro Obregón 32, Roma Nte., 06700 Ciudad de México', 19.4200, -99.1600, 'Specialty coffee shop with excellent coffee and WiFi'),
('660e8400-e29b-41d4-a716-446655440115', 'WeWork Reforma', 'coworking', '550e8400-e29b-41d4-a716-446655440013', 'Paseo de la Reforma 296, Juárez, 06700 Ciudad de México', 19.4300, -99.1500, 'International coworking space in the financial district'),

-- Medellin Places
('660e8400-e29b-41d4-a716-446655440116', 'Pergamino Café', 'cafe', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 37 #8A-37, El Poblado, Medellín, Colombia', 6.2100, -75.5700, 'Popular coffee shop with great coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440117', 'Selina Medellin', 'coworking', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 35 #8A-109, El Poblado, Medellín, Colombia', 6.2000, -75.5600, 'Boutique coworking space with accommodation'),

-- Chiang Mai Places
('660e8400-e29b-41d4-a716-446655440118', 'Ristr8to Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440001', '15/3 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7961, 98.9653, 'Award-winning specialty coffee shop with excellent WiFi'),
('660e8400-e29b-41d4-a716-446655440119', 'Punspace', 'coworking', '550e8400-e29b-41d4-a716-446655440001', '45/1 Huay Kaew Road, Suthep, Mueang Chiang Mai District', 18.7941, 98.9633, 'Popular coworking space with great community and events'),

-- Bali Places
('660e8400-e29b-41d4-a716-446655440120', 'Revolver Espresso', 'cafe', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Kayu Aya No.3, Seminyak, Kuta, Badung Regency', -8.6855, 115.1700, 'Popular coffee shop with excellent coffee and beach vibes'),
('660e8400-e29b-41d4-a716-446655440121', 'Canggu Hub', 'coworking', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Pantai Batu Bolong No.58, Canggu, Kuta Utara, Badung Regency', -8.6500, 115.1400, 'Modern coworking space near the beach with great community'),

-- Lisbon Places
('660e8400-e29b-41d4-a716-446655440122', 'Copenhagen Coffee Lab', 'cafe', '550e8400-e29b-41d4-a716-446655440003', 'R. Nova da Piedade 10, 1200-405 Lisboa, Portugal', 38.7223, -9.1393, 'Specialty coffee shop with Nordic design and excellent coffee'),
('660e8400-e29b-41d4-a716-446655440123', 'Second Home', 'coworking', '550e8400-e29b-41d4-a716-446655440003', 'R. da Boavista 84, 1200-068 Lisboa, Portugal', 38.7200, -9.1400, 'Creative coworking space with beautiful architecture'),

-- Porto Places
('660e8400-e29b-41d4-a716-446655440124', 'Café Majestic', 'cafe', '550e8400-e29b-41d4-a716-446655440004', 'R. de Santa Catarina 112, 4000-442 Porto, Portugal', 41.1579, -8.6291, 'Historic cafe with beautiful Art Nouveau architecture'),
('660e8400-e29b-41d4-a716-446655440125', 'Porto i/o', 'coworking', '550e8400-e29b-41d4-a716-446655440004', 'R. de Cedofeita 112, 4050-180 Porto, Portugal', 41.1500, -8.6200, 'Modern coworking space in the heart of Porto'),

-- Budapest Places
('660e8400-e29b-41d4-a716-446655440126', 'My Little Melbourne', 'cafe', '550e8400-e29b-41d4-a716-446655440005', 'Nagymező u. 30, 1065 Budapest, Hungary', 47.4979, 19.0402, 'Australian-style cafe with excellent coffee and brunch'),
('660e8400-e29b-41d4-a716-446655440127', 'Loffice', 'coworking', '550e8400-e29b-41d4-a716-446655440005', 'Károly krt. 12, 1052 Budapest, Hungary', 47.5000, 19.0500, 'Premium coworking space with great community'),

-- Ho Chi Minh City Places
('660e8400-e29b-41d4-a716-446655440128', 'The Workshop Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440007', '27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh, Vietnam', 10.8231, 106.6297, 'Specialty coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440129', 'Saigon Coworking', 'coworking', '550e8400-e29b-41d4-a716-446655440007', '126 Nguyễn Thị Minh Khai, Phường 6, Quận 3, Hồ Chí Minh, Vietnam', 10.8200, 106.6300, 'Modern coworking space in District 3'),

-- Osaka Places
('660e8400-e29b-41d4-a716-446655440130', 'Streamer Coffee Company', 'cafe', '550e8400-e29b-41d4-a716-446655440008', '1-20-28 Shinsaibashisuji, Chuo-ku, Osaka', 34.6937, 135.5023, 'Popular coffee chain with great latte art'),
('660e8400-e29b-41d4-a716-446655440131', 'Osaka Innovation Hub', 'coworking', '550e8400-e29b-41d4-a716-446655440008', '2-2-8 Nakanoshima, Kita-ku, Osaka', 34.6900, 135.5000, 'Innovation-focused coworking space'),

-- Taipei Places
('660e8400-e29b-41d4-a716-446655440132', 'Simple Kaffa', 'cafe', '550e8400-e29b-41d4-a716-446655440017', 'No. 1, Lane 177, Section 1, Dunhua S Rd, Da''an District, Taipei', 25.0330, 121.5654, 'World-class coffee shop with award-winning baristas'),
('660e8400-e29b-41d4-a716-446655440133', 'CLBC', 'coworking', '550e8400-e29b-41d4-a716-446655440017', 'No. 2, Lane 177, Section 1, Dunhua S Rd, Da''an District, Taipei', 25.0340, 121.5660, 'Premium coworking space with great community'),

-- Kuala Lumpur Places
('660e8400-e29b-41d4-a716-446655440134', 'VCR', 'cafe', '550e8400-e29b-41d4-a716-446655440018', '2, Jalan Galloway, Bukit Bintang, 50150 Kuala Lumpur', 3.1390, 101.6869, 'Specialty coffee shop with excellent coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440135', 'WORQ', 'coworking', '550e8400-e29b-41d4-a716-446655440018', 'Level 2, Menara UOA Bangsar, 5, Jalan Bangsar Utama 1, Bangsar, 59000 Kuala Lumpur', 3.1400, 101.6700, 'Modern coworking space with great facilities'),

-- Singapore Places
('660e8400-e29b-41d4-a716-446655440136', 'Common Man Coffee Roasters', 'cafe', '550e8400-e29b-41d4-a716-446655440019', '22 Martin Rd, Singapore 239058', 1.3521, 103.8198, 'Popular coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440137', 'The Working Capitol', 'coworking', '550e8400-e29b-41d4-a716-446655440019', '1 Keong Saik Rd, Singapore 089109', 1.3500, 103.8200, 'Premium coworking space in the heart of Singapore');

-- Note: This script creates 50 cities and 38 places across major nomad destinations
-- All cities are created first to avoid foreign key constraint violations
-- Places use only basic columns that exist in the current table structure
