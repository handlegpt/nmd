-- Test creating only the place_reviews table
-- This will help us identify if there's an issue with the table definition

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS place_reviews CASCADE;

-- Create place_reviews table with a simpler definition
CREATE TABLE place_reviews (
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

-- Check if the table was created successfully
SELECT 'place_reviews table created successfully' as status;

-- Show the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'place_reviews' 
ORDER BY ordinal_position;
