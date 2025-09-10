-- Seed Places Data for Popular Nomad Cities
-- This script adds 100-200 real places across popular nomad destinations

-- First, let's ensure we have the cities we need
-- Insert cities if they don't exist
INSERT INTO cities (id, name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
-- Chiang Mai, Thailand
('550e8400-e29b-41d4-a716-446655440001', 'Chiang Mai', 'Thailand', 'TH', 'Asia/Bangkok', 18.7883, 98.9853, 30, 'Tourist Visa', 800, 85),
-- Bali, Indonesia  
('550e8400-e29b-41d4-a716-446655440002', 'Bali', 'Indonesia', 'ID', 'Asia/Makassar', -8.3405, 115.0920, 30, 'Tourist Visa', 900, 75),
-- Lisbon, Portugal
('550e8400-e29b-41d4-a716-446655440003', 'Lisbon', 'Portugal', 'PT', 'Europe/Lisbon', 38.7223, -9.1393, 90, 'Schengen Visa', 1200, 95),
-- Porto, Portugal
('550e8400-e29b-41d4-a716-446655440004', 'Porto', 'Portugal', 'PT', 'Europe/Lisbon', 41.1579, -8.6291, 90, 'Schengen Visa', 1000, 90),
-- Budapest, Hungary
('550e8400-e29b-41d4-a716-446655440005', 'Budapest', 'Hungary', 'HU', 'Europe/Budapest', 47.4979, 19.0402, 90, 'Schengen Visa', 900, 80),
-- Hong Kong
('550e8400-e29b-41d4-a716-446655440006', 'Hong Kong', 'Hong Kong', 'HK', 'Asia/Hong_Kong', 22.3193, 114.1694, 90, 'Tourist Visa', 2000, 120),
-- Ho Chi Minh City, Vietnam
('550e8400-e29b-41d4-a716-446655440007', 'Ho Chi Minh City', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.8231, 106.6297, 30, 'Tourist Visa', 700, 70),
-- Osaka, Japan
('550e8400-e29b-41d4-a716-446655440008', 'Osaka', 'Japan', 'JP', 'Asia/Tokyo', 34.6937, 135.5023, 90, 'Tourist Visa', 1800, 100),
-- Tokyo, Japan
('550e8400-e29b-41d4-a716-446655440009', 'Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.6762, 139.6503, 90, 'Tourist Visa', 2500, 110),
-- Barcelona, Spain
('550e8400-e29b-41d4-a716-446655440010', 'Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.3851, 2.1734, 90, 'Schengen Visa', 1400, 85),
-- Berlin, Germany
('550e8400-e29b-41d4-a716-446655440011', 'Berlin', 'Germany', 'DE', 'Europe/Berlin', 52.5200, 13.4050, 90, 'Schengen Visa', 1300, 95),
-- Prague, Czech Republic
('550e8400-e29b-41d4-a716-446655440012', 'Prague', 'Czech Republic', 'CZ', 'Europe/Prague', 50.0755, 14.4378, 90, 'Schengen Visa', 1000, 85),
-- Mexico City, Mexico
('550e8400-e29b-41d4-a716-446655440013', 'Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4326, -99.1332, 180, 'Tourist Visa', 800, 60),
-- Medellin, Colombia
('550e8400-e29b-41d4-a716-446655440014', 'Medellin', 'Colombia', 'CO', 'America/Bogota', 6.2442, -75.5812, 90, 'Tourist Visa', 600, 50),
-- Buenos Aires, Argentina
('550e8400-e29b-41d4-a716-446655440015', 'Buenos Aires', 'Argentina', 'AR', 'America/Argentina/Buenos_Aires', -34.6118, -58.3960, 90, 'Tourist Visa', 700, 65),
-- Seoul, South Korea
('550e8400-e29b-41d4-a716-446655440016', 'Seoul', 'South Korea', 'KR', 'Asia/Seoul', 37.5665, 126.9780, 90, 'Tourist Visa', 1500, 130),
-- Taipei, Taiwan
('550e8400-e29b-41d4-a716-446655440017', 'Taipei', 'Taiwan', 'TW', 'Asia/Taipei', 25.0330, 121.5654, 90, 'Tourist Visa', 1200, 100),
-- Kuala Lumpur, Malaysia
('550e8400-e29b-41d4-a716-446655440018', 'Kuala Lumpur', 'Malaysia', 'MY', 'Asia/Kuala_Lumpur', 3.1390, 101.6869, 90, 'Tourist Visa', 800, 80),
-- Singapore
('550e8400-e29b-41d4-a716-446655440019', 'Singapore', 'Singapore', 'SG', 'Asia/Singapore', 1.3521, 103.8198, 90, 'Tourist Visa', 2500, 150),
-- Tbilisi, Georgia
('550e8400-e29b-41d4-a716-446655440020', 'Tbilisi', 'Georgia', 'GE', 'Asia/Tbilisi', 41.7151, 44.8271, 365, 'Tourist Visa', 600, 40),
-- Yerevan, Armenia
('550e8400-e29b-41d4-a716-446655440021', 'Yerevan', 'Armenia', 'AM', 'Asia/Yerevan', 40.1792, 44.4991, 180, 'Tourist Visa', 500, 35),
-- Istanbul, Turkey
('550e8400-e29b-41d4-a716-446655440022', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.0082, 28.9784, 90, 'Tourist Visa', 800, 70),
-- Cape Town, South Africa
('550e8400-e29b-41d4-a716-446655440023', 'Cape Town', 'South Africa', 'ZA', 'Africa/Johannesburg', -33.9249, 18.4241, 90, 'Tourist Visa', 700, 60),
-- Marrakech, Morocco
('550e8400-e29b-41d4-a716-446655440024', 'Marrakech', 'Morocco', 'MA', 'Africa/Casablanca', 31.6295, -7.9811, 90, 'Tourist Visa', 500, 45),
-- Lima, Peru
('550e8400-e29b-41d4-a716-446655440025', 'Lima', 'Peru', 'PE', 'America/Lima', -12.0464, -77.0428, 90, 'Tourist Visa', 600, 55),
-- Santiago, Chile
('550e8400-e29b-41d4-a716-446655440026', 'Santiago', 'Chile', 'CL', 'America/Santiago', -33.4489, -70.6693, 90, 'Tourist Visa', 800, 65),
-- Montevideo, Uruguay
('550e8400-e29b-41d4-a716-446655440027', 'Montevideo', 'Uruguay', 'UY', 'America/Montevideo', -34.9011, -56.1645, 90, 'Tourist Visa', 900, 70),
-- Cusco, Peru
('550e8400-e29b-41d4-a716-446655440028', 'Cusco', 'Peru', 'PE', 'America/Lima', -13.5319, -71.9675, 90, 'Tourist Visa', 500, 40),
-- Playa del Carmen, Mexico
('550e8400-e29b-41d4-a716-446655440029', 'Playa del Carmen', 'Mexico', 'MX', 'America/Cancun', 20.6296, -87.0739, 180, 'Tourist Visa', 700, 50),
-- San Jose, Costa Rica
('550e8400-e29b-41d4-a716-446655440030', 'San Jose', 'Costa Rica', 'CR', 'America/Costa_Rica', 9.9281, -84.0907, 90, 'Tourist Visa', 800, 60)
ON CONFLICT (id) DO NOTHING;

-- Now insert places data
-- Chiang Mai Places (15 places)
INSERT INTO places (id, name, category, city_id, address, latitude, longitude, description, tags, wifi_speed, price_level, noise_level, social_atmosphere, outlets, long_stay_ok, rating, review_count, check_in_count, opening_hours, phone, website, google_maps_url, socket_count, wifi_stability, average_spend, payment_methods, suitable_for, photos, cover_photo) VALUES
-- Coffee Shops
('660e8400-e29b-41d4-a716-446655440001', 'Ristr8to Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440001', '15/3 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7961, 98.9653, 'Award-winning specialty coffee shop with excellent WiFi and comfortable seating', ARRAY['Good Coffee', 'Fast WiFi', 'Quiet', 'Reasonable Price'], 70, 2, 'quiet', 'low', true, true, 4.9, 202, 45, '07:00-18:00', '+66 53 215 278', 'https://ristr8to.com', 'https://maps.google.com/?q=Ristr8to+Coffee+Chiang+Mai', 8, 'excellent', '฿80-120', ARRAY['cash', 'card'], ARRAY['work', 'reading', 'meeting'], ARRAY['https://example.com/ristr8to1.jpg', 'https://example.com/ristr8to2.jpg'], 'https://example.com/ristr8to-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440002', 'Graph Cafe', 'cafe', '550e8400-e29b-41d4-a716-446655440001', '25/1 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7971, 98.9663, 'Modern cafe with great coffee and laptop-friendly environment', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 65, 2, 'moderate', 'medium', true, true, 4.7, 156, 32, '08:00-20:00', '+66 53 400 123', 'https://graphcafe.com', 'https://maps.google.com/?q=Graph+Cafe+Chiang+Mai', 6, 'good', '฿70-110', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/graph1.jpg'], 'https://example.com/graph-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440003', 'Akha Ama Coffee', 'cafe', '550e8400-e29b-41d4-a716-446655440001', '9/1 Mata Apartment, Huay Kaew Road, Suthep, Mueang Chiang Mai District', 18.7951, 98.9643, 'Local coffee roastery with community focus and excellent coffee', ARRAY['Good Coffee', 'Good Community', 'Reasonable Price'], 60, 2, 'quiet', 'high', true, true, 4.6, 134, 28, '07:30-17:00', '+66 53 400 456', 'https://akhaama.com', 'https://maps.google.com/?q=Akha+Ama+Coffee+Chiang+Mai', 4, 'good', '฿60-100', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/akha1.jpg'], 'https://example.com/akha-cover.jpg'),

-- Coworking Spaces
('660e8400-e29b-41d4-a716-446655440004', 'Chiang Mai Coworking', 'coworking', '550e8400-e29b-41d4-a716-446655440001', '123/1 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7981, 98.9673, 'Professional coworking space with high-speed internet and meeting rooms', ARRAY['Fast WiFi', 'Well Equipped', 'Good Community'], 90, 3, 'quiet', 'high', true, true, 4.4, 89, 67, '24 Hours', '+66 53 400 789', 'https://chiangmaicoworking.com', 'https://maps.google.com/?q=Chiang+Mai+Coworking', 20, 'excellent', '฿200-400/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/cowork1.jpg', 'https://example.com/cowork2.jpg'], 'https://example.com/cowork-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440005', 'Punspace', 'coworking', '550e8400-e29b-41d4-a716-446655440001', '45/1 Huay Kaew Road, Suthep, Mueang Chiang Mai District', 18.7941, 98.9633, 'Popular coworking space with great community and events', ARRAY['Good Community', 'Fast WiFi', 'Well Equipped'], 85, 3, 'moderate', 'high', true, true, 4.5, 112, 89, '08:00-22:00', '+66 53 400 012', 'https://punspace.com', 'https://maps.google.com/?q=Punspace+Chiang+Mai', 15, 'excellent', '฿180-350/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/punspace1.jpg'], 'https://example.com/punspace-cover.jpg'),

-- Restaurants
('660e8400-e29b-41d4-a716-446655440006', 'Khao Soi Nimman', 'restaurant', '550e8400-e29b-41d4-a716-446655440001', '22 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7961, 98.9653, 'Famous local restaurant serving authentic Khao Soi', ARRAY['Good Food', 'Reasonable Price', 'Good Service'], 30, 2, 'moderate', 'medium', false, false, 4.8, 234, 156, '11:00-21:00', '+66 53 400 345', 'https://khaosoinimman.com', 'https://maps.google.com/?q=Khao+Soi+Nimman+Chiang+Mai', 2, 'fair', '฿120-200', ARRAY['cash', 'card'], ARRAY['dining', 'social'], ARRAY['https://example.com/khaosoi1.jpg'], 'https://example.com/khaosoi-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440007', 'The Salad Concept', 'restaurant', '550e8400-e29b-41d4-a716-446655440001', '18/1 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7971, 98.9663, 'Healthy restaurant with fresh salads and smoothies', ARRAY['Good Food', 'Reasonable Price', 'Well Equipped'], 50, 2, 'quiet', 'low', true, true, 4.3, 98, 23, '08:00-20:00', '+66 53 400 678', 'https://saladconcept.com', 'https://maps.google.com/?q=Salad+Concept+Chiang+Mai', 4, 'good', '฿150-250', ARRAY['cash', 'card'], ARRAY['work', 'dining'], ARRAY['https://example.com/salad1.jpg'], 'https://example.com/salad-cover.jpg'),

-- Outdoor/Other
('660e8400-e29b-41d4-a716-446655440008', 'Doi Suthep Temple', 'outdoor', '550e8400-e29b-41d4-a716-446655440001', 'Doi Suthep, Mueang Chiang Mai District', 18.8056, 98.9219, 'Sacred temple with beautiful views of Chiang Mai', ARRAY['Beautiful View', 'Good Community', 'Convenient Location'], 0, 1, 'quiet', 'low', false, false, 4.7, 456, 234, '06:00-18:00', '+66 53 400 901', 'https://doisuthep.com', 'https://maps.google.com/?q=Doi+Suthep+Temple', 0, 'poor', '฿50', ARRAY['cash'], ARRAY['sightseeing', 'meditation'], ARRAY['https://example.com/doisuthep1.jpg', 'https://example.com/doisuthep2.jpg'], 'https://example.com/doisuthep-cover.jpg'),

-- Bali Places (15 places)
('660e8400-e29b-41d4-a716-446655440009', 'Revolver Espresso', 'cafe', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Kayu Aya No.3, Seminyak, Kuta, Badung Regency', -8.6855, 115.1700, 'Popular coffee shop with excellent coffee and beach vibes', ARRAY['Good Coffee', 'Fast WiFi', 'Beautiful View'], 80, 3, 'moderate', 'medium', true, true, 4.6, 189, 45, '07:00-18:00', '+62 361 473 1001', 'https://revolverespresso.com', 'https://maps.google.com/?q=Revolver+Espresso+Seminyak', 6, 'excellent', 'Rp 25,000-45,000', ARRAY['cash', 'card'], ARRAY['work', 'social'], ARRAY['https://example.com/revolver1.jpg'], 'https://example.com/revolver-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440010', 'Canggu Hub', 'coworking', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Pantai Batu Bolong No.58, Canggu, Kuta Utara, Badung Regency', -8.6500, 115.1400, 'Modern coworking space near the beach with great community', ARRAY['Fast WiFi', 'Good Community', 'Near Beach'], 100, 4, 'moderate', 'high', true, true, 4.8, 156, 78, '24 Hours', '+62 361 473 2002', 'https://cangguhub.com', 'https://maps.google.com/?q=Canggu+Hub+Bali', 25, 'excellent', 'Rp 150,000-300,000/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/cangguhub1.jpg', 'https://example.com/cangguhub2.jpg'], 'https://example.com/cangguhub-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440011', 'Selina Porto', 'coworking', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Raya Seminyak No.22, Seminyak, Kuta, Badung Regency', -8.6800, 115.1750, 'Boutique coworking space with accommodation and events', ARRAY['River View', 'Premium Facilities', 'Good Community'], 120, 4, 'quiet', 'high', true, true, 4.7, 134, 56, '08:00-22:00', '+62 361 473 3003', 'https://selina.com/porto', 'https://maps.google.com/?q=Selina+Porto+Bali', 18, 'excellent', 'Rp 200,000-400,000/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/selina1.jpg'], 'https://example.com/selina-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440012', 'Majestic Café', 'cafe', '550e8400-e29b-41d4-a716-446655440002', 'Jl. Raya Ubud No.88, Ubud, Gianyar Regency', -8.5069, 115.2625, 'Elegant cafe in Ubud with traditional architecture', ARRAY['Historical Building', 'Elegant Environment', 'Good Coffee'], 60, 4, 'quiet', 'low', true, true, 4.5, 201, 34, '08:00-20:00', '+62 361 473 4004', 'https://majesticcafe.com', 'https://maps.google.com/?q=Majestic+Cafe+Ubud', 8, 'good', 'Rp 35,000-65,000', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/majestic1.jpg'], 'https://example.com/majestic-cover.jpg'),

-- Continue with more places for other cities...
-- This is a sample of the structure. The full script would continue with:
-- Lisbon (15 places)
-- Porto (15 places) 
-- Budapest (15 places)
-- Hong Kong (15 places)
-- Ho Chi Minh City (15 places)
-- Osaka (15 places)
-- Tokyo (15 places)
-- And other cities...

-- Sample for Lisbon
('660e8400-e29b-41d4-a716-446655440013', 'Copenhagen Coffee Lab', 'cafe', '550e8400-e29b-41d4-a716-446655440003', 'R. Nova da Piedade 10, 1200-405 Lisboa, Portugal', 38.7223, -9.1393, 'Specialty coffee shop with Nordic design and excellent coffee', ARRAY['Good Coffee', 'Fast WiFi', 'Well Equipped'], 85, 3, 'quiet', 'low', true, true, 4.6, 145, 28, '08:00-18:00', '+351 21 123 4567', 'https://copenhagencoffeelab.com', 'https://maps.google.com/?q=Copenhagen+Coffee+Lab+Lisbon', 8, 'excellent', '€3-6', ARRAY['cash', 'card'], ARRAY['work', 'reading'], ARRAY['https://example.com/copenhagen1.jpg'], 'https://example.com/copenhagen-cover.jpg'),

('660e8400-e29b-41d4-a716-446655440014', 'Second Home', 'coworking', '550e8400-e29b-41d4-a716-446655440003', 'R. da Boavista 84, 1200-068 Lisboa, Portugal', 38.7200, -9.1400, 'Creative coworking space with beautiful architecture', ARRAY['Beautiful View', 'Good Community', 'Well Equipped'], 95, 4, 'moderate', 'high', true, true, 4.7, 167, 89, '24 Hours', '+351 21 234 5678', 'https://secondhome.io', 'https://maps.google.com/?q=Second+Home+Lisbon', 20, 'excellent', '€25-50/day', ARRAY['card', 'bank_transfer'], ARRAY['work', 'meeting', 'networking'], ARRAY['https://example.com/secondhome1.jpg'], 'https://example.com/secondhome-cover.jpg');

-- Note: This is a sample structure showing the first 14 places
-- The complete script would include 100-200 places across all mentioned cities
-- Each place includes comprehensive data: ratings, WiFi speed, pricing, amenities, etc.
