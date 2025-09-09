-- 插入示例地点数据到Supabase
-- 运行此脚本前，请确保cities表已有数据

-- 首先检查是否有城市数据
DO $$
DECLARE
    city_count INTEGER;
    osaka_id UUID;
    bangkok_id UUID;
    lisbon_id UUID;
BEGIN
    -- 检查城市数量
    SELECT COUNT(*) INTO city_count FROM cities;
    
    IF city_count = 0 THEN
        RAISE NOTICE 'No cities found. Please run the main database init script first.';
        RETURN;
    END IF;
    
    -- 获取城市ID
    SELECT id INTO osaka_id FROM cities WHERE name = 'Osaka' LIMIT 1;
    SELECT id INTO bangkok_id FROM cities WHERE name = 'Bangkok' LIMIT 1;
    SELECT id INTO lisbon_id FROM cities WHERE name = 'Lisbon' LIMIT 1;
    
    -- 插入示例地点数据
    INSERT INTO places (name, category, city_id, address, latitude, longitude, description, tags, wifi_speed, price_level, noise_level, social_atmosphere) VALUES
    -- Osaka places
    ('Blue Bottle Coffee Osaka', 'cafe', osaka_id, '大阪市中央区心斋桥1-1-1', 34.6937, 135.5023, '环境安静，WiFi稳定，咖啡品质很好，适合长时间工作。', ARRAY['安静', 'WiFi快', '咖啡好'], 85, 3, 'quiet', 'low'),
    ('WeWork Osaka', 'coworking', osaka_id, '大阪市中央区心斋桥2-2-2', 34.6938, 135.5024, '专业的联合办公空间，设施齐全，社区氛围很好。', ARRAY['专业', '设施全', '社区好'], 120, 4, 'moderate', 'high'),
    ('Nomad House Osaka', 'coliving', osaka_id, '大阪市西区南堀江3-3-3', 34.6939, 135.5025, '数字游民专用住宿，价格合理，位置便利，社交氛围浓厚。', ARRAY['游民专用', '价格合理', '位置好'], 95, 2, 'moderate', 'high'),
    
    -- Bangkok places
    ('Casa Lapin X49', 'cafe', bangkok_id, '49 Sukhumvit 49, Bangkok', 13.7563, 100.5018, 'Cozy cafe with excellent WiFi and great coffee. Perfect for remote work.', ARRAY['cozy', 'wifi', 'coffee'], 75, 2, 'quiet', 'medium'),
    ('The Hive Thonglor', 'coworking', bangkok_id, '46/1 Sukhumvit Soi 13, Bangkok', 13.7564, 100.5019, 'Modern coworking space with all amenities. Great community for digital nomads.', ARRAY['modern', 'amenities', 'community'], 100, 3, 'moderate', 'high'),
    ('Bed Station Hostel', 'coliving', bangkok_id, '12/3 Soi Rambuttri, Bangkok', 13.7565, 100.5020, 'Budget-friendly accommodation with good WiFi. Popular among backpackers and nomads.', ARRAY['budget', 'wifi', 'backpackers'], 60, 1, 'moderate', 'high'),
    
    -- Lisbon places
    ('Fabrica Coffee Roasters', 'cafe', lisbon_id, 'Rua das Portas de Santo Antão 136, Lisbon', 38.7223, -9.1393, 'Artisanal coffee roastery with excellent WiFi and quiet atmosphere.', ARRAY['artisanal', 'wifi', 'quiet'], 90, 3, 'quiet', 'low'),
    ('Second Home Lisboa', 'coworking', lisbon_id, 'Rua da Boavista 84, Lisbon', 38.7224, -9.1394, 'Beautiful coworking space in historic building. Great for creative professionals.', ARRAY['beautiful', 'historic', 'creative'], 110, 4, 'moderate', 'high'),
    ('Selina Secret Garden', 'coliving', lisbon_id, 'Rua de São Bento 209, Lisbon', 38.7225, -9.1395, 'Stylish coliving space with modern amenities and vibrant community.', ARRAY['stylish', 'modern', 'vibrant'], 95, 3, 'moderate', 'high')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Successfully inserted sample places data.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting places data: %', SQLERRM;
END $$;
