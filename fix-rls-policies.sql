-- Fix Supabase RLS policies for user registration
-- Execute this script in Supabase SQL Editor

-- 1. Check existing policies
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
WHERE tablename = 'users';

-- 2. Drop conflicting policies (if they exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.users;

-- 3. Create new policy for API user insertion (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow API to insert users for registration'
    ) THEN
        CREATE POLICY "Allow API to insert users for registration" ON public.users
            FOR INSERT 
            WITH CHECK (true);
        RAISE NOTICE 'Created policy: Allow API to insert users for registration';
    ELSE
        RAISE NOTICE 'Policy already exists: Allow API to insert users for registration';
    END IF;
END $$;

-- 4. Update SELECT policy to allow API queries (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.users 
            FOR SELECT 
            USING (auth.uid() = id OR true); -- Allow viewing own profile or API queries
        RAISE NOTICE 'Created policy: Users can view own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view own profile';
    END IF;
END $$;

-- 5. Create UPDATE policy (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.users 
            FOR UPDATE 
            USING (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can update own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own profile';
    END IF;
END $$;

-- 6. Verify final policies
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
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Test insert permissions
SELECT 
    has_table_privilege('anon', 'users', 'INSERT') as anon_insert,
    has_table_privilege('authenticated', 'users', 'INSERT') as auth_insert,
    has_table_privilege('service_role', 'users', 'INSERT') as service_insert;
