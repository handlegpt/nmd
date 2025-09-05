-- Fix user_preferences RLS policies
-- Execute this script in Supabase SQL Editor

-- 1. Check if user_preferences table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences'
) as table_exists;

-- 2. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wifi_quality INTEGER DEFAULT 0 CHECK (wifi_quality >= 0 AND wifi_quality <= 100),
    cost_of_living INTEGER DEFAULT 0 CHECK (cost_of_living >= 0 AND cost_of_living <= 100),
    climate_comfort INTEGER DEFAULT 0 CHECK (climate_comfort >= 0 AND climate_comfort <= 100),
    social_atmosphere INTEGER DEFAULT 0 CHECK (social_atmosphere >= 0 AND social_atmosphere <= 100),
    visa_convenience INTEGER DEFAULT 0 CHECK (visa_convenience >= 0 AND visa_convenience <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow public insert preferences" ON public.user_preferences;

-- 6. Create new, more permissive policies
-- Allow users to view their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences 
FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert own preferences" ON public.user_preferences 
FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
);

-- Allow users to update their own preferences
CREATE POLICY "Users can update own preferences" ON public.user_preferences 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
);

-- Allow public insert for registration
CREATE POLICY "Allow public insert preferences" ON public.user_preferences 
FOR INSERT WITH CHECK (true);

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Verify policies
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'user_preferences';

-- 9. Test query (optional - remove in production)
-- INSERT INTO public.user_preferences (user_id, wifi_quality, cost_of_living, climate_comfort, social_atmosphere, visa_convenience)
-- VALUES ('83cbe66b-5e75-4d79-b350-fab2912ec173', 20, 25, 20, 15, 20)
-- ON CONFLICT (user_id) DO UPDATE SET
--     wifi_quality = EXCLUDED.wifi_quality,
--     cost_of_living = EXCLUDED.cost_of_living,
--     climate_comfort = EXCLUDED.climate_comfort,
--     social_atmosphere = EXCLUDED.social_atmosphere,
--     visa_convenience = EXCLUDED.visa_convenience,
--     updated_at = NOW();
