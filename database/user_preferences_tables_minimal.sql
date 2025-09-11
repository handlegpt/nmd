-- User preferences and favorites data tables (Minimal Version)
-- This version only creates tables if they don't exist, no deletion

-- 1. Create user preferences table (if not exists)
CREATE TABLE IF NOT EXISTS user_preferences (
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

-- 2. Create user ratings table (if not exists)
CREATE TABLE IF NOT EXISTS user_ratings (
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

-- 3. Create user reviews table (if not exists)
CREATE TABLE IF NOT EXISTS user_reviews (
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

-- 4. Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewer_id ON user_ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);

-- 5. Add update time triggers (if not exists)
DO $$
BEGIN
    CREATE TRIGGER update_user_preferences_updated_at
        BEFORE UPDATE ON user_preferences
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Trigger already exists, ignore
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_user_ratings_updated_at
        BEFORE UPDATE ON user_ratings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Trigger already exists, ignore
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_user_reviews_updated_at
        BEFORE UPDATE ON user_reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Trigger already exists, ignore
END $$;

-- 6. Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- 7. Create basic policies (if not exists)
DO $$
BEGIN
    CREATE POLICY "Allow public read access to user_preferences" ON user_preferences FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Policy already exists, ignore
END $$;

DO $$
BEGIN
    CREATE POLICY "Allow public read access to user_ratings" ON user_ratings FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Policy already exists, ignore
END $$;

DO $$
BEGIN
    CREATE POLICY "Allow public read access to user_reviews" ON user_reviews FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Policy already exists, ignore
END $$;

-- 8. Add foreign key constraints (if not exists)
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

-- 9. Add comments
COMMENT ON TABLE user_preferences IS 'User preferences table, stores favorites, hidden users and other preferences';
COMMENT ON TABLE user_ratings IS 'User ratings table, stores rating data between users';
COMMENT ON TABLE user_reviews IS 'User reviews table, stores reviews and comments between users';
