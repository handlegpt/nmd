-- Check users table structure and constraints
-- Run this to diagnose the organizer_id issue

-- 1. Check if users table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'users';

-- 2. Check users table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check users table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'users';

-- 4. Check if cities table exists (for meetup references)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'cities';

-- 5. Check cities table columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cities'
ORDER BY ordinal_position;
