-- User Ratings and Reviews System Tables
-- 用户评分和评论系统数据库表

-- 1. User Ratings Table - 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rater_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rated_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('communication', 'reliability', 'friendliness', 'professionalism', 'overall')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate ratings from same user for same category
    UNIQUE(rater_id, rated_user_id, category)
);

-- 2. User Reviews Table - 用户评论表
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reviewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate reviews from same user
    UNIQUE(reviewer_id, reviewed_user_id)
);

-- 3. Rating Summaries Table - 评分摘要表 (自动计算)
CREATE TABLE IF NOT EXISTS rating_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    overall_rating DECIMAL(3,2) DEFAULT 0.00,
    communication_rating DECIMAL(3,2) DEFAULT 0.00,
    reliability_rating DECIMAL(3,2) DEFAULT 0.00,
    friendliness_rating DECIMAL(3,2) DEFAULT 0.00,
    professionalism_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_id ON user_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_category ON user_ratings(category);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON user_ratings(created_at);

CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewed_user_id ON user_reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_rating_summaries_user_id ON rating_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_summaries_overall_rating ON rating_summaries(overall_rating);

-- Enable Row Level Security (RLS)
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ratings
CREATE POLICY "Users can view all ratings" ON user_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for others" ON user_ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_id AND auth.uid() != rated_user_id);

CREATE POLICY "Users can update their own ratings" ON user_ratings
    FOR UPDATE USING (auth.uid() = rater_id);

CREATE POLICY "Users can delete their own ratings" ON user_ratings
    FOR DELETE USING (auth.uid() = rater_id);

-- RLS Policies for user_reviews
CREATE POLICY "Users can view all public reviews" ON user_reviews
    FOR SELECT USING (is_public = true OR auth.uid() = reviewer_id OR auth.uid() = reviewed_user_id);

CREATE POLICY "Users can create reviews for others" ON user_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != reviewed_user_id);

CREATE POLICY "Users can update their own reviews" ON user_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON user_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- RLS Policies for rating_summaries
CREATE POLICY "Users can view all rating summaries" ON rating_summaries
    FOR SELECT USING (true);

CREATE POLICY "System can manage rating summaries" ON rating_summaries
    FOR ALL USING (true);

-- Function to update rating summaries
CREATE OR REPLACE FUNCTION update_rating_summary(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    overall_avg DECIMAL(3,2);
    comm_avg DECIMAL(3,2);
    rel_avg DECIMAL(3,2);
    friend_avg DECIMAL(3,2);
    prof_avg DECIMAL(3,2);
    total_ratings_count INTEGER;
    total_reviews_count INTEGER;
BEGIN
    -- Calculate averages for each category
    SELECT 
        COALESCE(AVG(CASE WHEN category = 'overall' THEN rating END), 0.00),
        COALESCE(AVG(CASE WHEN category = 'communication' THEN rating END), 0.00),
        COALESCE(AVG(CASE WHEN category = 'reliability' THEN rating END), 0.00),
        COALESCE(AVG(CASE WHEN category = 'friendliness' THEN rating END), 0.00),
        COALESCE(AVG(CASE WHEN category = 'professionalism' THEN rating END), 0.00),
        COUNT(*)
    INTO overall_avg, comm_avg, rel_avg, friend_avg, prof_avg, total_ratings_count
    FROM user_ratings 
    WHERE rated_user_id = user_uuid;

    -- Count reviews
    SELECT COUNT(*) INTO total_reviews_count
    FROM user_reviews 
    WHERE reviewed_user_id = user_uuid;

    -- Insert or update rating summary
    INSERT INTO rating_summaries (
        user_id, overall_rating, communication_rating, reliability_rating, 
        friendliness_rating, professionalism_rating, total_ratings, total_reviews,
        last_calculated, updated_at
    ) VALUES (
        user_uuid, overall_avg, comm_avg, rel_avg, friend_avg, prof_avg,
        total_ratings_count, total_reviews_count, NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        overall_rating = EXCLUDED.overall_rating,
        communication_rating = EXCLUDED.communication_rating,
        reliability_rating = EXCLUDED.reliability_rating,
        friendliness_rating = EXCLUDED.friendliness_rating,
        professionalism_rating = EXCLUDED.professionalism_rating,
        total_ratings = EXCLUDED.total_ratings,
        total_reviews = EXCLUDED.total_reviews,
        last_calculated = EXCLUDED.last_calculated,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update rating summaries when ratings change
CREATE OR REPLACE FUNCTION trigger_update_rating_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_rating_summary(NEW.rated_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_rating_summary(OLD.rated_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_rating_summary_trigger ON user_ratings;
CREATE TRIGGER update_rating_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_rating_summary();

-- Trigger for reviews
DROP TRIGGER IF EXISTS update_rating_summary_reviews_trigger ON user_reviews;
CREATE TRIGGER update_rating_summary_reviews_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_rating_summary();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
CREATE TRIGGER update_user_ratings_updated_at
    BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON user_reviews;
CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rating_summaries_updated_at ON rating_summaries;
CREATE TRIGGER update_rating_summaries_updated_at
    BEFORE UPDATE ON rating_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
