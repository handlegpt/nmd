-- 用户偏好和收藏数据表
-- 用于存储用户的收藏、隐藏用户、偏好设置等数据

-- 1. 用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorites JSONB DEFAULT '[]', -- 收藏的用户ID列表
  hidden_users JSONB DEFAULT '[]', -- 隐藏的用户ID列表
  blocked_users JSONB DEFAULT '[]', -- 屏蔽的用户ID列表
  preferences JSONB DEFAULT '{}', -- 其他偏好设置
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 被评分的用户
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 评分者
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) NOT NULL CHECK (category IN ('professional', 'social', 'reliability', 'communication', 'overall')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reviewer_id, category)
);

-- 3. 用户评价表
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 被评价的用户
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 评价者
  title VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 聚会表
CREATE TABLE IF NOT EXISTS meetups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  location VARCHAR(255),
  meetup_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 聚会参与者表
CREATE TABLE IF NOT EXISTS meetup_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- 6. 聚会评价表
CREATE TABLE IF NOT EXISTS meetup_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewer_id ON user_ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_organizer_id ON meetups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_city_id ON meetups(city_id);
CREATE INDEX IF NOT EXISTS idx_meetups_meetup_date ON meetups(meetup_date);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_meetup_id ON meetup_reviews(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_user_id ON meetup_reviews(user_id);

-- 8. 添加更新时间触发器
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at
    BEFORE UPDATE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetups_updated_at
    BEFORE UPDATE ON meetups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetup_reviews_updated_at
    BEFORE UPDATE ON meetup_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 启用行级安全策略
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;

-- 10. 创建基本策略
CREATE POLICY "Allow public read access to user_preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_ratings" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetups" ON meetups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetup_participants" ON meetup_participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetup_reviews" ON meetup_reviews FOR SELECT USING (true);

-- 11. 添加注释
COMMENT ON TABLE user_preferences IS '用户偏好设置表，存储收藏、隐藏用户等偏好';
COMMENT ON TABLE user_ratings IS '用户评分表，存储用户之间的评分数据';
COMMENT ON TABLE user_reviews IS '用户评价表，存储用户之间的评价和评论';
COMMENT ON TABLE meetups IS '聚会表，存储聚会活动信息';
COMMENT ON TABLE meetup_participants IS '聚会参与者表，存储聚会参与记录';
COMMENT ON TABLE meetup_reviews IS '聚会评价表，存储聚会的评价';
