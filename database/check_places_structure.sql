-- Check the current structure of the places table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;
