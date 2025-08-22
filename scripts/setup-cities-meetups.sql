-- Setup Cities and Meetups Tables
-- This script creates the necessary tables for cities and meetups functionality

-- ========================================
-- CITIES TABLE
-- ========================================

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    continent VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    cost_of_living VARCHAR(50) CHECK (cost_of_living IN ('Low', 'Medium', 'High')),
    internet_speed INTEGER, -- Mbps
    weather VARCHAR(255),
    timezone VARCHAR(50),
    nomad_score DECIMAL(3,1) CHECK (nomad_score >= 0 AND nomad_score <= 10),
    monthly_budget JSONB, -- {accommodation: 800, food: 400, transport: 150, entertainment: 300}
    highlights TEXT[], -- Array of highlights
    cons TEXT[], -- Array of cons
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    language VARCHAR(255),
    currency VARCHAR(10),
    visa_info TEXT,
    coworking_spaces INTEGER,
    cafes INTEGER,
    safety_score DECIMAL(3,1) CHECK (safety_score >= 0 AND safety_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cities table
CREATE INDEX IF NOT EXISTS idx_cities_continent ON cities(continent);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_nomad_score ON cities(nomad_score DESC);
CREATE INDEX IF NOT EXISTS idx_cities_cost_of_living ON cities(cost_of_living);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(latitude, longitude);

-- Create unique constraint for city name and country combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_cities_name_country_unique ON cities(name, country);

-- ========================================
-- MEETUPS TABLE
-- ========================================

-- Create meetups table
CREATE TABLE IF NOT EXISTS meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    date VARCHAR(100) NOT NULL,
    time VARCHAR(50) NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 10,
    current_participants INTEGER NOT NULL DEFAULT 0,
    created_by_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT[], -- Array of tags
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(255),
    country VARCHAR(255),
    category VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    requirements TEXT[], -- Array of requirements
    cost DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetup_participants junction table
CREATE TABLE IF NOT EXISTS meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meetup_id, user_id)
);

-- Create indexes for meetups table
CREATE INDEX IF NOT EXISTS idx_meetups_created_by ON meetups(created_by_id);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_date ON meetups(date);
CREATE INDEX IF NOT EXISTS idx_meetups_category ON meetups(category);
CREATE INDEX IF NOT EXISTS idx_meetups_city ON meetups(city);
CREATE INDEX IF NOT EXISTS idx_meetups_location ON meetups(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_meetups_created_at ON meetups(created_at DESC);

-- Create indexes for meetup_participants table
CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Update updated_at column trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to cities and meetups tables
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetups_updated_at ON meetups;
CREATE TRIGGER update_meetups_updated_at
    BEFORE UPDATE ON meetups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment a column value
CREATE OR REPLACE FUNCTION increment(row_id UUID, column_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    result INTEGER;
BEGIN
    EXECUTE format('UPDATE meetups SET %I = %I + 1 WHERE id = $1 RETURNING %I', column_name, column_name, column_name)
    INTO result
    USING row_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement a column value
CREATE OR REPLACE FUNCTION decrement(row_id UUID, column_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    result INTEGER;
BEGIN
    EXECUTE format('UPDATE meetups SET %I = GREATEST(%I - 1, 0) WHERE id = $1 RETURNING %I', column_name, column_name, column_name)
    INTO result
    USING row_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on cities table
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Cities policies - everyone can read cities
CREATE POLICY "Cities are viewable by everyone" ON cities
    FOR SELECT USING (true);

-- Only authenticated users can insert/update cities (for admin purposes)
CREATE POLICY "Authenticated users can manage cities" ON cities
    FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS on meetups table
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;

-- Meetups policies
CREATE POLICY "Meetups are viewable by everyone" ON meetups
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create meetups" ON meetups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own meetups" ON meetups
    FOR UPDATE USING (auth.uid() = created_by_id);

CREATE POLICY "Users can delete their own meetups" ON meetups
    FOR DELETE USING (auth.uid() = created_by_id);

-- Enable RLS on meetup_participants table
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;

-- Meetup participants policies
CREATE POLICY "Users can view meetup participants" ON meetup_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join meetups" ON meetup_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave meetups" ON meetup_participants
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample cities data
INSERT INTO cities (name, country, continent, description, image_url, cost_of_living, internet_speed, weather, timezone, nomad_score, monthly_budget, highlights, cons, latitude, longitude, population, language, currency, visa_info, coworking_spaces, cafes, safety_score) VALUES
('Bali', 'Indonesia', 'Asia', 'Tropical paradise with vibrant digital nomad community, affordable living, and stunning beaches.', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800', 'Low', 25, 'Tropical (25-32°C)', 'GMT+8', 9.2, '{"accommodation": 800, "food": 400, "transport": 150, "entertainment": 300}', ARRAY['Affordable living', 'Great community', 'Beautiful beaches', 'Rich culture'], ARRAY['Rainy season', 'Traffic congestion', 'Limited public transport'], -8.3405, 115.0920, 4300000, 'Indonesian, English', 'IDR', '30-day visa on arrival, extendable', 50, 200, 8.5),
('Chiang Mai', 'Thailand', 'Asia', 'Cultural hub with excellent food, affordable living, and strong digital nomad scene.', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', 'Low', 30, 'Tropical (20-35°C)', 'GMT+7', 8.8, '{"accommodation": 600, "food": 300, "transport": 100, "entertainment": 250}', ARRAY['Excellent food', 'Cultural sites', 'Affordable', 'Good community'], ARRAY['Burning season', 'Limited nightlife', 'Language barrier'], 18.7883, 98.9853, 1300000, 'Thai, English', 'THB', '30-day visa on arrival, extendable', 30, 150, 8.8),
('Porto', 'Portugal', 'Europe', 'Charming coastal city with rich history, excellent wine, and growing tech scene.', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', 'Medium', 100, 'Mediterranean (10-25°C)', 'GMT+0', 8.5, '{"accommodation": 1200, "food": 500, "transport": 200, "entertainment": 400}', ARRAY['Rich culture', 'Great food', 'Affordable Europe', 'Wine region'], ARRAY['Hilly terrain', 'Rainy winters', 'Limited English'], 41.1579, -8.6291, 230000, 'Portuguese, English', 'EUR', 'Schengen visa, D7 visa available', 25, 100, 9.0),
('Mexico City', 'Mexico', 'Americas', 'Vibrant metropolis with rich culture, excellent food, and affordable living.', 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800', 'Low', 50, 'Subtropical (15-30°C)', 'GMT-6', 8.3, '{"accommodation": 900, "food": 350, "transport": 120, "entertainment": 300}', ARRAY['Rich culture', 'Excellent food', 'Affordable', 'Great community'], ARRAY['Air pollution', 'Traffic congestion', 'Safety concerns'], 19.4326, -99.1332, 9200000, 'Spanish, English', 'MXN', '180-day tourist visa', 40, 180, 7.5),
('Cape Town', 'South Africa', 'Africa', 'Stunning coastal city with mountains, beaches, and growing digital nomad community.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 'Medium', 40, 'Mediterranean (10-25°C)', 'GMT+2', 8.0, '{"accommodation": 1000, "food": 400, "transport": 150, "entertainment": 350}', ARRAY['Beautiful nature', 'Affordable', 'Great weather', 'Wine region'], ARRAY['Safety concerns', 'Load shedding', 'Limited public transport'], -33.9249, 18.4241, 4400000, 'English, Afrikaans', 'ZAR', '90-day tourist visa', 20, 80, 7.0)
ON CONFLICT (name, country) DO NOTHING;

-- ========================================
-- PERMISSIONS
-- ========================================

-- Grant permissions to authenticated users
GRANT ALL ON cities TO authenticated;
GRANT ALL ON meetups TO authenticated;
GRANT ALL ON meetup_participants TO authenticated;

-- Grant usage on sequences (if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- This will show when the script completes successfully
DO $$
BEGIN
    RAISE NOTICE 'Cities and Meetups tables setup completed successfully!';
    RAISE NOTICE 'Created tables: cities, meetups, meetup_participants';
    RAISE NOTICE 'Added sample data for 5 cities';
    RAISE NOTICE 'RLS policies configured for security';
END $$;
