-- Medium Priority Data Tables
-- 中优先级数据表 - 工具数据和系统数据

-- 1. User Tool Data Table - 用户工具数据表（通用工具数据存储）
CREATE TABLE IF NOT EXISTS user_tool_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  version BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

-- 2. User City Votes Table - 用户城市投票表
CREATE TABLE IF NOT EXISTS user_city_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id VARCHAR(255) NOT NULL,
  vote_type VARCHAR(50) NOT NULL,
  vote_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_id, vote_type)
);

-- 3. User Settings Table - 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. User Notification Settings Table - 用户通知设置表
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  meetup_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  city_updates BOOLEAN DEFAULT true,
  connection_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. User Error Logs Table - 用户错误日志表
CREATE TABLE IF NOT EXISTS user_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_context JSONB DEFAULT '{}',
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Speed Tests Table - 用户速度测试表
CREATE TABLE IF NOT EXISTS user_speed_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  download_speed DECIMAL(10, 2),
  upload_speed DECIMAL(10, 2),
  ping_ms INTEGER,
  test_location VARCHAR(255),
  test_type VARCHAR(50) DEFAULT 'wifi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_id ON user_tool_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_tool_name ON user_tool_data(tool_name);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_tool ON user_tool_data(user_id, tool_name);

CREATE INDEX IF NOT EXISTS idx_user_city_votes_user_id ON user_city_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_votes_city_id ON user_city_votes(city_id);
CREATE INDEX IF NOT EXISTS idx_user_city_votes_type ON user_city_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_error_logs_user_id ON user_error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_error_logs_error_type ON user_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_user_error_logs_created_at ON user_error_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_speed_tests_user_id ON user_speed_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_speed_tests_created_at ON user_speed_tests(created_at);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update time triggers to tables that have updated_at column
DROP TRIGGER IF EXISTS update_user_tool_data_updated_at ON user_tool_data;
CREATE TRIGGER update_user_tool_data_updated_at
    BEFORE UPDATE ON user_tool_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_settings_updated_at ON user_notification_settings;
CREATE TRIGGER update_user_notification_settings_updated_at
    BEFORE UPDATE ON user_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_tool_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_city_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_speed_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_tool_data
DROP POLICY IF EXISTS "Users can view their own tool data" ON user_tool_data;
DROP POLICY IF EXISTS "Users can create their own tool data" ON user_tool_data;
DROP POLICY IF EXISTS "Users can update their own tool data" ON user_tool_data;
DROP POLICY IF EXISTS "Users can delete their own tool data" ON user_tool_data;

CREATE POLICY "Users can view their own tool data" ON user_tool_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tool data" ON user_tool_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tool data" ON user_tool_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tool data" ON user_tool_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_city_votes
DROP POLICY IF EXISTS "Users can view their own city votes" ON user_city_votes;
DROP POLICY IF EXISTS "Users can create their own city votes" ON user_city_votes;
DROP POLICY IF EXISTS "Users can update their own city votes" ON user_city_votes;
DROP POLICY IF EXISTS "Users can delete their own city votes" ON user_city_votes;

CREATE POLICY "Users can view their own city votes" ON user_city_votes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own city votes" ON user_city_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city votes" ON user_city_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city votes" ON user_city_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_notification_settings
DROP POLICY IF EXISTS "Users can view their own notification settings" ON user_notification_settings;
DROP POLICY IF EXISTS "Users can create their own notification settings" ON user_notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON user_notification_settings;
DROP POLICY IF EXISTS "Users can delete their own notification settings" ON user_notification_settings;

CREATE POLICY "Users can view their own notification settings" ON user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notification settings" ON user_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notification settings" ON user_notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_error_logs
DROP POLICY IF EXISTS "Users can view their own error logs" ON user_error_logs;
DROP POLICY IF EXISTS "Users can create their own error logs" ON user_error_logs;
DROP POLICY IF EXISTS "Users can update their own error logs" ON user_error_logs;
DROP POLICY IF EXISTS "Users can delete their own error logs" ON user_error_logs;

CREATE POLICY "Users can view their own error logs" ON user_error_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own error logs" ON user_error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own error logs" ON user_error_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own error logs" ON user_error_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_speed_tests
DROP POLICY IF EXISTS "Users can view their own speed tests" ON user_speed_tests;
DROP POLICY IF EXISTS "Users can create their own speed tests" ON user_speed_tests;
DROP POLICY IF EXISTS "Users can update their own speed tests" ON user_speed_tests;
DROP POLICY IF EXISTS "Users can delete their own speed tests" ON user_speed_tests;

CREATE POLICY "Users can view their own speed tests" ON user_speed_tests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own speed tests" ON user_speed_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own speed tests" ON user_speed_tests
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own speed tests" ON user_speed_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Add table comments
COMMENT ON TABLE user_tool_data IS 'Generic tool data storage for user tools like domain tracker, etc.';
COMMENT ON TABLE user_city_votes IS 'User votes and ratings for cities';
COMMENT ON TABLE user_settings IS 'User application settings and preferences';
COMMENT ON TABLE user_notification_settings IS 'User notification preferences and settings';
COMMENT ON TABLE user_error_logs IS 'User error logs and debugging information';
COMMENT ON TABLE user_speed_tests IS 'User internet speed test results';

-- Show table creation summary
SELECT 
  'user_tool_data' as table_name,
  'Generic tool data storage' as description,
  'Medium Priority' as priority
UNION ALL
SELECT 
  'user_city_votes' as table_name,
  'User city votes and ratings' as description,
  'Medium Priority' as priority
UNION ALL
SELECT 
  'user_settings' as table_name,
  'User application settings' as description,
  'Medium Priority' as priority
UNION ALL
SELECT 
  'user_notification_settings' as table_name,
  'User notification preferences' as description,
  'Medium Priority' as priority
UNION ALL
SELECT 
  'user_error_logs' as table_name,
  'User error logs and debugging' as description,
  'Medium Priority' as priority
UNION ALL
SELECT 
  'user_speed_tests' as table_name,
  'User internet speed test results' as description,
  'Medium Priority' as priority;
