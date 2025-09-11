-- User preferences and favorites data tables (Safe Version)
-- This version safely handles existing tables and triggers

-- 1. Drop existing triggers if they exist (with proper error handling)
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON user_reviews;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

-- 2. Drop existing tables if they exist (with proper error handling)
DO $$
BEGIN
    DROP TABLE IF EXISTS user_reviews CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

DO $$
BEGIN
    DROP TABLE IF EXISTS user_ratings CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

DO $$
BEGIN
    DROP TABLE IF EXISTS user_preferences CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, ignore
END $$;

-- 3. Create user preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  favorites JSONB DEFAULT '[]', -- List of favorited user IDs
  hidden_users JSONB DEFAULT '[]', -- List of hidden user IDs
  blocked_users JSONB DEFAULT '[]', -- List of blocked user IDs
  preferences JSONB DEFAULT '{}', -- Other preference settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create user ratings table
CREATE TABLE user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- User being rated
  reviewer_id UUID NOT NULL, -- User giving the rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) NOT NULL CHECK (category IN ('professional', 'social', 'reliability', 'communication', 'overall')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reviewer_id, category)
);

-- 5. Create user reviews table
CREATE TABLE user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- User being reviewed
  reviewer_id UUID NOT NULL, -- User writing the review
  title VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewer_id ON user_ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);

-- 7. Add update time triggers
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

-- 8. Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- 9. Create basic policies
CREATE POLICY "Allow public read access to user_preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_ratings" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_reviews" ON user_reviews FOR SELECT USING (true);

-- 10. Add foreign key constraints (with error handling)
DO $$
BEGIN
    ALTER TABLE user_preferences 
    ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists, ignore
END $$;

DO $$
BEGIN
    ALTER TABLE user_ratings 
    ADD CONSTRAINT user_ratings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists, ignore
END $$;

DO $$
BEGIN
    ALTER TABLE user_ratings 
    ADD CONSTRAINT user_ratings_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists, ignore
END $$;

DO $$
BEGIN
    ALTER TABLE user_reviews 
    ADD CONSTRAINT user_reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists, ignore
END $$;

DO $$
BEGIN
    ALTER TABLE user_reviews 
    ADD CONSTRAINT user_reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists, ignore
END $$;

-- 11. Add comments
COMMENT ON TABLE user_preferences IS 'User preferences table, stores favorites, hidden users and other preferences';
COMMENT ON TABLE user_ratings IS 'User ratings table, stores rating data between users';
COMMENT ON TABLE user_reviews IS 'User reviews table, stores reviews and comments between users';
