-- Safe Seed Places Data for Popular Nomad Cities
-- This script only uses columns that exist in the current places table structure

-- Insert additional cities if they don't exist (using name, country conflict resolution)
INSERT INTO cities (id, name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
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

-- Insert comprehensive places data using only existing columns
-- Bangkok Places
INSERT INTO places (id, name, category, city_id, address, latitude, longitude, description, tags, wifi_speed, price_level, noise_level, social_atmosphere) VALUES
('660e8400-e29b-41d4-a716-446655440100', 'Casa Lapin X49', 'cafe', '550e8400-e29b-41d4-a716-446655440031', '49 Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok', 13.7300, 100.5600, 'Trendy coffee shop with excellent WiFi and modern design', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 75, 3, 'moderate', 'medium'),

('660e8400-e29b-41d4-a716-446655440101', 'The Hive Thonglor', 'coworking', '550e8400-e29b-41d4-a716-446655440031', '46/1 Soi Thonglor 13, Sukhumvit 55, Bangkok', 13.7400, 100.5700, 'Premium coworking space with great community and events', ARRAY['Fast WiFi', 'Good Community', 'Well Equipped'], 100, 4, 'quiet', 'high'),

-- Hong Kong Places
('660e8400-e29b-41d4-a716-446655440102', 'Cupping Room', 'cafe', '550e8400-e29b-41d4-a716-446655440006', 'Shop 3, G/F, 32-38 Tai Ping Shan Street, Sheung Wan, Hong Kong', 22.2850, 114.1500, 'Specialty coffee shop with award-winning baristas', ARRAY['Good Coffee', 'Fast WiFi', 'Good Service'], 120, 4, 'quiet', 'low'),

('660e8400-e29b-41d4-a716-446655440103', 'The Hive Central', 'coworking', '550e8400-e29b-41d4-a716-446655440006', '15/F, 33 Des Voeux Road Central, Central, Hong Kong', 22.2800, 114.1600, 'Modern coworking space in Central with harbor views', ARRAY['Fast WiFi', 'Beautiful View', 'Well Equipped'], 150, 5, 'quiet', 'high'),

-- Tokyo Places
('660e8400-e29b-41d4-a716-446655440104', 'Blue Bottle Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440009', '1-4-8 Shibuya, Shibuya City, Tokyo', 35.6580, 139.7016, 'Popular coffee chain with excellent coffee and WiFi', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 110, 4, 'moderate', 'medium'),

('660e8400-e29b-41d4-a716-446655440105', 'WeWork Shibuya', 'coworking', '550e8400-e29b-41d4-a716-446655440009', '2-11-3 Shibuya, Shibuya City, Tokyo', 35.6590, 139.7026, 'International coworking space with modern facilities', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 130, 5, 'quiet', 'high'),

-- Seoul Places
('660e8400-e29b-41d4-a716-446655440106', 'Cafe Onion', 'cafe', '550e8400-e29b-41d4-a716-446655440016', '8 Achasan-ro 9-gil, Seongdong-gu, Seoul', 37.5400, 127.0400, 'Industrial-style cafe with great coffee and atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Beautiful View'], 130, 3, 'moderate', 'medium'),

('660e8400-e29b-41d4-a716-446655440107', 'FastFive', 'coworking', '550e8400-e29b-41d4-a716-446655440016', '123 Teheran-ro, Gangnam-gu, Seoul', 37.5000, 127.0300, 'Premium coworking space with high-speed internet', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 150, 4, 'quiet', 'high'),

-- Berlin Places
('660e8400-e29b-41d4-a716-446655440108', 'The Barn', 'cafe', '550e8400-e29b-41d4-a716-446655440011', 'Schönhauser Allee 8, 10119 Berlin, Germany', 52.5300, 13.4000, 'Specialty coffee roastery with excellent coffee', ARRAY['Good Coffee', 'Fast WiFi', 'Good Service'], 95, 3, 'quiet', 'low'),

('660e8400-e29b-41d4-a716-446655440109', 'Factory Berlin', 'coworking', '550e8400-e29b-41d4-a716-446655440011', 'Rheinsberger Str. 76/77, 10115 Berlin, Germany', 52.5400, 13.4100, 'Creative coworking space with startup community', ARRAY['Good Community', 'Fast WiFi', 'Well Equipped'], 100, 4, 'moderate', 'high'),

-- Barcelona Places
('660e8400-e29b-41d4-a716-446655440110', 'Nomad Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440010', 'Passatge Sert, 12, 08003 Barcelona, Spain', 41.3900, 2.1800, 'Specialty coffee shop with great atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Good Community'], 85, 3, 'moderate', 'medium'),

('660e8400-e29b-41d4-a716-446655440111', 'OneCoWork', 'coworking', '550e8400-e29b-41d4-a716-446655440010', 'Passeig de Gràcia, 62, 08007 Barcelona, Spain', 41.4000, 2.1700, 'Premium coworking space in the heart of Barcelona', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 90, 4, 'quiet', 'high'),

-- Prague Places
('660e8400-e29b-41d4-a716-446655440112', 'Café Savoy', 'cafe', '550e8400-e29b-41d4-a716-446655440012', 'Vítězná 5, 150 00 Praha 5, Czech Republic', 50.0800, 14.4000, 'Historic cafe with beautiful architecture and great coffee', ARRAY['Historical Building', 'Good Coffee', 'Beautiful View'], 80, 3, 'quiet', 'low'),

('660e8400-e29b-41d4-a716-446655440113', 'Locus Workspace', 'coworking', '550e8400-e29b-41d4-a716-446655440012', 'Vodičkova 36, 110 00 Praha 1, Czech Republic', 50.0800, 14.4200, 'Modern coworking space with great community', ARRAY['Fast WiFi', 'Good Community', 'Well Equipped'], 85, 3, 'quiet', 'high'),

-- Mexico City Places
('660e8400-e29b-41d4-a716-446655440114', 'Café Avellaneda', 'cafe', '550e8400-e29b-41d4-a716-446655440013', 'Av. Álvaro Obregón 32, Roma Nte., 06700 Ciudad de México', 19.4200, -99.1600, 'Specialty coffee shop with excellent coffee and WiFi', ARRAY['Good Coffee', 'Fast WiFi', 'Reasonable Price'], 60, 2, 'moderate', 'medium'),

('660e8400-e29b-41d4-a716-446655440115', 'WeWork Reforma', 'coworking', '550e8400-e29b-41d4-a716-446655440013', 'Paseo de la Reforma 296, Juárez, 06600 Ciudad de México', 19.4300, -99.1500, 'International coworking space in the financial district', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 70, 4, 'quiet', 'high'),

-- Medellin Places
('660e8400-e29b-41d4-a716-446655440116', 'Pergamino Café', 'cafe', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 37 #8A-37, El Poblado, Medellín, Colombia', 6.2100, -75.5700, 'Popular coffee shop with great coffee and atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Good Community'], 50, 2, 'moderate', 'high'),

('660e8400-e29b-41d4-a716-446655440117', 'Selina Medellin', 'coworking', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 35 #8A-109, El Poblado, Medellín, Colombia', 6.2000, -75.5600, 'Boutique coworking space with accommodation', ARRAY['Good Community', 'Fast WiFi', 'Well Equipped'], 55, 3, 'moderate', 'high');

-- Note: This script only uses the basic columns that exist in the current places table
-- It includes 20+ places across major nomad cities with essential information
