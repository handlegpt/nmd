-- Step-by-Step Secure RLS Enablement
-- Execute each section separately and verify results

-- ========================================
-- STEP 1: Check current RLS status
-- ========================================
SELECT 'STEP 1: Current RLS status' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes');

-- ========================================
-- STEP 2: Drop existing policies (if any)
-- ========================================
SELECT 'STEP 2: Dropping existing policies' as info;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow query by user_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow insert by user_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow update by user_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Secure user preferences access" ON public.user_preferences;
DROP POLICY IF EXISTS "Secure user favorites access" ON public.user_favorites;
DROP POLICY IF EXISTS "Secure user visas access" ON public.user_visas;
DROP POLICY IF EXISTS "Secure votes read access" ON public.votes;
DROP POLICY IF EXISTS "Secure votes write access" ON public.votes;

SELECT 'Existing policies dropped' as status;

-- ========================================
-- STEP 3: Enable RLS on all tables
-- ========================================
SELECT 'STEP 3: Enabling RLS on tables' as info;

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

SELECT 'RLS enabled on all tables' as status;

-- ========================================
-- STEP 4: Create JWT helper function
-- ========================================
SELECT 'STEP 4: Creating JWT helper function' as info;

CREATE OR REPLACE FUNCTION get_jwt_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'sub')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'JWT helper function created' as status;

-- ========================================
-- STEP 5: Create secure policies
-- ========================================
SELECT 'STEP 5: Creating secure policies' as info;

-- user_preferences policies
CREATE POLICY "Secure user preferences access" ON public.user_preferences 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        get_jwt_user_id() = user_id
    );

-- user_favorites policies
CREATE POLICY "Secure user favorites access" ON public.user_favorites 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        get_jwt_user_id() = user_id
    );

-- user_visas policies
CREATE POLICY "Secure user visas access" ON public.user_visas 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        get_jwt_user_id() = user_id
    );

-- votes policies (read all, write own)
CREATE POLICY "Secure votes read access" ON public.votes 
    FOR SELECT USING (true);

CREATE POLICY "Secure votes write access" ON public.votes 
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.role() = 'service_role' OR
        get_jwt_user_id() = user_id
    );

SELECT 'Secure policies created' as status;

-- ========================================
-- STEP 6: Verify policies
-- ========================================
SELECT 'STEP 6: Verifying policies' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes')
ORDER BY tablename, policyname;

-- ========================================
-- STEP 7: Final verification
-- ========================================
SELECT 'STEP 7: Final RLS status' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'user_favorites', 'user_visas', 'votes');

-- ========================================
-- STEP 8: Test query (should work with proper auth)
-- ========================================
SELECT 'STEP 8: Testing access' as info;
SELECT COUNT(*) as accessible_preferences FROM public.user_preferences;

SELECT 'Secure RLS setup completed successfully!' as final_status;
