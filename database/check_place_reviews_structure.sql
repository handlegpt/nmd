-- Check the structure of the place_reviews table
-- This will help us understand why the overall_rating column is not found

-- Check if place_reviews table exists and show its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'place_reviews' 
ORDER BY ordinal_position;

-- Check if the overall_rating column exists specifically
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'place_reviews' AND column_name = 'overall_rating'
    ) THEN 'EXISTS' ELSE 'MISSING' END as overall_rating_status;

-- Check all columns in place_reviews table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'place_reviews' 
ORDER BY ordinal_position;
