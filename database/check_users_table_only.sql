-- Check users table structure only
-- Run this to see the actual users table structure

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

-- 4. Check users table data (first 5 rows)
SELECT * FROM users LIMIT 5;
