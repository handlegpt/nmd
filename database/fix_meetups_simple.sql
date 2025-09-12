-- Simple fix for meetups table - just add the missing scheduled_date column
-- This is the minimal fix needed for the Docker build

-- Add scheduled_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetups' AND column_name = 'scheduled_date'
    ) THEN
        ALTER TABLE meetups ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added scheduled_date column';
    END IF;
END $$;

-- Copy data from scheduled_time to scheduled_date
UPDATE meetups 
SET scheduled_date = scheduled_time 
WHERE scheduled_date IS NULL AND scheduled_time IS NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_meetups_scheduled_date ON meetups(scheduled_date);
