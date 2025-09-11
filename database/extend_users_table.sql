-- Extend users table with missing fields
-- This script needs to be executed in Supabase database

-- 1. Add user profile detail fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_city VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS coordinates POINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_visible_in_nomads BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add user preferences and settings fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_current_city ON users(current_city);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);
CREATE INDEX IF NOT EXISTS idx_users_is_visible ON users(is_visible_in_nomads);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_is_available ON users(is_available);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- 4. Add update time trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Update default values for existing users
UPDATE users SET 
    current_city = COALESCE(current_city, 'Unknown Location'),
    profession = COALESCE(profession, 'Digital Nomad'),
    company = COALESCE(company, 'Freelance'),
    bio = COALESCE(bio, 'Digital nomad exploring the world!'),
    interests = COALESCE(interests, ARRAY['Travel', 'Technology']),
    is_visible_in_nomads = COALESCE(is_visible_in_nomads, true),
    is_online = COALESCE(is_online, true),
    is_available = COALESCE(is_available, true),
    last_seen = COALESCE(last_seen, NOW()),
    updated_at = NOW()
WHERE current_city IS NULL 
   OR profession IS NULL 
   OR company IS NULL 
   OR bio IS NULL 
   OR interests IS NULL 
   OR is_visible_in_nomads IS NULL 
   OR is_online IS NULL 
   OR is_available IS NULL 
   OR last_seen IS NULL;

-- 6. Add comments
COMMENT ON COLUMN users.current_city IS 'User current city location';
COMMENT ON COLUMN users.profession IS 'User profession';
COMMENT ON COLUMN users.company IS 'User company';
COMMENT ON COLUMN users.bio IS 'User bio/description';
COMMENT ON COLUMN users.interests IS 'User interest tags';
COMMENT ON COLUMN users.coordinates IS 'User coordinate location';
COMMENT ON COLUMN users.is_visible_in_nomads IS 'Whether visible in nomad list';
COMMENT ON COLUMN users.is_online IS 'Whether user is online';
COMMENT ON COLUMN users.is_available IS 'Whether user is available';
COMMENT ON COLUMN users.last_seen IS 'Last online time';
COMMENT ON COLUMN users.travel_preferences IS 'Travel preference settings';
COMMENT ON COLUMN users.skills IS 'User skills';
COMMENT ON COLUMN users.social_links IS 'Social media links';
COMMENT ON COLUMN users.contact_info IS 'Contact information';
