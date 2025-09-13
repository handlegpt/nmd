-- =====================================================
-- Check Existing Tables in Database
-- =====================================================

-- Check if tables already exist
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'nomad_visas', 'cities', 'city_costs', 'travel_plans', 
    'plan_legs', 'plan_days', 'plan_items', 'user_preferences',
    'user_nomad_visa_applications', 'data_sources'
  )
ORDER BY tablename;

-- Check existing cities table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cities' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if nomad_visas table exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nomad_visas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
