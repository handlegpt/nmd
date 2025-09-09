-- Test creating indexes one by one to identify the problematic index
-- This will help us find exactly which index is causing the error

-- Test 1: Basic indexes for place_reviews (should work)
CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON place_reviews(place_id);
SELECT 'idx_place_reviews_place_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_reviews_user_id ON place_reviews(user_id);
SELECT 'idx_place_reviews_user_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_reviews_created_at ON place_reviews(created_at);
SELECT 'idx_place_reviews_created_at created successfully' as status;

-- Test 2: This might be the problematic one - overall_rating index
CREATE INDEX IF NOT EXISTS idx_place_reviews_rating ON place_reviews(overall_rating);
SELECT 'idx_place_reviews_rating created successfully' as status;

-- Test 3: Indexes for place_photos (should work)
CREATE INDEX IF NOT EXISTS idx_place_photos_place_id ON place_photos(place_id);
SELECT 'idx_place_photos_place_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_photos_user_id ON place_photos(user_id);
SELECT 'idx_place_photos_user_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_photos_created_at ON place_photos(created_at);
SELECT 'idx_place_photos_created_at created successfully' as status;

-- Test 4: Indexes for place_checkins (should work)
CREATE INDEX IF NOT EXISTS idx_place_checkins_place_id ON place_checkins(place_id);
SELECT 'idx_place_checkins_place_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_checkins_user_id ON place_checkins(user_id);
SELECT 'idx_place_checkins_user_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_checkins_date ON place_checkins(check_in_date);
SELECT 'idx_place_checkins_date created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_place_checkins_time ON place_checkins(check_in_time);
SELECT 'idx_place_checkins_time created successfully' as status;

-- Test 5: Indexes for user_activity (should work)
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
SELECT 'idx_user_activity_user_id created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
SELECT 'idx_user_activity_last_seen created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_user_activity_current_page ON user_activity(current_page);
SELECT 'idx_user_activity_current_page created successfully' as status;
