-- Test script for meetup history database functionality
-- This script will test the basic operations

-- 1. Test if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('meetups', 'meetup_participants', 'meetup_history', 'meetup_reminders') 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('meetups', 'meetup_participants', 'meetup_history', 'meetup_reminders')
ORDER BY table_name;

-- 2. Test if indexes exist
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE 'idx_%' 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('meetups', 'meetup_participants', 'meetup_history', 'meetup_reminders')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 3. Test if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  CASE 
    WHEN trigger_name LIKE 'trigger_%' 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table IN ('meetups', 'meetup_participants')
ORDER BY event_object_table, trigger_name;

-- 4. Test if functions exist
SELECT 
  routine_name,
  CASE 
    WHEN routine_name IN ('update_meetup_timestamps', 'log_meetup_history', 'get_user_meetup_history') 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('update_meetup_timestamps', 'log_meetup_history', 'get_user_meetup_history')
ORDER BY routine_name;

-- 5. Test if views exist
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'meetup_stats' 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'meetup_stats';

-- 6. Test RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('meetups', 'meetup_participants', 'meetup_history', 'meetup_reminders')
ORDER BY tablename, policyname;

-- 7. Test basic table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'meetups'
ORDER BY ordinal_position;

-- 8. Test if we can insert a test record (if users table exists)
DO $$
BEGIN
  -- Check if users table exists and has at least one user
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
      RAISE NOTICE '✅ Users table exists and has data';
    ELSE
      RAISE NOTICE '⚠️ Users table exists but is empty';
    END IF;
  ELSE
    RAISE NOTICE '❌ Users table does not exist';
  END IF;
END $$;
