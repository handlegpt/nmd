-- NOMAD.NOW Database Setup
-- Run this SQL file to create the necessary database tables

-- 1. Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visa_days INTEGER DEFAULT 90,
    visa_type VARCHAR(100) DEFAULT 'Tourist Visa',
    cost_of_living INTEGER DEFAULT 2000,
    wifi_speed INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, country)
);

-- 2. Create places table
CREATE TABLE IF NOT EXISTS public.places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    category VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0,
    price_range VARCHAR(50),
    wifi_available BOOLEAN DEFAULT false,
    wifi_speed INTEGER,
    opening_hours TEXT,
    website VARCHAR(500),
    phone VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create verification_codes table
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create user_visas table
CREATE TABLE IF NOT EXISTS public.user_visas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    country VARCHAR(255) NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 9. Create user_preferences table
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

-- 10. Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 11. Create place_votes table
CREATE TABLE IF NOT EXISTS public.place_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- 12. Create place_reviews table
CREATE TABLE IF NOT EXISTS public.place_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Insert sample city data
INSERT INTO public.cities (name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
('Lisbon', 'Portugal', 'PT', 'Europe/Lisbon', 38.7223, -9.1393, 365, 'Digital Nomad Visa', 2000, 100),
('Chiang Mai', 'Thailand', 'TH', 'Asia/Bangkok', 18.7883, 98.9853, 60, 'Tourist Visa', 1200, 50),
('Bali', 'Indonesia', 'ID', 'Asia/Jakarta', -8.3405, 115.0920, 30, 'Visa on Arrival', 1500, 25),
('Tbilisi', 'Georgia', 'GE', 'Asia/Tbilisi', 41.7151, 44.8271, 365, 'Visa Free', 1200, 30),
('Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4326, -99.1332, 180, 'Tourist Visa', 1800, 50),
('Barcelona', 'Spain', 'ES', 'Europe/Madrid', 41.3851, 2.1734, 90, 'Schengen Visa', 2500, 100),
('Medellin', 'Colombia', 'CO', 'America/Bogota', 6.2442, -75.5812, 90, 'Tourist Visa', 1400, 40),
('Porto', 'Portugal', 'PT', 'Europe/Lisbon', 41.1579, -8.6291, 365, 'Digital Nomad Visa', 1800, 100),
('Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.7563, 100.5018, 30, 'Visa on Arrival', 1600, 50),
('Buenos Aires', 'Argentina', 'AR', 'America/Argentina/Buenos_Aires', -34.6118, -58.3960, 90, 'Tourist Visa', 1200, 30),
('Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.6762, 139.6503, 90, 'Tourist Visa', 3000, 100),
('Seoul', 'South Korea', 'KR', 'Asia/Seoul', 37.5665, 126.9780, 90, 'Tourist Visa', 2500, 100),
('Singapore', 'Singapore', 'SG', 'Asia/Singapore', 1.3521, 103.8198, 90, 'Visa Free', 3500, 200),
('Berlin', 'Germany', 'DE', 'Europe/Berlin', 52.5200, 13.4050, 90, 'Schengen Visa', 2800, 100),
('Amsterdam', 'Netherlands', 'NL', 'Europe/Amsterdam', 52.3676, 4.9041, 90, 'Schengen Visa', 3000, 100),
('Paris', 'France', 'FR', 'Europe/Paris', 48.8566, 2.3522, 90, 'Schengen Visa', 3500, 100),
('London', 'United Kingdom', 'GB', 'Europe/London', 51.5074, -0.1278, 180, 'Tourist Visa', 4000, 100),
('New York', 'United States', 'US', 'America/New_York', 40.7128, -74.0060, 90, 'Tourist Visa', 5000, 100),
('San Francisco', 'United States', 'US', 'America/Los_Angeles', 37.7749, -122.4194, 90, 'Tourist Visa', 6000, 100),
('Toronto', 'Canada', 'CA', 'America/Toronto', 43.6532, -79.3832, 180, 'Tourist Visa', 3500, 100),
('Sydney', 'Australia', 'AU', 'Australia/Sydney', -33.8688, 151.2093, 90, 'Tourist Visa', 4000, 100),
('Melbourne', 'Australia', 'AU', 'Australia/Melbourne', -37.8136, 144.9631, 90, 'Tourist Visa', 3800, 100),
('Dubai', 'United Arab Emirates', 'AE', 'Asia/Dubai', 25.2048, 55.2708, 90, 'Tourist Visa', 3500, 100),
('Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.0082, 28.9784, 90, 'Visa on Arrival', 1500, 50),
('Cairo', 'Egypt', 'EG', 'Africa/Cairo', 30.0444, 31.2357, 30, 'Visa on Arrival', 1000, 30),
('Cape Town', 'South Africa', 'ZA', 'Africa/Johannesburg', -33.9249, 18.4241, 90, 'Tourist Visa', 2000, 50),
('Rio de Janeiro', 'Brazil', 'BR', 'America/Sao_Paulo', -22.9068, -43.1729, 90, 'Tourist Visa', 1800, 40),
('Lima', 'Peru', 'PE', 'America/Lima', -12.0464, -77.0428, 90, 'Tourist Visa', 1500, 30),
('Santiago', 'Chile', 'CL', 'America/Santiago', -33.4489, -70.6693, 90, 'Tourist Visa', 2000, 50),
('Montevideo', 'Uruguay', 'UY', 'America/Montevideo', -34.9011, -56.1645, 90, 'Tourist Visa', 2200, 50),
('Havana', 'Cuba', 'CU', 'America/Havana', 23.1136, -82.3666, 30, 'Tourist Visa', 1200, 20),
('Kingston', 'Jamaica', 'JM', 'America/Jamaica', 17.9712, -76.7926, 90, 'Tourist Visa', 1800, 30),
('Santo Domingo', 'Dominican Republic', 'DO', 'America/Santo_Domingo', 18.4861, -69.9312, 30, 'Tourist Visa', 1500, 25),
('Panama City', 'Panama', 'PA', 'America/Panama', 8.5380, -80.7821, 180, 'Tourist Visa', 2000, 40),
('San Jose', 'Costa Rica', 'CR', 'America/Costa_Rica', 9.9281, -84.0907, 90, 'Tourist Visa', 2000, 30),
('Guatemala City', 'Guatemala', 'GT', 'America/Guatemala', 14.6349, -90.5069, 90, 'Tourist Visa', 1200, 20),
('Managua', 'Nicaragua', 'NI', 'America/Managua', 12.1364, -86.2514, 90, 'Tourist Visa', 1000, 15),
('Tegucigalpa', 'Honduras', 'HN', 'America/Tegucigalpa', 14.0723, -87.1921, 90, 'Tourist Visa', 1200, 20),
('San Salvador', 'El Salvador', 'SV', 'America/El_Salvador', 13.6929, -89.2182, 90, 'Tourist Visa', 1200, 25),
('Belize City', 'Belize', 'BZ', 'America/Belize', 17.1899, -88.4976, 30, 'Visa on Arrival', 1500, 20),
('Mexico City', 'Mexico', 'MX', 'America/Mexico_City', 19.4326, -99.1332, 180, 'Tourist Visa', 1800, 50)
ON CONFLICT (name, country) DO NOTHING;

-- 11. Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_cities_country ON public.cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_timezone ON public.cities(timezone);
CREATE INDEX IF NOT EXISTS idx_places_city_id ON public.places(city_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_visas_user_id ON public.user_visas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_city_id ON public.votes(city_id);

-- 12. Enable Row Level Security (RLS)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies
-- Allow public read access to cities and places
CREATE POLICY "Allow public read access to cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to places" ON public.places FOR SELECT USING (true);

-- Allow public access to verification_codes
CREATE POLICY "Allow public insert to verification_codes" ON public.verification_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from verification_codes" ON public.verification_codes FOR SELECT USING (true);
CREATE POLICY "Allow public update verification_codes" ON public.verification_codes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from verification_codes" ON public.verification_codes FOR DELETE USING (true);

-- Allow public access to votes
CREATE POLICY "Allow public insert to votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Allow public update votes" ON public.votes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from votes" ON public.votes FOR DELETE USING (true);

-- Allow public access to place_votes
CREATE POLICY "Allow public insert to place_votes" ON public.place_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from place_votes" ON public.place_votes FOR SELECT USING (true);
CREATE POLICY "Allow public update place_votes" ON public.place_votes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from place_votes" ON public.place_votes FOR DELETE USING (true);

-- Allow public access to place_reviews
CREATE POLICY "Allow public insert to place_reviews" ON public.place_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from place_reviews" ON public.place_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public update place_reviews" ON public.place_reviews FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from place_reviews" ON public.place_reviews FOR DELETE USING (true);

-- User-related table policies (require authentication)
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public access for verification code registration
CREATE POLICY "Allow public insert for registration" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select by email" ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can view own visas" ON public.user_visas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visas" ON public.user_visas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visas" ON public.user_visas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visas" ON public.user_visas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow public insert preferences" ON public.user_preferences FOR INSERT WITH CHECK (true);

-- 15. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_visas_updated_at BEFORE UPDATE ON public.user_visas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_place_reviews_updated_at BEFORE UPDATE ON public.place_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Complete!
SELECT 'Database setup completed successfully!' as status;

-- 修复 users 表结构
-- 添加缺失的 current_city 字段

-- 检查字段是否存在，如果不存在则添加
DO $$ 
BEGIN
    -- 检查 current_city 字段是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'current_city'
    ) THEN
        -- 添加 current_city 字段
        ALTER TABLE users ADD COLUMN current_city TEXT;
        RAISE NOTICE 'Added current_city column to users table';
    ELSE
        RAISE NOTICE 'current_city column already exists in users table';
    END IF;
END $$;

-- 检查其他可能缺失的字段
DO $$ 
BEGIN
    -- 检查 avatar_url 字段是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        -- 添加 avatar_url 字段
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in users table';
    END IF;
END $$;

-- 验证表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
