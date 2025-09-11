-- User preferences and favorites data tables (Fixed Version)
-- For storing user favorites, hidden users, preference settings, etc.

-- 1. User preferences table
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

-- 2. User ratings table
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

-- 3. User reviews table
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

-- 4. Meetups table
CREATE TABLE IF NOT EXISTS meetups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL, -- Will add foreign key constraint later
  city_id UUID, -- Will add foreign key constraint later
  location VARCHAR(255),
  meetup_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Meetup participants table
CREATE TABLE IF NOT EXISTS meetup_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meetup_id UUID NOT NULL, -- Will add foreign key constraint later
  user_id UUID NOT NULL, -- Will add foreign key constraint later
  status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- 6. Meetup reviews table
CREATE TABLE IF NOT EXISTS meetup_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meetup_id UUID NOT NULL, -- Will add foreign key constraint later
  user_id UUID NOT NULL, -- Will add foreign key constraint later
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- 7. Create indexes
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

-- 8. Add update time triggers
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

-- 9. Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;

-- 10. Create basic policies
CREATE POLICY "Allow public read access to user_preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_ratings" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to user_reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetups" ON meetups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetup_participants" ON meetup_participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to meetup_reviews" ON meetup_reviews FOR SELECT USING (true);

-- 11. Add foreign key constraints (after tables are created)
-- Add foreign key constraints for user_preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_preferences_user_id_fkey'
    ) THEN
        ALTER TABLE user_preferences 
        ADD CONSTRAINT user_preferences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for user_ratings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_ratings_user_id_fkey'
    ) THEN
        ALTER TABLE user_ratings 
        ADD CONSTRAINT user_ratings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_ratings_reviewer_id_fkey'
    ) THEN
        ALTER TABLE user_ratings 
        ADD CONSTRAINT user_ratings_reviewer_id_fkey 
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for user_reviews
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_reviews_user_id_fkey'
    ) THEN
        ALTER TABLE user_reviews 
        ADD CONSTRAINT user_reviews_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_reviews_reviewer_id_fkey'
    ) THEN
        ALTER TABLE user_reviews 
        ADD CONSTRAINT user_reviews_reviewer_id_fkey 
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for meetups
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetups_organizer_id_fkey'
    ) THEN
        ALTER TABLE meetups 
        ADD CONSTRAINT meetups_organizer_id_fkey 
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetups_city_id_fkey'
    ) THEN
        ALTER TABLE meetups 
        ADD CONSTRAINT meetups_city_id_fkey 
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for meetup_participants
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetup_participants_meetup_id_fkey'
    ) THEN
        ALTER TABLE meetup_participants 
        ADD CONSTRAINT meetup_participants_meetup_id_fkey 
        FOREIGN KEY (meetup_id) REFERENCES meetups(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetup_participants_user_id_fkey'
    ) THEN
        ALTER TABLE meetup_participants 
        ADD CONSTRAINT meetup_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for meetup_reviews
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetup_reviews_meetup_id_fkey'
    ) THEN
        ALTER TABLE meetup_reviews 
        ADD CONSTRAINT meetup_reviews_meetup_id_fkey 
        FOREIGN KEY (meetup_id) REFERENCES meetups(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetup_reviews_user_id_fkey'
    ) THEN
        ALTER TABLE meetup_reviews 
        ADD CONSTRAINT meetup_reviews_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 12. Add comments
COMMENT ON TABLE user_preferences IS 'User preferences table, stores favorites, hidden users and other preferences';
COMMENT ON TABLE user_ratings IS 'User ratings table, stores rating data between users';
COMMENT ON TABLE user_reviews IS 'User reviews table, stores reviews and comments between users';
COMMENT ON TABLE meetups IS 'Meetups table, stores meetup activity information';
COMMENT ON TABLE meetup_participants IS 'Meetup participants table, stores meetup participation records';
COMMENT ON TABLE meetup_reviews IS 'Meetup reviews table, stores meetup reviews';
