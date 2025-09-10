-- Step 2: Create places using existing city IDs
-- This version uses city names to find the correct IDs

INSERT INTO places (id, name, category, city_id, address, latitude, longitude, description) VALUES
-- Bangkok Places (using city name lookup)
('660e8400-e29b-41d4-a716-446655440100', 'Casa Lapin X49', 'cafe', (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), '49 Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok', 13.7300, 100.5600, 'Trendy coffee shop with excellent WiFi and modern design'),
('660e8400-e29b-41d4-a716-446655440101', 'The Hive Thonglor', 'coworking', (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), '46/1 Soi Thonglor 13, Sukhumvit 55, Bangkok', 13.7400, 100.5700, 'Premium coworking space with great community and events'),

-- Hong Kong Places
('660e8400-e29b-41d4-a716-446655440102', 'Cupping Room', 'cafe', (SELECT id FROM cities WHERE name = 'Hong Kong' AND country = 'Hong Kong' LIMIT 1), 'Shop 3, G/F, 32-38 Tai Ping Shan Street, Sheung Wan, Hong Kong', 22.2850, 114.1500, 'Specialty coffee shop with award-winning baristas'),
('660e8400-e29b-41d4-a716-446655440103', 'The Hive Central', 'coworking', (SELECT id FROM cities WHERE name = 'Hong Kong' AND country = 'Hong Kong' LIMIT 1), '15/F, 33 Des Voeux Road Central, Central, Hong Kong', 22.2800, 114.1600, 'Modern coworking space in Central with harbor views'),

-- Tokyo Places
('660e8400-e29b-41d4-a716-446655440104', 'Blue Bottle Coffee', 'cafe', (SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), '1-4-8 Shibuya, Shibuya City, Tokyo', 35.6580, 139.7016, 'Popular coffee chain with excellent coffee and WiFi'),
('660e8400-e29b-41d4-a716-446655440105', 'WeWork Shibuya', 'coworking', (SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), '2-11-3 Shibuya, Shibuya City, Tokyo', 35.6590, 139.7026, 'International coworking space with modern facilities'),

-- Seoul Places
('660e8400-e29b-41d4-a716-446655440106', 'Cafe Onion', 'cafe', (SELECT id FROM cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), '8 Achasan-ro 9-gil, Seongdong-gu, Seoul', 37.5400, 127.0400, 'Industrial-style cafe with great coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440107', 'FastFive', 'coworking', (SELECT id FROM cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), '123 Teheran-ro, Gangnam-gu, Seoul', 37.5000, 127.0300, 'Premium coworking space with high-speed internet'),

-- Berlin Places
('660e8400-e29b-41d4-a716-446655440108', 'The Barn', 'cafe', (SELECT id FROM cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'Schönhauser Allee 8, 10119 Berlin, Germany', 52.5300, 13.4000, 'Specialty coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440109', 'Factory Berlin', 'coworking', (SELECT id FROM cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'Rheinsberger Str. 76/77, 10115 Berlin, Germany', 52.5400, 13.4100, 'Creative coworking space with startup community'),

-- Barcelona Places
('660e8400-e29b-41d4-a716-446655440110', 'Nomad Coffee', 'cafe', (SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Passatge Sert, 12, 08003 Barcelona, Spain', 41.3900, 2.1800, 'Specialty coffee shop with great atmosphere'),
('660e8400-e29b-41d4-a716-446655440111', 'OneCoWork', 'coworking', (SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Passeig de Gràcia, 62, 08007 Barcelona, Spain', 41.4000, 2.1700, 'Premium coworking space in the heart of Barcelona'),

-- Prague Places
('660e8400-e29b-41d4-a716-446655440112', 'Café Savoy', 'cafe', (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Vítězná 5, 150 00 Praha 5, Czech Republic', 50.0800, 14.4000, 'Historic cafe with beautiful architecture and great coffee'),
('660e8400-e29b-41d4-a716-446655440113', 'Locus Workspace', 'coworking', (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Vodičkova 36, 110 00 Praha 1, Czech Republic', 50.0800, 14.4200, 'Modern coworking space with great community'),

-- Mexico City Places
('660e8400-e29b-41d4-a716-446655440114', 'Café Avellaneda', 'cafe', (SELECT id FROM cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Av. Álvaro Obregón 32, Roma Nte., 06700 Ciudad de México', 19.4200, -99.1600, 'Specialty coffee shop with excellent coffee and WiFi'),
('660e8400-e29b-41d4-a716-446655440115', 'WeWork Reforma', 'coworking', (SELECT id FROM cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Paseo de la Reforma 296, Juárez, 06700 Ciudad de México', 19.4300, -99.1500, 'International coworking space in the financial district'),

-- Medellin Places
('660e8400-e29b-41d4-a716-446655440116', 'Pergamino Café', 'cafe', (SELECT id FROM cities WHERE name = 'Medellin' AND country = 'Colombia' LIMIT 1), 'Carrera 37 #8A-37, El Poblado, Medellín, Colombia', 6.2100, -75.5700, 'Popular coffee shop with great coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440117', 'Selina Medellin', 'coworking', (SELECT id FROM cities WHERE name = 'Medellin' AND country = 'Colombia' LIMIT 1), 'Carrera 35 #8A-109, El Poblado, Medellín, Colombia', 6.2000, -75.5600, 'Boutique coworking space with accommodation'),

-- Chiang Mai Places
('660e8400-e29b-41d4-a716-446655440118', 'Ristr8to Coffee', 'cafe', (SELECT id FROM cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), '15/3 Nimmanhaemin Road, Suthep, Mueang Chiang Mai District', 18.7961, 98.9653, 'Award-winning specialty coffee shop with excellent WiFi'),
('660e8400-e29b-41d4-a716-446655440119', 'Punspace', 'coworking', (SELECT id FROM cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), '45/1 Huay Kaew Road, Suthep, Mueang Chiang Mai District', 18.7941, 98.9633, 'Popular coworking space with great community and events'),

-- Bali Places
('660e8400-e29b-41d4-a716-446655440120', 'Revolver Espresso', 'cafe', (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Jl. Kayu Aya No.3, Seminyak, Kuta, Badung Regency', -8.6855, 115.1700, 'Popular coffee shop with excellent coffee and beach vibes'),
('660e8400-e29b-41d4-a716-446655440121', 'Canggu Hub', 'coworking', (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Jl. Pantai Batu Bolong No.58, Canggu, Kuta Utara, Badung Regency', -8.6500, 115.1400, 'Modern coworking space near the beach with great community'),

-- Lisbon Places
('660e8400-e29b-41d4-a716-446655440122', 'Copenhagen Coffee Lab', 'cafe', (SELECT id FROM cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'R. Nova da Piedade 10, 1200-405 Lisboa, Portugal', 38.7223, -9.1393, 'Specialty coffee shop with Nordic design and excellent coffee'),
('660e8400-e29b-41d4-a716-446655440123', 'Second Home', 'coworking', (SELECT id FROM cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'R. da Boavista 84, 1200-068 Lisboa, Portugal', 38.7200, -9.1400, 'Creative coworking space with beautiful architecture'),

-- Porto Places
('660e8400-e29b-41d4-a716-446655440124', 'Café Majestic', 'cafe', (SELECT id FROM cities WHERE name = 'Porto' AND country = 'Portugal' LIMIT 1), 'R. de Santa Catarina 112, 4000-442 Porto, Portugal', 41.1579, -8.6291, 'Historic cafe with beautiful Art Nouveau architecture'),
('660e8400-e29b-41d4-a716-446655440125', 'Porto i/o', 'coworking', (SELECT id FROM cities WHERE name = 'Porto' AND country = 'Portugal' LIMIT 1), 'R. de Cedofeita 112, 4050-180 Porto, Portugal', 41.1500, -8.6200, 'Modern coworking space in the heart of Porto'),

-- Budapest Places
('660e8400-e29b-41d4-a716-446655440126', 'My Little Melbourne', 'cafe', (SELECT id FROM cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Nagymező u. 30, 1065 Budapest, Hungary', 47.4979, 19.0402, 'Australian-style cafe with excellent coffee and brunch'),
('660e8400-e29b-41d4-a716-446655440127', 'Loffice', 'coworking', (SELECT id FROM cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Károly krt. 12, 1052 Budapest, Hungary', 47.5000, 19.0500, 'Premium coworking space with great community'),

-- Ho Chi Minh City Places
('660e8400-e29b-41d4-a716-446655440128', 'The Workshop Coffee', 'cafe', (SELECT id FROM cities WHERE name = 'Ho Chi Minh City' AND country = 'Vietnam' LIMIT 1), '27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh, Vietnam', 10.8231, 106.6297, 'Specialty coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440129', 'Saigon Coworking', 'coworking', (SELECT id FROM cities WHERE name = 'Ho Chi Minh City' AND country = 'Vietnam' LIMIT 1), '126 Nguyễn Thị Minh Khai, Phường 6, Quận 3, Hồ Chí Minh, Vietnam', 10.8200, 106.6300, 'Modern coworking space in District 3'),

-- Osaka Places
('660e8400-e29b-41d4-a716-446655440130', 'Streamer Coffee Company', 'cafe', (SELECT id FROM cities WHERE name = 'Osaka' AND country = 'Japan' LIMIT 1), '1-20-28 Shinsaibashisuji, Chuo-ku, Osaka', 34.6937, 135.5023, 'Popular coffee chain with great latte art'),
('660e8400-e29b-41d4-a716-446655440131', 'Osaka Innovation Hub', 'coworking', (SELECT id FROM cities WHERE name = 'Osaka' AND country = 'Japan' LIMIT 1), '2-2-8 Nakanoshima, Kita-ku, Osaka', 34.6900, 135.5000, 'Innovation-focused coworking space'),

-- Taipei Places
('660e8400-e29b-41d4-a716-446655440132', 'Simple Kaffa', 'cafe', (SELECT id FROM cities WHERE name = 'Taipei' AND country = 'Taiwan' LIMIT 1), 'No. 1, Lane 177, Section 1, Dunhua S Rd, Da''an District, Taipei', 25.0330, 121.5654, 'World-class coffee shop with award-winning baristas'),
('660e8400-e29b-41d4-a716-446655440133', 'CLBC', 'coworking', (SELECT id FROM cities WHERE name = 'Taipei' AND country = 'Taiwan' LIMIT 1), 'No. 2, Lane 177, Section 1, Dunhua S Rd, Da''an District, Taipei', 25.0340, 121.5660, 'Premium coworking space with great community'),

-- Kuala Lumpur Places
('660e8400-e29b-41d4-a716-446655440134', 'VCR', 'cafe', (SELECT id FROM cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), '2, Jalan Galloway, Bukit Bintang, 50150 Kuala Lumpur', 3.1390, 101.6869, 'Specialty coffee shop with excellent coffee and atmosphere'),
('660e8400-e29b-41d4-a716-446655440135', 'WORQ', 'coworking', (SELECT id FROM cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), 'Level 2, Menara UOA Bangsar, 5, Jalan Bangsar Utama 1, Bangsar, 59000 Kuala Lumpur', 3.1400, 101.6700, 'Modern coworking space with great facilities'),

-- Singapore Places
('660e8400-e29b-41d4-a716-446655440136', 'Common Man Coffee Roasters', 'cafe', (SELECT id FROM cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), '22 Martin Rd, Singapore 239058', 1.3521, 103.8198, 'Popular coffee roastery with excellent coffee'),
('660e8400-e29b-41d4-a716-446655440137', 'The Working Capitol', 'coworking', (SELECT id FROM cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), '1 Keong Saik Rd, Singapore 089109', 1.3500, 103.8200, 'Premium coworking space in the heart of Singapore');

-- Check how many places were created
SELECT COUNT(*) as places_created FROM places;
