-- 扩展users表，添加缺失的字段
-- 这个脚本需要在Supabase数据库中执行

-- 1. 添加用户详细资料字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_city VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS coordinates POINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_visible_in_nomads BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. 添加用户偏好和设置字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_current_city ON users(current_city);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);
CREATE INDEX IF NOT EXISTS idx_users_is_visible ON users(is_visible_in_nomads);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_is_available ON users(is_available);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- 4. 添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 更新现有用户的默认值
UPDATE users SET 
    current_city = COALESCE(current_city, 'Unknown Location'),
    profession = COALESCE(profession, 'Digital Nomad'),
    company = COALESCE(company, 'Freelance'),
    bio = COALESCE(bio, 'Digital nomad exploring the world!'),
    interests = COALESCE(interests, ARRAY['Travel', 'Technology']),
    is_visible_in_nomads = COALESCE(is_visible_in_nomads, true),
    is_online = COALESCE(is_online, true),
    is_available = COALESCE(is_available, true),
    last_seen = COALESCE(last_seen, NOW()),
    updated_at = NOW()
WHERE current_city IS NULL 
   OR profession IS NULL 
   OR company IS NULL 
   OR bio IS NULL 
   OR interests IS NULL 
   OR is_visible_in_nomads IS NULL 
   OR is_online IS NULL 
   OR is_available IS NULL 
   OR last_seen IS NULL;

-- 6. 添加注释
COMMENT ON COLUMN users.current_city IS '用户当前所在城市';
COMMENT ON COLUMN users.profession IS '用户职业';
COMMENT ON COLUMN users.company IS '用户公司';
COMMENT ON COLUMN users.bio IS '用户简介';
COMMENT ON COLUMN users.interests IS '用户兴趣标签';
COMMENT ON COLUMN users.coordinates IS '用户坐标位置';
COMMENT ON COLUMN users.is_visible_in_nomads IS '是否在nomad列表中可见';
COMMENT ON COLUMN users.is_online IS '是否在线';
COMMENT ON COLUMN users.is_available IS '是否可用';
COMMENT ON COLUMN users.last_seen IS '最后在线时间';
COMMENT ON COLUMN users.travel_preferences IS '旅行偏好设置';
COMMENT ON COLUMN users.skills IS '用户技能';
COMMENT ON COLUMN users.social_links IS '社交媒体链接';
COMMENT ON COLUMN users.contact_info IS '联系信息';
