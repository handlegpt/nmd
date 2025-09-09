-- Check the current structure of the places table
-- This will help us understand what columns exist

-- Check if places table exists and show its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Check if the new columns we need exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'rating'
    ) THEN 'EXISTS' ELSE 'MISSING' END as rating_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'review_count'
    ) THEN 'EXISTS' ELSE 'MISSING' END as review_count_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'outlets'
    ) THEN 'EXISTS' ELSE 'MISSING' END as outlets_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'long_stay_ok'
    ) THEN 'EXISTS' ELSE 'MISSING' END as long_stay_ok_status;
