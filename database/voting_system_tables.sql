-- Voting System Tables
-- 投票系统数据库表

-- 1. City Votes Table - 城市投票表
CREATE TABLE IF NOT EXISTS city_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'neutral')),
    vote_weight INTEGER DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate votes from same user for same city
    UNIQUE(city_id, user_id)
);

-- 2. Place Votes Table - 地点投票表
CREATE TABLE IF NOT EXISTS place_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'neutral')),
    vote_weight INTEGER DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate votes from same user for same place
    UNIQUE(place_id, user_id)
);

-- 3. Vote Summaries Table - 投票摘要表 (自动计算)
CREATE TABLE IF NOT EXISTS vote_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL, -- Can be city_id or place_id
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('city', 'place')),
    total_votes INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    neutral_votes INTEGER DEFAULT 0,
    weighted_score DECIMAL(10,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique target
    UNIQUE(target_id, target_type)
);

-- 4. User Vote History Table - 用户投票历史表
CREATE TABLE IF NOT EXISTS user_vote_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('city', 'place')),
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'neutral')),
    vote_weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for user vote history
    INDEX idx_user_vote_history_user_target (user_id, target_id, target_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_city_votes_city_id ON city_votes(city_id);
CREATE INDEX IF NOT EXISTS idx_city_votes_user_id ON city_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_city_votes_type ON city_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_city_votes_created_at ON city_votes(created_at);

CREATE INDEX IF NOT EXISTS idx_place_votes_place_id ON place_votes(place_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_user_id ON place_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_type ON place_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_place_votes_created_at ON place_votes(created_at);

CREATE INDEX IF NOT EXISTS idx_vote_summaries_target ON vote_summaries(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_type ON vote_summaries(target_type);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_score ON vote_summaries(weighted_score DESC);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_rating ON vote_summaries(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_user_vote_history_user_id ON user_vote_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vote_history_target ON user_vote_history(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_vote_history_created_at ON user_vote_history(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE city_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vote_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for city_votes
CREATE POLICY "Users can view all city votes" ON city_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create city votes" ON city_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own city votes" ON city_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own city votes" ON city_votes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for place_votes
CREATE POLICY "Users can view all place votes" ON place_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create place votes" ON place_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own place votes" ON place_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own place votes" ON place_votes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vote_summaries
CREATE POLICY "Users can view all vote summaries" ON vote_summaries
    FOR SELECT USING (true);

CREATE POLICY "System can manage vote summaries" ON vote_summaries
    FOR ALL USING (true);

-- RLS Policies for user_vote_history
CREATE POLICY "Users can view their own vote history" ON user_vote_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create vote history" ON user_vote_history
    FOR INSERT WITH CHECK (true);

-- Function to update vote summaries
CREATE OR REPLACE FUNCTION update_vote_summary(target_uuid UUID, target_type_param VARCHAR(10))
RETURNS VOID AS $$
DECLARE
    total_count INTEGER;
    upvote_count INTEGER;
    downvote_count INTEGER;
    neutral_count INTEGER;
    weighted_total DECIMAL(10,2);
    avg_rating DECIMAL(3,2);
BEGIN
    IF target_type_param = 'city' THEN
        -- Calculate city vote statistics
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE vote_type = 'upvote'),
            COUNT(*) FILTER (WHERE vote_type = 'downvote'),
            COUNT(*) FILTER (WHERE vote_type = 'neutral'),
            COALESCE(SUM(
                CASE 
                    WHEN vote_type = 'upvote' THEN vote_weight
                    WHEN vote_type = 'downvote' THEN -vote_weight
                    ELSE 0
                END
            ), 0),
            COALESCE(AVG(
                CASE 
                    WHEN vote_type = 'upvote' THEN vote_weight
                    WHEN vote_type = 'downvote' THEN 0
                    ELSE vote_weight * 0.5
                END
            ), 0.00)
        INTO total_count, upvote_count, downvote_count, neutral_count, weighted_total, avg_rating
        FROM city_votes 
        WHERE city_id = target_uuid;
    ELSE
        -- Calculate place vote statistics
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE vote_type = 'upvote'),
            COUNT(*) FILTER (WHERE vote_type = 'downvote'),
            COUNT(*) FILTER (WHERE vote_type = 'neutral'),
            COALESCE(SUM(
                CASE 
                    WHEN vote_type = 'upvote' THEN vote_weight
                    WHEN vote_type = 'downvote' THEN -vote_weight
                    ELSE 0
                END
            ), 0),
            COALESCE(AVG(
                CASE 
                    WHEN vote_type = 'upvote' THEN vote_weight
                    WHEN vote_type = 'downvote' THEN 0
                    ELSE vote_weight * 0.5
                END
            ), 0.00)
        INTO total_count, upvote_count, downvote_count, neutral_count, weighted_total, avg_rating
        FROM place_votes 
        WHERE place_id = target_uuid;
    END IF;

    -- Insert or update vote summary
    INSERT INTO vote_summaries (
        target_id, target_type, total_votes, upvotes, downvotes, neutral_votes,
        weighted_score, average_rating, last_calculated, updated_at
    ) VALUES (
        target_uuid, target_type_param, total_count, upvote_count, downvote_count, neutral_count,
        weighted_total, avg_rating, NOW(), NOW()
    )
    ON CONFLICT (target_id, target_type) DO UPDATE SET
        total_votes = EXCLUDED.total_votes,
        upvotes = EXCLUDED.upvotes,
        downvotes = EXCLUDED.downvotes,
        neutral_votes = EXCLUDED.neutral_votes,
        weighted_score = EXCLUDED.weighted_score,
        average_rating = EXCLUDED.average_rating,
        last_calculated = EXCLUDED.last_calculated,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to record vote history
CREATE OR REPLACE FUNCTION record_vote_history(
    user_uuid UUID,
    target_uuid UUID,
    target_type_param VARCHAR(10),
    vote_type_param VARCHAR(20),
    vote_weight_param INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_vote_history (user_id, target_id, target_type, vote_type, vote_weight)
    VALUES (user_uuid, target_uuid, target_type_param, vote_type_param, vote_weight_param);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote summaries when city votes change
CREATE OR REPLACE FUNCTION trigger_update_city_vote_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_vote_summary(NEW.city_id, 'city');
        PERFORM record_vote_history(NEW.user_id, NEW.city_id, 'city', NEW.vote_type, NEW.vote_weight);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_vote_summary(OLD.city_id, 'city');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote summaries when place votes change
CREATE OR REPLACE FUNCTION trigger_update_place_vote_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_vote_summary(NEW.place_id, 'place');
        PERFORM record_vote_history(NEW.user_id, NEW.place_id, 'place', NEW.vote_type, NEW.vote_weight);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_vote_summary(OLD.place_id, 'place');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_city_vote_summary_trigger ON city_votes;
CREATE TRIGGER update_city_vote_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON city_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_city_vote_summary();

DROP TRIGGER IF EXISTS update_place_vote_summary_trigger ON place_votes;
CREATE TRIGGER update_place_vote_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON place_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_place_vote_summary();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_city_votes_updated_at ON city_votes;
CREATE TRIGGER update_city_votes_updated_at
    BEFORE UPDATE ON city_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_votes_updated_at ON place_votes;
CREATE TRIGGER update_place_votes_updated_at
    BEFORE UPDATE ON place_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vote_summaries_updated_at ON vote_summaries;
CREATE TRIGGER update_vote_summaries_updated_at
    BEFORE UPDATE ON vote_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
