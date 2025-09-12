-- Check users table structure
-- 检查users表结构

-- Check if users table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if users table has the required columns
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
    ) THEN '✅ id column exists' ELSE '❌ id column missing' END as id_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
    ) THEN '✅ name column exists' ELSE '❌ name column missing' END as name_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN '✅ email column exists' ELSE '❌ email column missing' END as email_status;

-- Check if users table has primary key
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' 
        AND tc.constraint_type = 'PRIMARY KEY'
    ) THEN '✅ Primary key exists' ELSE '❌ Primary key missing' END as pk_status;
