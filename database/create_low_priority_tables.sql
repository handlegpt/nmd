-- 低优先级数据表创建脚本
-- 媒体和内容数据

-- 1. 用户城市照片表
CREATE TABLE IF NOT EXISTS user_city_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    photo_description TEXT,
    file_size INTEGER,
    file_type VARCHAR(50),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户本地地点表
CREATE TABLE IF NOT EXISTS user_local_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(255) NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    place_type VARCHAR(100),
    coordinates JSONB,
    address TEXT,
    rating DECIMAL(3, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户媒体收藏表
CREATE TABLE IF NOT EXISTS user_media_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'photo', 'place', 'review'
    media_id VARCHAR(255) NOT NULL,
    media_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, media_type, media_id)
);

-- 4. 用户内容分享表
CREATE TABLE IF NOT EXISTS user_content_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'photo', 'place', 'review', 'tip'
    content_id VARCHAR(255) NOT NULL,
    content_data JSONB,
    share_platform VARCHAR(50), -- 'facebook', 'twitter', 'instagram', 'internal'
    share_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用户内容标签表
CREATE TABLE IF NOT EXISTS user_content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50), -- 'activity', 'food', 'transport', 'accommodation'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id, tag_name)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_city_photos_user_id ON user_city_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_photos_city_id ON user_city_photos(city_id);
CREATE INDEX IF NOT EXISTS idx_user_city_photos_upload_date ON user_city_photos(upload_date);

CREATE INDEX IF NOT EXISTS idx_user_local_places_user_id ON user_local_places(user_id);
CREATE INDEX IF NOT EXISTS idx_user_local_places_city ON user_local_places(city);
CREATE INDEX IF NOT EXISTS idx_user_local_places_place_type ON user_local_places(place_type);

CREATE INDEX IF NOT EXISTS idx_user_media_favorites_user_id ON user_media_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_media_favorites_media_type ON user_media_favorites(media_type);

CREATE INDEX IF NOT EXISTS idx_user_content_shares_user_id ON user_content_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_shares_content_type ON user_content_shares(content_type);

CREATE INDEX IF NOT EXISTS idx_user_content_tags_user_id ON user_content_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_tags_content_type ON user_content_tags(content_type);
CREATE INDEX IF NOT EXISTS idx_user_content_tags_tag_name ON user_content_tags(tag_name);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_city_photos_updated_at 
    BEFORE UPDATE ON user_city_photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_local_places_updated_at 
    BEFORE UPDATE ON user_local_places 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE user_city_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_local_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_tags ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own city photos" ON user_city_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own city photos" ON user_city_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own city photos" ON user_city_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own city photos" ON user_city_photos
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own local places" ON user_local_places
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own local places" ON user_local_places
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own local places" ON user_local_places
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own local places" ON user_local_places
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own media favorites" ON user_media_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media favorites" ON user_media_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media favorites" ON user_media_favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media favorites" ON user_media_favorites
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own content shares" ON user_content_shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content shares" ON user_content_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content shares" ON user_content_shares
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content shares" ON user_content_shares
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own content tags" ON user_content_tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content tags" ON user_content_tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content tags" ON user_content_tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content tags" ON user_content_tags
    FOR DELETE USING (auth.uid() = user_id);

-- 插入测试数据（可选）
INSERT INTO user_city_photos (user_id, city_id, city_name, photo_url, photo_description, file_size, file_type)
SELECT 
    u.id,
    'test-city-1',
    'Test City',
    'https://example.com/photo1.jpg',
    'Beautiful city view',
    1024000,
    'image/jpeg'
FROM users u
WHERE u.email = 'test@example.com'
LIMIT 1;

INSERT INTO user_local_places (user_id, place_id, place_name, city, country, place_type, coordinates, address, rating, notes)
SELECT 
    u.id,
    'place-1',
    'Test Coffee Shop',
    'Test City',
    'Test Country',
    'cafe',
    '{"lat": 40.7128, "lng": -74.0060}',
    '123 Test Street',
    4.5,
    'Great coffee and atmosphere'
FROM users u
WHERE u.email = 'test@example.com'
LIMIT 1;

-- 验证表创建
SELECT 
    'Low Priority Tables Created' as info,
    COUNT(*) as total_tables,
    string_agg(table_name, ', ') as table_names
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_city_photos',
    'user_local_places', 
    'user_media_favorites',
    'user_content_shares',
    'user_content_tags'
);
