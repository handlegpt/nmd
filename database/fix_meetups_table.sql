-- Fix meetups table structure
-- Add missing columns that are referenced in the API

-- Add city column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'city'
    ) THEN
        ALTER TABLE meetups ADD COLUMN city VARCHAR(255);
    END IF;
END $$;

-- Add country column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'country'
    ) THEN
        ALTER TABLE meetups ADD COLUMN country VARCHAR(255);
    END IF;
END $$;

-- Add coordinates column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'coordinates'
    ) THEN
        ALTER TABLE meetups ADD COLUMN coordinates JSONB;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'status'
    ) THEN
        ALTER TABLE meetups ADD COLUMN status VARCHAR(50) DEFAULT 'upcoming';
    END IF;
END $$;

-- Add current_participants column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'current_participants'
    ) THEN
        ALTER TABLE meetups ADD COLUMN current_participants INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add organizer column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'organizer'
    ) THEN
        ALTER TABLE meetups ADD COLUMN organizer JSONB;
    END IF;
END $$;

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'tags'
    ) THEN
        ALTER TABLE meetups ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Update existing records with default values
UPDATE meetups 
SET 
    city = COALESCE(city, 'Unknown'),
    country = COALESCE(country, 'Unknown'),
    status = COALESCE(status, 'upcoming'),
    current_participants = COALESCE(current_participants, 0),
    tags = COALESCE(tags, ARRAY[]::TEXT[])
WHERE 
    city IS NULL 
    OR country IS NULL 
    OR status IS NULL 
    OR current_participants IS NULL 
    OR tags IS NULL;

-- Create index on city for better performance
CREATE INDEX IF NOT EXISTS idx_meetups_city ON meetups(city);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);

-- Create index on meetup_type for filtering
CREATE INDEX IF NOT EXISTS idx_meetups_type ON meetups(meetup_type);
