-- User data sync related table structures
-- For storing user profiles and tool data cross-browser synchronization

-- User profile details table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User tool data table
CREATE TABLE IF NOT EXISTS user_tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  version BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_id ON user_tool_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_tool_name ON user_tool_data(tool_name);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_tool ON user_tool_data(user_id, tool_name);

-- Create update time trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update time triggers to tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_tool_data_updated_at ON user_tool_data;
CREATE TRIGGER update_user_tool_data_updated_at
    BEFORE UPDATE ON user_tool_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE user_profiles IS 'User profile details table, stores user personal information';
COMMENT ON TABLE user_tool_data IS 'User tool data table, stores user data for various tools';
COMMENT ON COLUMN user_profiles.profile_data IS 'User profile data, including name, avatar, preferences, etc.';
COMMENT ON COLUMN user_tool_data.tool_name IS 'Tool name, such as domain_tracker, city_preferences, etc.';
COMMENT ON COLUMN user_tool_data.data IS 'Tool data, stored in JSON format';
COMMENT ON COLUMN user_tool_data.version IS 'Data version number for conflict detection';
