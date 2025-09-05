-- Test User Preferences Access
-- This script helps diagnose the 406 error

-- 1. Check if user_preferences table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_preferences';

-- 2. Check RLS policies on user_preferences
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_preferences';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_preferences';

-- 4. Check current user authentication
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 5. Test direct query (this should work for service role)
SELECT 
    'user_preferences' as table_name,
    COUNT(*) as record_count
FROM public.user_preferences;

-- 6. Check if there are any records for the specific user
SELECT 
    'user_preferences for user' as test,
    COUNT(*) as record_count
FROM public.user_preferences 
WHERE user_id = '83cbe66b-5e75-4d79-b350-fab2912ec173';

-- 7. Show all user_preferences records
SELECT 
    id,
    user_id,
    wifi_quality,
    cost_of_living,
    climate_comfort,
    social_atmosphere,
    visa_convenience,
    created_at,
    updated_at
FROM public.user_preferences
LIMIT 10;
