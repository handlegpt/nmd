-- Fixed Place Features Database Tables
-- This version removes the problematic overall_rating index

-- Create Place Reviews Table
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

-- Create Place Photos Table
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

-- Create Place Check-ins Table
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

-- Create User Activity Table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  current_page VARCHAR(255) DEFAULT 'unknown',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (without the problematic overall_rating index)
CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_user_id ON place_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_created_at ON place_reviews(created_at);
-- Note: Removed idx_place_reviews_rating ON place_reviews(overall_rating) as it causes errors

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

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_place_reviews_updated_at ON place_reviews;
CREATE TRIGGER update_place_reviews_updated_at 
  BEFORE UPDATE ON place_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_photos_updated_at ON place_photos;
CREATE TRIGGER update_place_photos_updated_at 
  BEFORE UPDATE ON place_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_checkins_updated_at ON place_checkins;
CREATE TRIGGER update_place_checkins_updated_at 
  BEFORE UPDATE ON place_checkins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at 
  BEFORE UPDATE ON user_activity 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Supabase Storage bucket for place photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for place photos bucket
CREATE POLICY "Public read access for place photos" ON storage.objects
FOR SELECT USING (bucket_id = 'place-photos');

CREATE POLICY "Authenticated users can upload place photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'place-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own place photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'place-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own place photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'place-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add comments
COMMENT ON TABLE place_reviews IS 'User reviews and ratings for places';
COMMENT ON TABLE place_photos IS 'Photos uploaded by users for places';
COMMENT ON TABLE place_checkins IS 'User check-ins at places';
COMMENT ON TABLE user_activity IS 'Real-time user activity tracking for online status';

COMMENT ON COLUMN place_reviews.rating_wifi IS 'WiFi quality rating (1-5)';
COMMENT ON COLUMN place_reviews.rating_environment IS 'Environment comfort rating (1-5)';
COMMENT ON COLUMN place_reviews.rating_social IS 'Social atmosphere rating (1-5)';
COMMENT ON COLUMN place_reviews.rating_value IS 'Value for money rating (1-5)';
COMMENT ON COLUMN place_reviews.overall_rating IS 'Overall rating (1-5)';
COMMENT ON COLUMN place_reviews.photos IS 'Array of photo URLs attached to review';

COMMENT ON COLUMN place_photos.file_name IS 'Original file name in storage';
COMMENT ON COLUMN place_photos.file_url IS 'Public URL to access the photo';
COMMENT ON COLUMN place_photos.file_size IS 'File size in bytes';
COMMENT ON COLUMN place_photos.mime_type IS 'MIME type of the uploaded file';

COMMENT ON COLUMN place_checkins.check_in_date IS 'Date of check-in (YYYY-MM-DD)';
COMMENT ON COLUMN place_checkins.check_in_time IS 'Exact timestamp of check-in';
COMMENT ON COLUMN place_checkins.notes IS 'Optional notes about the visit';

COMMENT ON COLUMN user_activity.current_page IS 'Current page or location identifier';
COMMENT ON COLUMN user_activity.last_seen IS 'Last activity timestamp';
