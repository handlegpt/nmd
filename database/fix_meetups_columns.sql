-- Fix meetups table column names
-- The API is looking for 'scheduled_date' but the table has 'scheduled_time'

-- Add scheduled_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'scheduled_date'
    ) THEN
        ALTER TABLE meetups ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Copy data from scheduled_time to scheduled_date if scheduled_date is null
UPDATE meetups 
SET scheduled_date = scheduled_time 
WHERE scheduled_date IS NULL AND scheduled_time IS NOT NULL;

-- Add other missing columns that might be referenced
DO $$ 
BEGIN
    -- Add start_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE meetups ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add end_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE meetups ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'duration'
    ) THEN
        ALTER TABLE meetups ADD COLUMN duration INTEGER DEFAULT 120; -- 2 hours default
    END IF;
    
    -- Add price column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'price'
    ) THEN
        ALTER TABLE meetups ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    -- Add currency column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'currency'
    ) THEN
        ALTER TABLE meetups ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
    END IF;
    
    -- Add requirements column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'requirements'
    ) THEN
        ALTER TABLE meetups ADD COLUMN requirements TEXT[];
    END IF;
    
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE meetups ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    -- Add is_cancelled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'is_cancelled'
    ) THEN
        ALTER TABLE meetups ADD COLUMN is_cancelled BOOLEAN DEFAULT false;
    END IF;
    
    -- Add cancellation_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'cancellation_reason'
    ) THEN
        ALTER TABLE meetups ADD COLUMN cancellation_reason TEXT;
    END IF;
END $$;

-- Update existing records with default values
UPDATE meetups 
SET 
    start_time = COALESCE(start_time, scheduled_time, meeting_time),
    end_time = COALESCE(end_time, scheduled_time + INTERVAL '2 hours', meeting_time + INTERVAL '2 hours'),
    duration = COALESCE(duration, 120),
    currency = COALESCE(currency, 'USD'),
    is_public = COALESCE(is_public, true),
    is_cancelled = COALESCE(is_cancelled, false),
    requirements = COALESCE(requirements, ARRAY[]::TEXT[])
WHERE 
    start_time IS NULL 
    OR end_time IS NULL 
    OR duration IS NULL 
    OR currency IS NULL 
    OR is_public IS NULL 
    OR is_cancelled IS NULL 
    OR requirements IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetups_scheduled_date ON meetups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meetups_start_time ON meetups(start_time);
CREATE INDEX IF NOT EXISTS idx_meetups_end_time ON meetups(end_time);
CREATE INDEX IF NOT EXISTS idx_meetups_is_public ON meetups(is_public);
CREATE INDEX IF NOT EXISTS idx_meetups_is_cancelled ON meetups(is_cancelled);
