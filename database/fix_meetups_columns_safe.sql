-- Safe fix for meetups table column issues
-- This script checks for column existence before making changes

DO $$ 
DECLARE
    has_scheduled_time BOOLEAN;
    has_meeting_time BOOLEAN;
    has_scheduled_date BOOLEAN;
    has_start_time BOOLEAN;
    has_end_time BOOLEAN;
    has_duration BOOLEAN;
    has_price BOOLEAN;
    has_currency BOOLEAN;
    has_requirements BOOLEAN;
    has_is_public BOOLEAN;
    has_is_cancelled BOOLEAN;
    has_cancellation_reason BOOLEAN;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'scheduled_time'
    ) INTO has_scheduled_time;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'meeting_time'
    ) INTO has_meeting_time;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'scheduled_date'
    ) INTO has_scheduled_date;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'start_time'
    ) INTO has_start_time;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'end_time'
    ) INTO has_end_time;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'duration'
    ) INTO has_duration;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'price'
    ) INTO has_price;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'currency'
    ) INTO has_currency;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'requirements'
    ) INTO has_requirements;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'is_public'
    ) INTO has_is_public;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'is_cancelled'
    ) INTO has_is_cancelled;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'cancellation_reason'
    ) INTO has_cancellation_reason;
    
    -- Add scheduled_date column if it doesn't exist
    IF NOT has_scheduled_date THEN
        ALTER TABLE meetups ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added scheduled_date column';
    END IF;
    
    -- Add start_time column if it doesn't exist
    IF NOT has_start_time THEN
        ALTER TABLE meetups ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added start_time column';
    END IF;
    
    -- Add end_time column if it doesn't exist
    IF NOT has_end_time THEN
        ALTER TABLE meetups ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added end_time column';
    END IF;
    
    -- Add duration column if it doesn't exist
    IF NOT has_duration THEN
        ALTER TABLE meetups ADD COLUMN duration INTEGER DEFAULT 120;
        RAISE NOTICE 'Added duration column';
    END IF;
    
    -- Add price column if it doesn't exist
    IF NOT has_price THEN
        ALTER TABLE meetups ADD COLUMN price DECIMAL(10,2);
        RAISE NOTICE 'Added price column';
    END IF;
    
    -- Add currency column if it doesn't exist
    IF NOT has_currency THEN
        ALTER TABLE meetups ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
        RAISE NOTICE 'Added currency column';
    END IF;
    
    -- Add requirements column if it doesn't exist
    IF NOT has_requirements THEN
        ALTER TABLE meetups ADD COLUMN requirements TEXT[];
        RAISE NOTICE 'Added requirements column';
    END IF;
    
    -- Add is_public column if it doesn't exist
    IF NOT has_is_public THEN
        ALTER TABLE meetups ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column';
    END IF;
    
    -- Add is_cancelled column if it doesn't exist
    IF NOT has_is_cancelled THEN
        ALTER TABLE meetups ADD COLUMN is_cancelled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_cancelled column';
    END IF;
    
    -- Add cancellation_reason column if it doesn't exist
    IF NOT has_cancellation_reason THEN
        ALTER TABLE meetups ADD COLUMN cancellation_reason TEXT;
        RAISE NOTICE 'Added cancellation_reason column';
    END IF;
    
    -- Update existing records with default values (only if columns exist)
    IF has_scheduled_time AND has_scheduled_date THEN
        UPDATE meetups 
        SET scheduled_date = scheduled_time 
        WHERE scheduled_date IS NULL AND scheduled_time IS NOT NULL;
        RAISE NOTICE 'Updated scheduled_date from scheduled_time';
    ELSIF has_meeting_time AND has_scheduled_date THEN
        UPDATE meetups 
        SET scheduled_date = meeting_time 
        WHERE scheduled_date IS NULL AND meeting_time IS NOT NULL;
        RAISE NOTICE 'Updated scheduled_date from meeting_time';
    END IF;
    
    -- Set default values for new columns
    UPDATE meetups 
    SET 
        duration = COALESCE(duration, 120),
        currency = COALESCE(currency, 'USD'),
        is_public = COALESCE(is_public, true),
        is_cancelled = COALESCE(is_cancelled, false),
        requirements = COALESCE(requirements, ARRAY[]::TEXT[])
    WHERE 
        duration IS NULL 
        OR currency IS NULL 
        OR is_public IS NULL 
        OR is_cancelled IS NULL 
        OR requirements IS NULL;
    
    RAISE NOTICE 'Updated default values for new columns';
    
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_meetups_scheduled_date ON meetups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meetups_start_time ON meetups(start_time);
CREATE INDEX IF NOT EXISTS idx_meetups_end_time ON meetups(end_time);
CREATE INDEX IF NOT EXISTS idx_meetups_is_public ON meetups(is_public);
CREATE INDEX IF NOT EXISTS idx_meetups_is_cancelled ON meetups(is_cancelled);

RAISE NOTICE 'Created performance indexes';
