-- Add missing columns to existing user_preferences table
-- This handles the case where the table exists but is missing required columns

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add favorites column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'favorites') THEN
        ALTER TABLE user_preferences ADD COLUMN favorites JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add hidden_users column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'hidden_users') THEN
        ALTER TABLE user_preferences ADD COLUMN hidden_users JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add blocked_users column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'blocked_users') THEN
        ALTER TABLE user_preferences ADD COLUMN blocked_users JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'preferences') THEN
        ALTER TABLE user_preferences ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'updated_at') THEN
        ALTER TABLE user_preferences ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create or replace the function
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores user preferences like favorites, hidden users, and custom preferences';
COMMENT ON COLUMN user_preferences.favorites IS 'Array of user IDs that this user has favorited';
COMMENT ON COLUMN user_preferences.hidden_users IS 'Array of user IDs that this user has hidden';
COMMENT ON COLUMN user_preferences.blocked_users IS 'Array of user IDs that this user has blocked';
COMMENT ON COLUMN user_preferences.preferences IS 'JSON object containing other user preferences';
