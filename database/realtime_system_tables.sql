-- Real-time System Tables
-- 实时系统数据库表

-- 1. User Activity Table - 用户活动表
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'login', 'logout', 'profile_update', 'meetup_join', 'meetup_leave',
        'rating_given', 'review_posted', 'city_visit', 'place_checkin',
        'invitation_sent', 'invitation_accepted', 'invitation_declined'
    )),
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Online Users Table - 在线用户表 (临时状态)
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

-- 3. Leaderboard Table - 排行榜表
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    score INTEGER DEFAULT 0,
    rank_position INTEGER,
    category VARCHAR(50) DEFAULT 'overall' CHECK (category IN ('overall', 'meetups', 'reviews', 'activity')),
    period VARCHAR(20) DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    stats JSONB DEFAULT '{}',
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activity Events Table - 活动事件表 (用于实时通知)
CREATE TABLE IF NOT EXISTS activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'new_meetup', 'meetup_reminder', 'new_rating', 'new_review',
        'invitation_received', 'invitation_accepted', 'friend_online',
        'city_update', 'place_recommendation'
    )),
    event_data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_type ON user_activity(user_id, activity_type);

CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_status ON online_users(status);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_online_users_updated_at ON online_users(updated_at);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard(category, period);

CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_is_read ON activity_events(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_events_expires_at ON activity_events(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity" ON user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" ON user_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for online_users
CREATE POLICY "Users can view all online users" ON online_users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own online status" ON online_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own online status" ON online_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own online status" ON online_users
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leaderboard
CREATE POLICY "Users can view all leaderboard entries" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboard" ON leaderboard
    FOR ALL USING (true);

-- RLS Policies for activity_events
CREATE POLICY "Users can view their own events" ON activity_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON activity_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create events" ON activity_events
    FOR INSERT WITH CHECK (true);

-- Function to update user's online status
CREATE OR REPLACE FUNCTION update_user_online_status(
    user_uuid UUID,
    user_status VARCHAR(20) DEFAULT 'online',
    location_data JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO online_users (user_id, status, location_data, device_info, last_seen, updated_at)
    VALUES (user_uuid, user_status, location_data, device_info, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        status = EXCLUDED.status,
        location_data = EXCLUDED.location_data,
        device_info = EXCLUDED.device_info,
        last_seen = EXCLUDED.last_seen,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to mark users as offline (older than 5 minutes)
CREATE OR REPLACE FUNCTION mark_offline_users()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE online_users 
    SET status = 'offline', updated_at = NOW()
    WHERE last_seen < NOW() - INTERVAL '5 minutes' AND status != 'offline';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate leaderboard scores
CREATE OR REPLACE FUNCTION calculate_leaderboard_scores()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    user_score INTEGER;
    user_rank INTEGER;
BEGIN
    -- Clear existing leaderboard
    DELETE FROM leaderboard WHERE period = 'all_time';
    
    -- Calculate scores for each user
    FOR user_record IN 
        SELECT u.id, u.name,
            COALESCE(meetup_count, 0) * 10 +
            COALESCE(review_count, 0) * 5 +
            COALESCE(rating_count, 0) * 3 +
            COALESCE(activity_count, 0) * 1 as calculated_score
        FROM users u
        LEFT JOIN (
            SELECT organizer_id, COUNT(*) as meetup_count
            FROM meetups 
            WHERE status = 'completed'
            GROUP BY organizer_id
        ) m ON u.id = m.organizer_id
        LEFT JOIN (
            SELECT reviewer_id, COUNT(*) as review_count
            FROM user_reviews
            GROUP BY reviewer_id
        ) r ON u.id = r.reviewer_id
        LEFT JOIN (
            SELECT rater_id, COUNT(*) as rating_count
            FROM user_ratings
            GROUP BY rater_id
        ) rt ON u.id = rt.rater_id
        LEFT JOIN (
            SELECT user_id, COUNT(*) as activity_count
            FROM user_activity
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY user_id
        ) a ON u.id = a.user_id
        WHERE u.is_visible_in_nomads = true
    LOOP
        -- Insert leaderboard entry
        INSERT INTO leaderboard (user_id, score, category, period, stats, last_calculated)
        VALUES (
            user_record.id, 
            user_record.calculated_score,
            'overall',
            'all_time',
            jsonb_build_object(
                'meetups', COALESCE((SELECT COUNT(*) FROM meetups WHERE organizer_id = user_record.id AND status = 'completed'), 0),
                'reviews', COALESCE((SELECT COUNT(*) FROM user_reviews WHERE reviewer_id = user_record.id), 0),
                'ratings', COALESCE((SELECT COUNT(*) FROM user_ratings WHERE rater_id = user_record.id), 0),
                'activities', COALESCE((SELECT COUNT(*) FROM user_activity WHERE user_id = user_record.id AND created_at > NOW() - INTERVAL '30 days'), 0)
            ),
            NOW()
        );
    END LOOP;
    
    -- Update rank positions
    WITH ranked_users AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
        FROM leaderboard 
        WHERE period = 'all_time'
    )
    UPDATE leaderboard 
    SET rank_position = ranked_users.new_rank
    FROM ranked_users 
    WHERE leaderboard.id = ranked_users.id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired activity events
CREATE OR REPLACE FUNCTION cleanup_expired_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM activity_events 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_online_users_updated_at ON online_users;
CREATE TRIGGER update_online_users_updated_at
    BEFORE UPDATE ON online_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
