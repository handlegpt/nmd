-- Test creating all tables one by one to identify the problematic part
-- This will help us find exactly where the error occurs

-- Test 1: Create place_reviews table (already tested - should work)
CREATE TABLE IF NOT EXISTS place_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  rating_wifi INTEGER NOT NULL CHECK (rating_wifi >= 1 AND rating_wifi <= 5),
  rating_environment INTEGER NOT NULL CHECK (rating_environment >= 1 AND rating_environment <= 5),
  rating_social INTEGER NOT NULL CHECK (rating_social >= 1 AND rating_social <= 5),
  rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comment TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  check_in_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(place_id, user_id, check_in_date)
);

-- Test 2: Create place_photos table
CREATE TABLE IF NOT EXISTS place_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test 3: Create place_checkins table
CREATE TABLE IF NOT EXISTS place_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  check_in_date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(place_id, user_id, check_in_date)
);

-- Test 4: Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  current_page VARCHAR(255) DEFAULT 'unknown',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test 5: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_user_id ON place_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_created_at ON place_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_place_reviews_rating ON place_reviews(overall_rating);

CREATE INDEX IF NOT EXISTS idx_place_photos_place_id ON place_photos(place_id);
CREATE INDEX IF NOT EXISTS idx_place_photos_user_id ON place_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_place_photos_created_at ON place_photos(created_at);

CREATE INDEX IF NOT EXISTS idx_place_checkins_place_id ON place_checkins(place_id);
CREATE INDEX IF NOT EXISTS idx_place_checkins_user_id ON place_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_place_checkins_date ON place_checkins(check_in_date);
CREATE INDEX IF NOT EXISTS idx_place_checkins_time ON place_checkins(check_in_time);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_current_page ON user_activity(current_page);

-- Test 6: Check if all tables were created successfully
SELECT 'All tables created successfully' as status;
