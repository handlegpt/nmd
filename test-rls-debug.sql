-- RLS Debug Test Script
-- 这个脚本帮助诊断RLS策略问题

-- 1. 检查当前认证状态
SELECT 
    'Current auth status' as info,
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_setting('request.jwt.claims', true) as jwt_claims;

-- 2. 检查user_preferences表的RLS策略
SELECT 
    'user_preferences RLS policies' as info,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_preferences';

-- 3. 检查user_preferences表是否有数据
SELECT 
    'user_preferences data count' as info,
    COUNT(*) as total_records
FROM public.user_preferences;

-- 4. 检查特定用户的偏好设置（如果有的话）
SELECT 
    'user_preferences for specific user' as info,
    user_id,
    wifi_quality,
    cost_of_living,
    climate_comfort,
    social_atmosphere,
    visa_convenience
FROM public.user_preferences 
WHERE user_id = '83cbe66b-5e75-4d79-b350-fab2912ec173';

-- 5. 测试RLS策略（模拟认证用户）
-- 注意：这需要在有正确认证上下文的会话中运行
SELECT 
    'Testing RLS with current auth context' as info,
    COUNT(*) as accessible_records
FROM public.user_preferences;

-- 6. 检查RLS是否启用
SELECT 
    'RLS status for user_preferences' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_preferences';

-- 7. 检查用户表结构
SELECT 
    'users table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. 检查user_preferences表结构
SELECT 
    'user_preferences table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;
