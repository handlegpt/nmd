-- Setup City Ratings and Reviews System
-- This script creates tables for user ratings, reviews, and dynamic ranking

-- ========================================
-- CITY RATINGS TABLE
-- ========================================

-- Create city_ratings table for user ratings
CREATE TABLE IF NOT EXISTS city_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    overall_rating DECIMAL(2,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
    cost_rating DECIMAL(2,1) CHECK (cost_rating >= 1 AND cost_rating <= 5),
    internet_rating DECIMAL(2,1) CHECK (internet_rating >= 1 AND internet_rating <= 5),
    safety_rating DECIMAL(2,1) CHECK (safety_rating >= 1 AND safety_rating <= 5),
    community_rating DECIMAL(2,1) CHECK (community_rating >= 1 AND community_rating <= 5),
    weather_rating DECIMAL(2,1) CHECK (weather_rating >= 1 AND weather_rating <= 5),
    food_rating DECIMAL(2,1) CHECK (food_rating >= 1 AND food_rating <= 5),
    transport_rating DECIMAL(2,1) CHECK (transport_rating >= 1 AND transport_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, user_id)
);

-- ========================================
-- CITY REVIEWS TABLE
-- ========================================

-- Create city_reviews table for user reviews
CREATE TABLE IF NOT EXISTS city_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    pros TEXT[], -- Array of pros
    cons TEXT[], -- Array of cons
    visit_duration VARCHAR(50), -- e.g., "3 months", "1 year"
    visit_date DATE,
    is_verified_visit BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CITY REVIEW VOTES TABLE
-- ========================================

-- Create city_review_votes table for helpful votes
CREATE TABLE IF NOT EXISTS city_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES city_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- ========================================
-- CITY STATISTICS TABLE
-- ========================================

-- Create city_statistics table for aggregated data
CREATE TABLE IF NOT EXISTS city_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    total_ratings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_overall_rating DECIMAL(3,2) DEFAULT 0,
    average_cost_rating DECIMAL(3,2) DEFAULT 0,
    average_internet_rating DECIMAL(3,2) DEFAULT 0,
    average_safety_rating DECIMAL(3,2) DEFAULT 0,
    average_community_rating DECIMAL(3,2) DEFAULT 0,
    average_weather_rating DECIMAL(3,2) DEFAULT 0,
    average_food_rating DECIMAL(3,2) DEFAULT 0,
    average_transport_rating DECIMAL(3,2) DEFAULT 0,
    dynamic_nomad_score DECIMAL(3,1) DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id)
);

-- ========================================
-- INDEXES
-- ========================================

-- Indexes for city_ratings
CREATE INDEX IF NOT EXISTS idx_city_ratings_city_id ON city_ratings(city_id);
CREATE INDEX IF NOT EXISTS idx_city_ratings_user_id ON city_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_city_ratings_overall_rating ON city_ratings(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_city_ratings_created_at ON city_ratings(created_at DESC);

-- Indexes for city_reviews
CREATE INDEX IF NOT EXISTS idx_city_reviews_city_id ON city_reviews(city_id);
CREATE INDEX IF NOT EXISTS idx_city_reviews_user_id ON city_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_city_reviews_created_at ON city_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_reviews_helpful_votes ON city_reviews(helpful_votes DESC);

-- Indexes for city_review_votes
CREATE INDEX IF NOT EXISTS idx_city_review_votes_review_id ON city_review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_city_review_votes_user_id ON city_review_votes(user_id);

-- Indexes for city_statistics
CREATE INDEX IF NOT EXISTS idx_city_statistics_dynamic_nomad_score ON city_statistics(dynamic_nomad_score DESC);
CREATE INDEX IF NOT EXISTS idx_city_statistics_total_ratings ON city_statistics(total_ratings DESC);

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to update city statistics when ratings change
CREATE OR REPLACE FUNCTION update_city_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update city statistics
    INSERT INTO city_statistics (
        city_id,
        total_ratings,
        total_reviews,
        average_overall_rating,
        average_cost_rating,
        average_internet_rating,
        average_safety_rating,
        average_community_rating,
        average_weather_rating,
        average_food_rating,
        average_transport_rating,
        dynamic_nomad_score,
        last_calculated
    )
    SELECT 
        NEW.city_id,
        COUNT(r.id) as total_ratings,
        COUNT(rev.id) as total_reviews,
        ROUND(AVG(r.overall_rating), 2) as average_overall_rating,
        ROUND(AVG(r.cost_rating), 2) as average_cost_rating,
        ROUND(AVG(r.internet_rating), 2) as average_internet_rating,
        ROUND(AVG(r.safety_rating), 2) as average_safety_rating,
        ROUND(AVG(r.community_rating), 2) as average_community_rating,
        ROUND(AVG(r.weather_rating), 2) as average_weather_rating,
        ROUND(AVG(r.food_rating), 2) as average_food_rating,
        ROUND(AVG(r.transport_rating), 2) as average_transport_rating,
        ROUND(
            (AVG(r.overall_rating) * 0.3 +
             AVG(r.cost_rating) * 0.2 +
             AVG(r.internet_rating) * 0.15 +
             AVG(r.safety_rating) * 0.15 +
             AVG(r.community_rating) * 0.1 +
             AVG(r.weather_rating) * 0.05 +
             AVG(r.food_rating) * 0.03 +
             AVG(r.transport_rating) * 0.02) * 2, 1
        ) as dynamic_nomad_score,
        NOW() as last_calculated
    FROM cities c
    LEFT JOIN city_ratings r ON c.id = r.city_id
    LEFT JOIN city_reviews rev ON c.id = rev.city_id
    WHERE c.id = NEW.city_id
    GROUP BY c.id
    ON CONFLICT (city_id) DO UPDATE SET
        total_ratings = EXCLUDED.total_ratings,
        total_reviews = EXCLUDED.total_reviews,
        average_overall_rating = EXCLUDED.average_overall_rating,
        average_cost_rating = EXCLUDED.average_cost_rating,
        average_internet_rating = EXCLUDED.average_internet_rating,
        average_safety_rating = EXCLUDED.average_safety_rating,
        average_community_rating = EXCLUDED.average_community_rating,
        average_weather_rating = EXCLUDED.average_weather_rating,
        average_food_rating = EXCLUDED.average_food_rating,
        average_transport_rating = EXCLUDED.average_transport_rating,
        dynamic_nomad_score = EXCLUDED.dynamic_nomad_score,
        last_calculated = EXCLUDED.last_calculated;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for city_ratings
CREATE TRIGGER trigger_update_city_statistics_ratings
    AFTER INSERT OR UPDATE OR DELETE ON city_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_city_statistics();

-- Trigger for city_reviews
CREATE TRIGGER trigger_update_city_statistics_reviews
    AFTER INSERT OR UPDATE OR DELETE ON city_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_city_statistics();

-- Function to update review helpful votes
CREATE OR REPLACE FUNCTION update_review_helpful_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE city_reviews 
    SET helpful_votes = (
        SELECT COUNT(*) 
        FROM city_review_votes 
        WHERE review_id = NEW.review_id AND is_helpful = true
    )
    WHERE id = NEW.review_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review votes
CREATE TRIGGER trigger_update_review_helpful_votes
    AFTER INSERT OR UPDATE OR DELETE ON city_review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_votes();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE city_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for city_ratings
CREATE POLICY "Users can view all city ratings" ON city_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" ON city_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON city_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON city_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for city_reviews
CREATE POLICY "Users can view all city reviews" ON city_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON city_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON city_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON city_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for city_review_votes
CREATE POLICY "Users can view all review votes" ON city_review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON city_review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON city_review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON city_review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for city_statistics (read-only for users)
CREATE POLICY "Users can view city statistics" ON city_statistics
    FOR SELECT USING (true);

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample ratings for existing cities (if any)
-- This will be populated when users start rating cities

COMMENT ON TABLE city_ratings IS 'User ratings for cities with multiple criteria';
COMMENT ON TABLE city_reviews IS 'User reviews for cities with pros/cons and visit details';
COMMENT ON TABLE city_review_votes IS 'Helpful votes for city reviews';
COMMENT ON TABLE city_statistics IS 'Aggregated statistics and dynamic scores for cities';
