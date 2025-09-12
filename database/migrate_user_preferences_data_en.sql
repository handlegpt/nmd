-- User preferences data migration script
-- Migrate user preference data from localStorage to database
-- This script needs to be executed with frontend code

-- 1. Ensure user_preferences table exists
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  favorites JSONB DEFAULT '[]'::jsonb,
  hidden_users JSONB DEFAULT '[]'::jsonb,
  blocked_users JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 3. Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- 4. Enable row level security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Add foreign key constraint (if users table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Check if foreign key constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'user_preferences_user_id_fkey' 
      AND table_name = 'user_preferences'
    ) THEN
      ALTER TABLE user_preferences 
      ADD CONSTRAINT user_preferences_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 7. Add table comments
COMMENT ON TABLE user_preferences IS 'Stores user preferences like favorites, hidden users, and custom preferences';
COMMENT ON COLUMN user_preferences.favorites IS 'Array of user IDs that this user has favorited';
COMMENT ON COLUMN user_preferences.hidden_users IS 'Array of user IDs that this user has hidden';
COMMENT ON COLUMN user_preferences.blocked_users IS 'Array of user IDs that this user has blocked';
COMMENT ON COLUMN user_preferences.preferences IS 'JSON object containing other user preferences';

-- 8. Create default preference records for existing users (if not exists)
INSERT INTO user_preferences (user_id, favorites, hidden_users, blocked_users, preferences)
SELECT 
  u.id,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_preferences up WHERE up.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Show migration statistics
SELECT 
  'user_preferences' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN favorites != '[]'::jsonb THEN 1 END) as users_with_favorites,
  COUNT(CASE WHEN hidden_users != '[]'::jsonb THEN 1 END) as users_with_hidden_users,
  COUNT(CASE WHEN blocked_users != '[]'::jsonb THEN 1 END) as users_with_blocked_users
FROM user_preferences;
