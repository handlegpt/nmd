-- Fix users table structure first
-- 先修复users表结构

-- Check if users table exists, if not create it
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_city VARCHAR(255) DEFAULT 'Unknown Location',
    profession VARCHAR(255) DEFAULT 'Digital Nomad',
    company VARCHAR(255) DEFAULT 'Freelance',
    bio TEXT DEFAULT 'Digital nomad exploring the world!',
    interests TEXT[] DEFAULT '{}',
    coordinates JSONB,
    is_visible_in_nomads BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    travel_preferences JSONB DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}'
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add current_city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_city') THEN
        ALTER TABLE users ADD COLUMN current_city VARCHAR(255) DEFAULT 'Unknown Location';
        RAISE NOTICE 'Added current_city column to users table';
    END IF;
    
    -- Add profession column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profession') THEN
        ALTER TABLE users ADD COLUMN profession VARCHAR(255) DEFAULT 'Digital Nomad';
        RAISE NOTICE 'Added profession column to users table';
    END IF;
    
    -- Add company column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
        ALTER TABLE users ADD COLUMN company VARCHAR(255) DEFAULT 'Freelance';
        RAISE NOTICE 'Added company column to users table';
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Digital nomad exploring the world!';
        RAISE NOTICE 'Added bio column to users table';
    END IF;
    
    -- Add interests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN
        ALTER TABLE users ADD COLUMN interests TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added interests column to users table';
    END IF;
    
    -- Add coordinates column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'coordinates') THEN
        ALTER TABLE users ADD COLUMN coordinates JSONB;
        RAISE NOTICE 'Added coordinates column to users table';
    END IF;
    
    -- Add is_visible_in_nomads column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_visible_in_nomads') THEN
        ALTER TABLE users ADD COLUMN is_visible_in_nomads BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_visible_in_nomads column to users table';
    END IF;
    
    -- Add is_online column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_online') THEN
        ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_online column to users table';
    END IF;
    
    -- Add is_available column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_available') THEN
        ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_available column to users table';
    END IF;
    
    -- Add last_seen column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_seen') THEN
        ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added last_seen column to users table';
    END IF;
    
    -- Add travel_preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'travel_preferences') THEN
        ALTER TABLE users ADD COLUMN travel_preferences JSONB DEFAULT '{}';
        RAISE NOTICE 'Added travel_preferences column to users table';
    END IF;
    
    -- Add skills column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'skills') THEN
        ALTER TABLE users ADD COLUMN skills TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added skills column to users table';
    END IF;
    
    -- Add social_links column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'social_links') THEN
        ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '{}';
        RAISE NOTICE 'Added social_links column to users table';
    END IF;
    
    -- Add contact_info column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'contact_info') THEN
        ALTER TABLE users ADD COLUMN contact_info JSONB DEFAULT '{}';
        RAISE NOTICE 'Added contact_info column to users table';
    END IF;
END $$;

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_current_city ON users(current_city);
CREATE INDEX IF NOT EXISTS idx_users_is_visible ON users(is_visible_in_nomads);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Users table structure fixed successfully!';
    RAISE NOTICE '📊 Users table now has all required columns for the migration';
END $$;
