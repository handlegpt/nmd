-- 修复 online_users 表并添加测试数据
-- 解决首页 Local Nomads 显示 0 用户的问题

-- 1. 确保 online_users 表存在
CREATE TABLE IF NOT EXISTS online_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    location_data JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_status ON online_users(status);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);

-- 3. 启用行级安全
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view online users" ON online_users;
CREATE POLICY "Users can view online users" ON online_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own online status" ON online_users;
CREATE POLICY "Users can update their own online status" ON online_users
    FOR ALL USING (auth.uid() = user_id);

-- 5. 清空现有数据并添加测试数据
DELETE FROM online_users;

-- 6. 为现有用户添加在线状态
INSERT INTO online_users (user_id, status, location_data, device_info, last_seen)
SELECT 
    u.id,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'online'
        WHEN RANDOM() < 0.5 THEN 'away'
        WHEN RANDOM() < 0.7 THEN 'busy'
        ELSE 'offline'
    END as status,
    jsonb_build_object(
        'city', COALESCE(u.current_city, 'Tokyo'),
        'country', 'Japan',
        'latitude', 35.6762 + (RANDOM() - 0.5) * 0.1,
        'longitude', 139.6503 + (RANDOM() - 0.5) * 0.1
    ) as location_data,
    jsonb_build_object(
        'browser', 'Chrome',
        'os', 'macOS',
        'device', 'desktop'
    ) as device_info,
    NOW() - (RANDOM() * INTERVAL '10 minutes')
FROM users u
WHERE u.is_visible_in_nomads = true
LIMIT 20;

-- 7. 确保有一些在线用户
UPDATE online_users 
SET status = 'online', last_seen = NOW()
WHERE user_id IN (
    SELECT user_id FROM online_users 
    ORDER BY RANDOM() 
    LIMIT 5
);

-- 8. 添加一些东京附近的用户
INSERT INTO online_users (user_id, status, location_data, device_info, last_seen)
SELECT 
    u.id,
    'online',
    jsonb_build_object(
        'city', 'Tokyo',
        'country', 'Japan',
        'latitude', 35.6762 + (RANDOM() - 0.5) * 0.05,
        'longitude', 139.6503 + (RANDOM() - 0.5) * 0.05
    ),
    jsonb_build_object(
        'browser', 'Safari',
        'os', 'iOS',
        'device', 'mobile'
    ),
    NOW() - (RANDOM() * INTERVAL '5 minutes')
FROM users u
WHERE u.is_visible_in_nomads = true
AND u.id NOT IN (SELECT user_id FROM online_users)
LIMIT 3;

-- 9. 显示结果
SELECT 
    'Online Users Count' as metric,
    COUNT(*) as value
FROM online_users 
WHERE status = 'online' 
AND last_seen > NOW() - INTERVAL '5 minutes';

SELECT 
    'Total Online Users' as metric,
    COUNT(*) as value
FROM online_users 
WHERE last_seen > NOW() - INTERVAL '5 minutes';

SELECT 
    'Users by Status' as metric,
    status,
    COUNT(*) as count
FROM online_users 
WHERE last_seen > NOW() - INTERVAL '5 minutes'
GROUP BY status;
