-- 创建 meetups 表和相关表
-- 如果表已存在，先删除重建

-- 删除相关表（按依赖顺序）
DROP TABLE IF EXISTS meetup_participants CASCADE;
DROP TABLE IF EXISTS meetup_reviews CASCADE;
DROP TABLE IF EXISTS meetup_activities CASCADE;
DROP TABLE IF EXISTS meetups CASCADE;

-- 创建 meetups 表
CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'full')),
    meetup_type VARCHAR(20) DEFAULT 'coffee' CHECK (meetup_type IN ('coffee', 'work', 'social', 'other')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 meetup_participants 表
CREATE TABLE meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- 防止重复参与者
    UNIQUE(meetup_id, user_id)
);

-- 创建 meetup_reviews 表
CREATE TABLE meetup_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 每个用户只能对每个聚会评价一次
    UNIQUE(meetup_id, user_id)
);

-- 创建索引
CREATE INDEX idx_meetups_organizer_id ON meetups(organizer_id);
CREATE INDEX idx_meetups_meeting_time ON meetups(meeting_time);
CREATE INDEX idx_meetups_status ON meetups(status);
CREATE INDEX idx_meetups_meetup_type ON meetups(meetup_type);
CREATE INDEX idx_meetups_location ON meetups(location);

CREATE INDEX idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX idx_meetup_participants_user_id ON meetup_participants(user_id);
CREATE INDEX idx_meetup_participants_status ON meetup_participants(status);

CREATE INDEX idx_meetup_reviews_meetup_id ON meetup_reviews(meetup_id);
CREATE INDEX idx_meetup_reviews_user_id ON meetup_reviews(user_id);

-- 启用行级安全
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略
CREATE POLICY "Users can view active meetups" ON meetups
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create meetups" ON meetups
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their meetups" ON meetups
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can view meetup participants" ON meetup_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join meetups" ON meetup_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave meetups" ON meetup_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view meetup reviews" ON meetup_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create meetup reviews" ON meetup_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 插入一些测试数据
INSERT INTO meetups (organizer_id, title, description, location, meeting_time, max_participants, meetup_type, tags) VALUES
(
    (SELECT id FROM users LIMIT 1),
    'Coffee Chat in Tokyo',
    'Let''s grab a coffee and chat about digital nomad life!',
    'Shibuya, Tokyo',
    NOW() + INTERVAL '2 hours',
    4,
    'coffee',
    ARRAY['coffee', 'casual', 'networking']
),
(
    (SELECT id FROM users LIMIT 1),
    'Co-working Session',
    'Join me for a productive co-working session at a local cafe',
    'Shinjuku, Tokyo',
    NOW() + INTERVAL '1 day',
    6,
    'work',
    ARRAY['work', 'productivity', 'coworking']
);

-- 显示创建结果
SELECT 'Meetups tables created successfully' as result;
SELECT COUNT(*) as meetups_count FROM meetups;
SELECT COUNT(*) as participants_count FROM meetup_participants;
