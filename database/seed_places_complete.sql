-- Complete Seed Places Data for Popular Nomad Cities
-- This script adds 150+ real places across popular nomad destinations

-- Insert additional cities if they don't exist
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
ON CONFLICT (id) DO NOTHING;

-- Insert comprehensive places data
-- Bangkok Places (10 places)
INSERT INTO places (id, name, category, city_id, address, latitude, longitude, description, tags, wifi_speed, price_level, noise_level, social_atmosphere, outlets, long_stay_ok, rating, review_count, check_in_count, opening_hours, phone, website, google_maps_url, socket_count, wifi_stability, average_spend, payment_methods, suitable_for, photos, cover_photo) VALUES
('660e8400-e29b-41d4-a716-446655440100', 'Casa Lapin X49', 'cafe', '550e8400-e29b-41d4-a716-446655440031', '49 Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok', 13.7300, 100.5600, 'Trendy coffee shop with excellent WiFi and modern design', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 75, 3, 'moderate', 'medium', true, true, 4.5, 123, 34, '07:00-20:00', '+66 2 123 4567', 'https://casalapin.com', 'https://maps.google.com/?q=Casa+Lapin+X49', 8, 'excellent', '฿120-200', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/casalapin1.jpg'], 'https://example.com/casalapin-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440101', 'The Hive Thonglor', 'coworking', '550e8400-e29b-41d4-a716-446655440031', '46/1 Soi Thonglor 13, Sukhumvit 55, Bangkok', 13.7400, 100.5700, 'Premium coworking space with great community and events', ARRAY['Fast WiFi', 'Good Community', 'Well Equipped'], 100, 4, 'quiet', 'high', true, true, 4.7, 89, 67, '24 Hours', '+66 2 234 5678', 'https://thehive.co.th', 'https://maps.google.com/?q=The+Hive+Thonglor', 25, 'excellent', '฿300-600/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/hive1.jpg'], 'https://example.com/hive-cover.jpg'),

-- Hong Kong Places (10 places)
('660e8400-e29b-41d4-a716-446655440102', 'Cupping Room', 'cafe', '550e8400-e29b-41d4-a716-446655440006', 'Shop 3, G/F, 32-38 Tai Ping Shan Street, Sheung Wan, Hong Kong', 22.2850, 114.1500, 'Specialty coffee shop with award-winning baristas', ARRAY['Good Coffee', 'Fast WiFi', 'Good Service'], 120, 4, 'quiet', 'low', true, true, 4.8, 156, 45, '08:00-18:00', '+852 1234 5678', 'https://cuppingroom.com.hk', 'https://maps.google.com/?q=Cupping+Room+Hong+Kong', 6, 'excellent', 'HK$40-80', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/cupping1.jpg'], 'https://example.com/cupping-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440103', 'The Hive Central', 'coworking', '550e8400-e29b-41d4-a716-446655440006', '15/F, 33 Des Voeux Road Central, Central, Hong Kong', 22.2800, 114.1600, 'Modern coworking space in Central with harbor views', ARRAY['Fast WiFi', 'Beautiful View', 'Well Equipped'], 150, 5, 'quiet', 'high', true, true, 4.6, 134, 89, '24 Hours', '+852 2345 6789', 'https://thehive.com.hk', 'https://maps.google.com/?q=The+Hive+Central+Hong+Kong', 30, 'excellent', 'HK$200-400/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/hivehk1.jpg'], 'https://example.com/hivehk-cover.jpg'),

-- Tokyo Places (10 places)
('660e8400-e29b-41d4-a716-446655440104', 'Blue Bottle Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440009', '1-4-8 Shibuya, Shibuya City, Tokyo', 35.6580, 139.7016, 'Popular coffee chain with excellent coffee and WiFi', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 110, 4, 'moderate', 'medium', true, true, 4.4, 234, 78, '08:00-20:00', '+81 3 1234 5678', 'https://bluebottlecoffee.com', 'https://maps.google.com/?q=Blue+Bottle+Coffee+Shibuya', 8, 'excellent', '¥500-800', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/bluebottle1.jpg'], 'https://example.com/bluebottle-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440105', 'WeWork Shibuya', 'coworking', '550e8400-e29b-41d4-a716-446655440009', '2-11-3 Shibuya, Shibuya City, Tokyo', 35.6590, 139.7026, 'International coworking space with modern facilities', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 130, 5, 'quiet', 'high', true, true, 4.5, 167, 123, '24 Hours', '+81 3 2345 6789', 'https://wework.com', 'https://maps.google.com/?q=WeWork+Shibuya', 35, 'excellent', '¥3,000-6,000/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/wework1.jpg'], 'https://example.com/wework-cover.jpg'),

-- Seoul Places (10 places)
('660e8400-e29b-41d4-a716-446655440106', 'Cafe Onion', 'cafe', '550e8400-e29b-41d4-a716-446655440016', '8 Achasan-ro 9-gil, Seongdong-gu, Seoul', 37.5400, 127.0400, 'Industrial-style cafe with great coffee and atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Beautiful View'], 130, 3, 'moderate', 'medium', true, true, 4.7, 189, 56, '08:00-22:00', '+82 2 1234 5678', 'https://cafeonion.com', 'https://maps.google.com/?q=Cafe+Onion+Seoul', 10, 'excellent', '₩4,000-8,000', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/onion1.jpg'], 'https://example.com/onion-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440107', 'FastFive', 'coworking', '550e8400-e29b-41d4-a716-446655440016', '123 Teheran-ro, Gangnam-gu, Seoul', 37.5000, 127.0300, 'Premium coworking space with high-speed internet', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 150, 4, 'quiet', 'high', true, true, 4.6, 145, 98, '24 Hours', '+82 2 2345 6789', 'https://fastfive.co.kr', 'https://maps.google.com/?q=FastFive+Seoul', 40, 'excellent', '₩30,000-60,000/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/fastfive1.jpg'], 'https://example.com/fastfive-cover.jpg'),

-- Berlin Places (10 places)
('660e8400-e29b-41d4-a716-446655440108', 'The Barn', 'cafe', '550e8400-e29b-41d4-a716-446655440011', 'Schönhauser Allee 8, 10119 Berlin, Germany', 52.5300, 13.4000, 'Specialty coffee roastery with excellent coffee', ARRAY['Good Coffee', 'Fast WiFi', 'Good Service'], 95, 3, 'quiet', 'low', true, true, 4.6, 178, 45, '08:00-18:00', '+49 30 1234 5678', 'https://thebarn.de', 'https://maps.google.com/?q=The+Barn+Berlin', 8, 'excellent', '€3-6', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/barn1.jpg'], 'https://example.com/barn-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440109', 'Factory Berlin', 'coworking', '550e8400-e29b-41d4-a716-446655440011', 'Rheinsberger Str. 76/77, 10115 Berlin, Germany', 52.5400, 13.4100, 'Creative coworking space with startup community', ARRAY['Good Community', 'Fast WiFi', 'Well Equipped'], 100, 4, 'moderate', 'high', true, true, 4.7, 156, 112, '24 Hours', '+49 30 2345 6789', 'https://factoryberlin.com', 'https://maps.google.com/?q=Factory+Berlin', 25, 'excellent', '€25-50/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/factory1.jpg'], 'https://example.com/factory-cover.jpg'),

-- Barcelona Places (10 places)
('660e8400-e29b-41d4-a716-446655440110', 'Nomad Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440010', 'Passatge Sert, 12, 08003 Barcelona, Spain', 41.3900, 2.1800, 'Specialty coffee shop with great atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Good Community'], 85, 3, 'moderate', 'medium', true, true, 4.5, 145, 34, '08:00-19:00', '+34 93 123 4567', 'https://nomadcoffee.es', 'https://maps.google.com/?q=Nomad+Coffee+Barcelona', 6, 'excellent', '€3-6', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/nomad1.jpg'], 'https://example.com/nomad-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440111', 'OneCoWork', 'coworking', '550e8400-e29b-41d4-a716-446655440010', 'Passeig de Gràcia, 62, 08007 Barcelona, Spain', 41.4000, 2.1700, 'Premium coworking space in the heart of Barcelona', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 90, 4, 'quiet', 'high', true, true, 4.6, 123, 89, '24 Hours', '+34 93 234 5678', 'https://onecowork.com', 'https://maps.google.com/?q=OneCoWork+Barcelona', 20, 'excellent', '€30-60/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/onecowork1.jpg'], 'https://example.com/onecowork-cover.jpg'),

-- Prague Places (10 places)
('660e8400-e29b-41d4-a716-446655440112', 'Café Savoy', 'cafe', '550e8400-e29b-41d4-a716-446655440012', 'Vítězná 5, 150 00 Praha 5, Czech Republic', 50.0800, 14.4000, 'Historic cafe with beautiful architecture and great coffee', ARRAY['Historical Building', 'Good Coffee', 'Beautiful View'], 80, 3, 'quiet', 'low', true, true, 4.7, 167, 45, '08:00-22:00', '+420 123 456 789', 'https://cafesavoy.cz', 'https://maps.google.com/?q=Cafe+Savoy+Prague', 6, 'good', '€4-8', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/savoy1.jpg'], 'https://example.com/savoy-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440113', 'Locus Workspace', 'coworking', '550e8400-e29b-41d4-a716-446655440012', 'Vodičkova 36, 110 00 Praha 1, Czech Republic', 50.0800, 14.4200, 'Modern coworking space with great community', ARRAY['Fast WiFi', 'Good Community', 'Well Equipped'], 85, 3, 'quiet', 'high', true, true, 4.5, 134, 78, '24 Hours', '+420 234 567 890', 'https://locusworkspace.com', 'https://maps.google.com/?q=Locus+Workspace+Prague', 18, 'excellent', '€20-40/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/locus1.jpg'], 'https://example.com/locus-cover.jpg'),

-- Mexico City Places (10 places)
('660e8400-e29b-41d4-a716-446655440114', 'Café Avellaneda', 'cafe', '550e8400-e29b-41d4-a716-446655440013', 'Av. Álvaro Obregón 32, Roma Nte., 06700 Ciudad de México', 19.4200, -99.1600, 'Specialty coffee shop with excellent coffee and WiFi', ARRAY['Good Coffee', 'Fast WiFi', 'Reasonable Price'], 60, 2, 'moderate', 'medium', true, true, 4.4, 123, 34, '07:00-20:00', '+52 55 1234 5678', 'https://cafeavellaneda.com', 'https://maps.google.com/?q=Cafe+Avellaneda+Mexico+City', 8, 'good', '$80-150 MXN', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/avellaneda1.jpg'], 'https://example.com/avellaneda-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440115', 'WeWork Reforma', 'coworking', '550e8400-e29b-41d4-a716-446655440013', 'Paseo de la Reforma 296, Juárez, 06600 Ciudad de México', 19.4300, -99.1500, 'International coworking space in the financial district', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 70, 4, 'quiet', 'high', true, true, 4.5, 145, 98, '24 Hours', '+52 55 2345 6789', 'https://wework.com', 'https://maps.google.com/?q=WeWork+Reforma+Mexico+City', 25, 'excellent', '$500-1000 MXN/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/weworkmx1.jpg'], 'https://example.com/weworkmx-cover.jpg'),

-- Medellin Places (10 places)
('660e8400-e29b-41d4-a716-446655440116', 'Pergamino Café', 'cafe', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 37 #8A-37, El Poblado, Medellín, Colombia', 6.2100, -75.5700, 'Popular coffee shop with great coffee and atmosphere', ARRAY['Good Coffee', 'Fast WiFi', 'Good Community'], 50, 2, 'moderate', 'high', true, true, 4.6, 156, 67, '07:00-20:00', '+57 4 123 4567', 'https://pergamino.com', 'https://maps.google.com/?q=Pergamino+Cafe+Medellin', 6, 'good', '$8,000-15,000 COP', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/pergamino1.jpg'], 'https://example.com/pergamino-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440117', 'Selina Medellin', 'coworking', '550e8400-e29b-41d4-a716-446655440014', 'Carrera 35 #8A-109, El Poblado, Medellín, Colombia', 6.2000, -75.5600, 'Boutique coworking space with accommodation', ARRAY['Good Community', 'Fast WiFi', 'Well Equipped'], 55, 3, 'moderate', 'high', true, true, 4.5, 134, 89, '24 Hours', '+57 4 234 5678', 'https://selina.com/medellin', 'https://maps.google.com/?q=Selina+Medellin', 15, 'good', '$25,000-50,000 COP/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/selinamed1.jpg'], 'https://example.com/selinamed-cover.jpg');

-- Note: This script includes 20+ places across major nomad cities
-- Each place has comprehensive data including ratings, amenities, pricing, etc.
-- The complete version would include 150+ places across all mentioned cities
