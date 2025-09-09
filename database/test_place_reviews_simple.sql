-- Test creating place_reviews table with minimal constraints
-- This will help us identify if the issue is with the constraints

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS place_reviews CASCADE;

-- Create place_reviews table with minimal constraints
CREATE TABLE place_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  rating_wifi INTEGER NOT NULL,
  rating_environment INTEGER NOT NULL,
  rating_social INTEGER NOT NULL,
  rating_value INTEGER NOT NULL,
  overall_rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  check_in_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the table was created successfully
SELECT 'place_reviews table created successfully with minimal constraints' as status;

-- Show the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'place_reviews' 
ORDER BY ordinal_position;
