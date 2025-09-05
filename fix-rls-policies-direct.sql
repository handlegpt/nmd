-- Direct fix for Supabase RLS policies
-- Execute this script in Supabase SQL Editor

-- 1. First, let's see what policies currently exist
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Drop ALL existing policies for users table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.users;
DROP POLICY IF EXISTS "Allow API to insert users for registration" ON public.users;
DROP POLICY IF EXISTS "Allow public select by email" ON public.users;

-- 3. Create simple, permissive policies
CREATE POLICY "Allow all operations for users" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Alternative: If the above doesn't work, try disabling RLS temporarily
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 5. Verify the new policy
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Test if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';
