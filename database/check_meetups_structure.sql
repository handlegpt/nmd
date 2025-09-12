-- Check the actual structure of the meetups table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'meetups' 
ORDER BY ordinal_position;
