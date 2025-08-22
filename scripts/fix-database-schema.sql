-- 修复数据库架构问题
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 修复 Messages 表缺少 ID 字段的问题
ALTER TABLE messages ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- 2. 统一字段名称 (确保与代码一致)
-- 检查并修复 messages 表字段名
DO $$
BEGIN
    -- 如果存在 sender_id 和 receiver_id，重命名为 from_user_id 和 to_user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
        ALTER TABLE messages RENAME COLUMN sender_id TO from_user_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
        ALTER TABLE messages RENAME COLUMN receiver_id TO to_user_id;
    END IF;
END $$;

-- 3. 添加缺失的约束和索引
-- Posts 表改进
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_meetup_request BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meetup_details JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS emotion TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS topic TEXT;

-- Users 表改进
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS location JSONB;

-- 4. 添加性能索引
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_posts_emotion ON posts(emotion);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic);
CREATE INDEX IF NOT EXISTS idx_posts_meetup ON posts(is_meetup_request) WHERE is_meetup_request = true;
CREATE INDEX IF NOT EXISTS idx_users_city ON users(current_city);
CREATE INDEX IF NOT EXISTS idx_users_languages ON users USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_users_available ON users(is_available_for_meetup) WHERE is_available_for_meetup = true;

-- 5. 添加数据验证约束
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE posts ADD CONSTRAINT IF NOT EXISTS check_content_length CHECK (length(content) > 0 AND length(content) <= 2000);
ALTER TABLE comments ADD CONSTRAINT IF NOT EXISTS check_comment_length CHECK (length(content) > 0 AND length(content) <= 500);
ALTER TABLE messages ADD CONSTRAINT IF NOT EXISTS check_message_length CHECK (length(content) > 0 AND length(content) <= 1000);

-- 6. 添加触发器自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表添加 updated_at 触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 改进 RLS 策略
-- 更新用户策略，允许查看自己的完整信息
DROP POLICY IF EXISTS "Users can view visible users" ON users;
CREATE POLICY "Users can view visible users" ON users
    FOR SELECT USING (is_visible = true OR auth.uid() = id);

-- 添加帖子点赞统计优化
CREATE OR REPLACE FUNCTION increment_post_likes(post_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET likes = likes + 1 WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建视图优化查询
CREATE OR REPLACE VIEW posts_with_user_info AS
SELECT 
    p.*,
    u.nickname as user_nickname,
    u.avatar_url as user_avatar_url,
    u.current_city as user_city,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE u.is_visible = true;

-- 9. 添加全文搜索索引
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('english', nickname || ' ' || COALESCE(bio, '')));

-- 10. 添加地理位置查询优化
CREATE INDEX IF NOT EXISTS idx_user_locations_geo ON user_locations USING gist(ll_to_earth(latitude, longitude));

COMMENT ON SCRIPT IS '数据库架构修复和优化脚本 - 修复字段缺失、添加索引、约束和性能优化';
