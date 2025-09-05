-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建城市表
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    visa_days INTEGER DEFAULT 90,
    visa_type VARCHAR(100) DEFAULT 'Tourist Visa',
    cost_of_living INTEGER DEFAULT 1000,
    wifi_speed INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建投票表
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    wifi_rating INTEGER CHECK (wifi_rating >= 1 AND wifi_rating <= 5),
    social_rating INTEGER CHECK (social_rating >= 1 AND social_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    climate_rating INTEGER CHECK (climate_rating >= 1 AND climate_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, user_id)
);

-- 创建地点推荐表
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('cafe', 'coworking', 'coliving', 'restaurant', 'outdoor', 'other')),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    wifi_speed INTEGER,
    price_level INTEGER CHECK (price_level >= 1 AND price_level <= 5),
    noise_level VARCHAR(20) CHECK (noise_level IN ('quiet', 'moderate', 'loud')),
    social_atmosphere VARCHAR(20) CHECK (social_atmosphere IN ('low', 'medium', 'high')),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建地点投票表
CREATE TABLE IF NOT EXISTS place_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(place_id, user_id)
);

-- 创建地点评价表
CREATE TABLE IF NOT EXISTS place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_votes_city_id ON votes(city_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_places_city_id ON places(city_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);
CREATE INDEX IF NOT EXISTS idx_place_votes_place_id ON place_votes(place_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_user_id ON place_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_user_id ON place_reviews(user_id);

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_places_search ON places USING gin(to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- 创建城市评分视图
CREATE OR REPLACE VIEW city_ratings AS
SELECT 
    c.id,
    c.name,
    c.country,
    c.country_code,
    c.timezone,
    c.latitude,
    c.longitude,
    c.visa_days,
    c.visa_type,
    c.cost_of_living,
    c.wifi_speed,
    COUNT(v.id) as vote_count,
    AVG(v.overall_rating) as avg_overall_rating,
    AVG(v.wifi_rating) as avg_wifi_rating,
    AVG(v.social_rating) as avg_social_rating,
    AVG(v.value_rating) as avg_value_rating,
    AVG(v.climate_rating) as avg_climate_rating,
    c.created_at,
    c.updated_at
FROM cities c
LEFT JOIN votes v ON c.id = v.city_id
GROUP BY c.id, c.name, c.country, c.country_code, c.timezone, c.latitude, c.longitude, c.visa_days, c.visa_type, c.cost_of_living, c.wifi_speed, c.created_at, c.updated_at;

-- 创建地点评分视图
CREATE OR REPLACE VIEW place_ratings AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.city_id,
    p.address,
    p.latitude,
    p.longitude,
    p.description,
    p.tags,
    p.wifi_speed,
    p.price_level,
    p.noise_level,
    p.social_atmosphere,
    p.submitted_by,
    COUNT(pv.id) as vote_count,
    SUM(CASE WHEN pv.vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
    SUM(CASE WHEN pv.vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes,
    AVG(pr.rating) as avg_rating,
    COUNT(pr.id) as review_count,
    p.created_at,
    p.updated_at
FROM places p
LEFT JOIN place_votes pv ON p.id = pv.place_id
LEFT JOIN place_reviews pr ON p.id = pr.place_id
GROUP BY p.id, p.name, p.category, p.city_id, p.address, p.latitude, p.longitude, p.description, p.tags, p.wifi_speed, p.price_level, p.noise_level, p.social_atmosphere, p.submitted_by, p.created_at, p.updated_at;

-- 插入示例数据
INSERT INTO cities (name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
('Osaka', 'Japan', 'JP', 'Asia/Tokyo', 34.6937, 135.5023, 90, 'Tourist Visa', 1200, 85),
('Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.7563, 100.5018, 30, 'Tourist Visa', 800, 75),
('Chiang Mai', 'Thailand', 'TH', 'Asia/Bangkok', 18.7883, 98.9853, 30, 'Tourist Visa', 600, 65),
('Lisbon', 'Portugal', 'PT', 'Europe/Lisbon', 38.7223, -9.1393, 90, 'Schengen Visa', 1100, 90),
('Porto', 'Portugal', 'PT', 'Europe/Lisbon', 41.1579, -8.6291, 90, 'Schengen Visa', 900, 85),
('Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.3851, 2.1734, 90, 'Schengen Visa', 1300, 95),
('Madrid', 'Spain', 'ES', 'Europe/Madrid', 40.4168, -3.7038, 90, 'Schengen Visa', 1200, 90),
('Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4326, -99.1332, 180, 'Tourist Visa', 700, 60),
('Medellin', 'Colombia', 'CO', 'America/Bogota', 6.2442, -75.5812, 90, 'Tourist Visa', 500, 55),
('Bali', 'Indonesia', 'ID', 'Asia/Makassar', -8.3405, 115.0920, 30, 'Tourist Visa', 600, 50)
ON CONFLICT DO NOTHING;

-- 插入示例用户
INSERT INTO users (email, name, avatar_url) VALUES
('user1@example.com', '张三', 'https://example.com/avatar1.jpg'),
('user2@example.com', '李四', 'https://example.com/avatar2.jpg'),
('user3@example.com', '王五', 'https://example.com/avatar3.jpg')
ON CONFLICT DO NOTHING;

-- 插入示例投票
INSERT INTO votes (city_id, user_id, overall_rating, wifi_rating, social_rating, value_rating, climate_rating, comment) VALUES
((SELECT id FROM cities WHERE name = 'Osaka' LIMIT 1), (SELECT id FROM users WHERE email = 'user1@example.com' LIMIT 1), 4, 4, 3, 3, 4, 'Great city for digital nomads!'),
((SELECT id FROM cities WHERE name = 'Bangkok' LIMIT 1), (SELECT id FROM users WHERE email = 'user2@example.com' LIMIT 1), 5, 4, 5, 4, 5, 'Amazing food and culture'),
((SELECT id FROM cities WHERE name = 'Chiang Mai' LIMIT 1), (SELECT id FROM users WHERE email = 'user3@example.com' LIMIT 1), 4, 3, 4, 5, 4, 'Very affordable and peaceful')
ON CONFLICT DO NOTHING;

-- 插入示例地点
INSERT INTO places (name, category, city_id, address, latitude, longitude, description, tags, wifi_speed, price_level, noise_level, social_atmosphere, submitted_by) VALUES
('Blue Bottle Coffee', 'cafe', (SELECT id FROM cities WHERE name = 'Osaka' LIMIT 1), '大阪市中央区心斋桥1-1-1', 34.6937, 135.5023, '环境安静，WiFi稳定，咖啡品质很好，适合长时间工作。', ARRAY['安静', 'WiFi快', '咖啡好'], 85, 3, 'quiet', 'low', (SELECT id FROM users WHERE email = 'user1@example.com' LIMIT 1)),
('WeWork 心斋桥', 'coworking', (SELECT id FROM cities WHERE name = 'Osaka' LIMIT 1), '大阪市中央区心斋桥2-2-2', 34.6938, 135.5024, '专业的联合办公空间，设施齐全，社区氛围很好。', ARRAY['专业', '设施全', '社区好'], 120, 4, 'moderate', 'high', (SELECT id FROM users WHERE email = 'user2@example.com' LIMIT 1)),
('Nomad House Osaka', 'coliving', (SELECT id FROM cities WHERE name = 'Osaka' LIMIT 1), '大阪市西区南堀江3-3-3', 34.6939, 135.5025, '数字游民专用住宿，价格合理，位置便利，社交氛围浓厚。', ARRAY['游民专用', '价格合理', '位置好'], 95, 2, 'moderate', 'high', (SELECT id FROM users WHERE email = 'user3@example.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 插入示例地点投票
INSERT INTO place_votes (place_id, user_id, vote_type, comment) VALUES
((SELECT id FROM places WHERE name = 'Blue Bottle Coffee' LIMIT 1), (SELECT id FROM users WHERE email = 'user1@example.com' LIMIT 1), 'upvote', 'Great coffee and fast WiFi'),
((SELECT id FROM places WHERE name = 'WeWork 心斋桥' LIMIT 1), (SELECT id FROM users WHERE email = 'user2@example.com' LIMIT 1), 'upvote', 'Professional environment'),
((SELECT id FROM places WHERE name = 'Nomad House Osaka' LIMIT 1), (SELECT id FROM users WHERE email = 'user3@example.com' LIMIT 1), 'upvote', 'Perfect for nomads')
ON CONFLICT DO NOTHING;

-- 插入示例地点评价
INSERT INTO place_reviews (place_id, user_id, rating, review, pros, cons, visit_date) VALUES
((SELECT id FROM places WHERE name = 'Blue Bottle Coffee' LIMIT 1), (SELECT id FROM users WHERE email = 'user1@example.com' LIMIT 1), 5, 'Excellent coffee and quiet atmosphere for work', ARRAY['Great coffee', 'Quiet', 'Fast WiFi'], ARRAY['A bit expensive'], '2024-01-15'),
((SELECT id FROM places WHERE name = 'WeWork 心斋桥' LIMIT 1), (SELECT id FROM users WHERE email = 'user2@example.com' LIMIT 1), 4, 'Professional coworking space with good facilities', ARRAY['Professional', 'Good facilities', 'Community'], ARRAY['Expensive'], '2024-01-10'),
((SELECT id FROM places WHERE name = 'Nomad House Osaka' LIMIT 1), (SELECT id FROM users WHERE email = 'user3@example.com' LIMIT 1), 5, 'Perfect accommodation for digital nomads', ARRAY['Affordable', 'Good location', 'Social'], ARRAY['Small rooms'], '2024-01-05')
ON CONFLICT DO NOTHING;

-- 启用行级安全策略 (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;

-- 创建基本策略
CREATE POLICY "Allow public read access to cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access to votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to places" ON places FOR SELECT USING (true);
CREATE POLICY "Allow public read access to place_votes" ON place_votes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to place_reviews" ON place_reviews FOR SELECT USING (true);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
