-- Complete User System Database Fix
-- This script creates all missing user-related tables and fixes RLS policies

-- 1. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wifi_quality INTEGER DEFAULT 20 CHECK (wifi_quality >= 0 AND wifi_quality <= 100),
    cost_of_living INTEGER DEFAULT 25 CHECK (cost_of_living >= 0 AND cost_of_living <= 100),
    climate_comfort INTEGER DEFAULT 20 CHECK (climate_comfort >= 0 AND climate_comfort <= 100),
    social_atmosphere INTEGER DEFAULT 15 CHECK (social_atmosphere >= 0 AND social_atmosphere <= 100),
    visa_convenience INTEGER DEFAULT 20 CHECK (visa_convenience >= 0 AND visa_convenience <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 3. Create user_visas table
CREATE TABLE IF NOT EXISTS public.user_visas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    country VARCHAR(255) NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_city_id ON public.user_favorites(city_id);
CREATE INDEX IF NOT EXISTS idx_user_visas_user_id ON public.user_visas(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_city_id ON public.votes(city_id);

-- 6. Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow public insert preferences" ON public.user_preferences;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Users can view own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can insert own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can update own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can delete own visas" ON public.user_visas;

DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;
DROP POLICY IF EXISTS "Users can update own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.votes;

-- 8. Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences 
    FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create RLS policies for user_favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS policies for user_visas
CREATE POLICY "Users can view own visas" ON public.user_visas 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visas" ON public.user_visas 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visas" ON public.user_visas 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visas" ON public.user_visas 
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS policies for votes
CREATE POLICY "Users can insert own votes" ON public.votes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all votes" ON public.votes 
    FOR SELECT USING (true);

CREATE POLICY "Users can update own votes" ON public.votes 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.votes 
    FOR DELETE USING (auth.uid() = user_id);

-- 12. Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create triggers for updated_at (with IF NOT EXISTS check)
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
    DROP TRIGGER IF EXISTS update_user_favorites_updated_at ON public.user_favorites;
    DROP TRIGGER IF EXISTS update_user_visas_updated_at ON public.user_visas;
    DROP TRIGGER IF EXISTS update_votes_updated_at ON public.votes;
    
    -- Create new triggers
    CREATE TRIGGER update_user_preferences_updated_at 
        BEFORE UPDATE ON public.user_preferences 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_favorites_updated_at 
        BEFORE UPDATE ON public.user_favorites 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_visas_updated_at 
        BEFORE UPDATE ON public.user_visas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_votes_updated_at 
        BEFORE UPDATE ON public.votes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    RAISE NOTICE 'Triggers created successfully';
END $$;

-- 14. Insert default preferences for existing users
INSERT INTO public.user_preferences (user_id, wifi_quality, cost_of_living, climate_comfort, social_atmosphere, visa_convenience)
SELECT 
    id as user_id,
    20 as wifi_quality,
    25 as cost_of_living,
    20 as climate_comfort,
    15 as social_atmosphere,
    20 as visa_convenience
FROM public.users 
WHERE id NOT IN (SELECT user_id FROM public.user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- 15. Verification query
SELECT 
    'user_preferences' as table_name,
    COUNT(*) as record_count
FROM public.user_preferences
UNION ALL
SELECT 
    'user_favorites' as table_name,
    COUNT(*) as record_count
FROM public.user_favorites
UNION ALL
SELECT 
    'user_visas' as table_name,
    COUNT(*) as record_count
FROM public.user_visas
UNION ALL
SELECT 
    'votes' as table_name,
    COUNT(*) as record_count
FROM public.votes;

SELECT 'User system tables created and configured successfully!' as status;
