-- Verify High Priority Tables Creation
-- 验证高优先级数据表是否创建成功

-- Check if all high priority tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'user_city_favorites',
      'user_city_trajectory', 
      'user_city_reviews',
      'user_search_history',
      'user_locations',
      'user_connections'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_city_favorites',
    'user_city_trajectory',
    'user_city_reviews', 
    'user_search_history',
    'user_locations',
    'user_connections'
  )
ORDER BY table_name;

-- Check table structures
SELECT 
  'user_city_favorites' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_city_favorites' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'user_city_favorites',
  'user_city_trajectory',
  'user_city_reviews',
  'user_search_history', 
  'user_locations',
  'user_connections'
)
ORDER BY tablename, policyname;

-- Summary
SELECT 
  'High Priority Tables Summary' as info,
  COUNT(*) as total_tables_created,
  STRING_AGG(table_name, ', ') as table_names
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_city_favorites',
    'user_city_trajectory',
    'user_city_reviews',
    'user_search_history',
    'user_locations', 
    'user_connections'
  );
