-- Enable Secure RLS for User Preferences
-- This script re-enables RLS with secure policies

-- 1. 检查当前状态
SELECT 'Current RLS status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes');

-- 2. 删除任何现有的宽松策略
DROP POLICY IF EXISTS "Allow query by user_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow insert by user_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow update by user_id" ON public.user_preferences;

-- 3. 重新启用RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 4. 创建安全的RLS策略
-- user_preferences 策略
CREATE POLICY "Secure user preferences access" ON public.user_preferences 
    FOR ALL USING (
        -- 用户只能访问自己的数据
        auth.uid() = user_id OR
        -- 服务角色可以访问所有数据（用于API）
        auth.role() = 'service_role' OR
        -- 允许通过JWT中的用户ID访问
        (auth.jwt() ->> 'sub')::uuid = user_id
    );

-- user_favorites 策略
CREATE POLICY "Secure user favorites access" ON public.user_favorites 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        (auth.jwt() ->> 'sub')::uuid = user_id
    );

-- user_visas 策略
CREATE POLICY "Secure user visas access" ON public.user_visas 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        (auth.jwt() ->> 'sub')::uuid = user_id
    );

-- votes 策略（允许查看所有投票，但只能修改自己的）
CREATE POLICY "Secure votes read access" ON public.votes 
    FOR SELECT USING (true);

CREATE POLICY "Secure votes write access" ON public.votes 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        (auth.jwt() ->> 'sub')::uuid = user_id
    );

-- 5. 验证策略
SELECT 'New RLS policies:' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes')
ORDER BY tablename, policyname;

-- 6. 测试查询（模拟认证用户）
-- 注意：这需要在有正确JWT的上下文中运行
SELECT 'Testing secure access:' as info;
SELECT COUNT(*) as accessible_preferences FROM public.user_preferences;

-- 7. 创建函数来验证JWT用户ID
CREATE OR REPLACE FUNCTION get_jwt_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'sub')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建更精确的策略（使用函数）
DROP POLICY IF EXISTS "Secure user preferences access" ON public.user_preferences;
CREATE POLICY "Secure user preferences access" ON public.user_preferences 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        get_jwt_user_id() = user_id
    );

-- 9. 最终验证
SELECT 'Final RLS status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes');

SELECT 'Secure RLS enabled successfully!' as status;
