-- Test creating indexes only (assuming tables already exist)
-- This will help us identify if the error is in index creation

-- Test creating indexes for place_reviews
CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_user_id ON place_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_created_at ON place_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_place_reviews_rating ON place_reviews(overall_rating);

-- Test creating indexes for place_photos
CREATE INDEX IF NOT EXISTS idx_place_photos_place_id ON place_photos(place_id);
CREATE INDEX IF NOT EXISTS idx_place_photos_user_id ON place_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_place_photos_created_at ON place_photos(created_at);

-- Test creating indexes for place_checkins
CREATE INDEX IF NOT EXISTS idx_place_checkins_place_id ON place_checkins(place_id);
CREATE INDEX IF NOT EXISTS idx_place_checkins_user_id ON place_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_place_checkins_date ON place_checkins(check_in_date);
CREATE INDEX IF NOT EXISTS idx_place_checkins_time ON place_checkins(check_in_time);

-- Test creating indexes for user_activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_current_page ON user_activity(current_page);

-- Check if all indexes were created successfully
SELECT 'All indexes created successfully' as status;
