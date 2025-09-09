-- Check if all required tables exist for the place features
-- This will help us identify missing dependencies

-- Check if users table exists
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN 'EXISTS' ELSE 'MISSING' END as users_table_status;

-- Check if places table exists
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'places'
    ) THEN 'EXISTS' ELSE 'MISSING' END as places_table_status;

-- Check if cities table exists (referenced by places)
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cities'
    ) THEN 'EXISTS' ELSE 'MISSING' END as cities_table_status;

-- Check if storage.buckets table exists (for Supabase Storage)
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'buckets'
    ) THEN 'EXISTS' ELSE 'MISSING' END as storage_buckets_status;

-- Check if storage.objects table exists (for Supabase Storage)
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'objects'
    ) THEN 'EXISTS' ELSE 'MISSING' END as storage_objects_status;
