-- Detailed check of place_reviews table structure
-- This will help us understand why the columns don't exist

-- Check if place_reviews table exists
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'place_reviews'
    ) THEN 'EXISTS' ELSE 'MISSING' END as place_reviews_table_status;

-- If table exists, show its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'place_reviews' 
ORDER BY ordinal_position;

-- Check specific columns that should exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'place_reviews' AND column_name = 'rating_wifi'
    ) THEN 'EXISTS' ELSE 'MISSING' END as rating_wifi_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'place_reviews' AND column_name = 'overall_rating'
    ) THEN 'EXISTS' ELSE 'MISSING' END as overall_rating_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'place_reviews' AND column_name = 'id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as id_status;

-- Show all tables that start with 'place'
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'place%' 
ORDER BY table_name;
