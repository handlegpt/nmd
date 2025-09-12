-- 简化的聚会表创建脚本
-- 用于修复聚会 API 500 错误

-- 1. 创建 meetups 表
CREATE TABLE IF NOT EXISTS meetups (
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

-- 2. 创建 meetup_participants 表
CREATE TABLE IF NOT EXISTS meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- 防止重复参与者
    UNIQUE(meetup_id, user_id)
);

-- 添加基本索引
CREATE INDEX IF NOT EXISTS idx_meetups_organizer_id ON meetups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_meeting_time ON meetups(meeting_time);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_meetup_type ON meetups(meetup_type);

CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);

-- 启用行级安全
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;

-- 基本 RLS 策略
CREATE POLICY "Users can view all active meetups" ON meetups
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own meetups" ON meetups
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Users can create meetups" ON meetups
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own meetups" ON meetups
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own meetups" ON meetups
    FOR DELETE USING (auth.uid() = organizer_id);

-- meetup_participants 策略
CREATE POLICY "Users can view participants of meetups they're in" ON meetup_participants
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid())
    );

CREATE POLICY "Users can join meetups" ON meetup_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON meetup_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave meetups" ON meetup_participants
    FOR DELETE USING (auth.uid() = user_id);

-- 插入一些测试数据
INSERT INTO meetups (organizer_id, title, description, location, meeting_time, max_participants, meetup_type, tags)
SELECT 
    u.id,
    'Coffee Chat in ' || u.current_city,
    'Let''s grab coffee and chat about digital nomad life!',
    'Local Coffee Shop',
    NOW() + INTERVAL '1 day',
    4,
    'coffee',
    ARRAY['coffee', 'networking', 'casual']
FROM users u
WHERE u.is_visible_in_nomads = true
LIMIT 3;

-- 将组织者添加为参与者
INSERT INTO meetup_participants (meetup_id, user_id, status)
SELECT m.id, m.organizer_id, 'joined'
FROM meetups m
WHERE NOT EXISTS (
    SELECT 1 FROM meetup_participants mp 
    WHERE mp.meetup_id = m.id AND mp.user_id = m.organizer_id
);
