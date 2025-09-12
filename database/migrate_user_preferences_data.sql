-- 用户偏好数据迁移脚本
-- 将 localStorage 中的用户偏好数据迁移到数据库
-- 这个脚本需要配合前端代码来执行

-- 1. 确保 user_preferences 表存在
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

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 3. 创建更新时间触发器
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

-- 4. 启用行级安全
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
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

-- 6. 添加外键约束（如果 users 表存在）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- 检查外键约束是否已存在
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

-- 7. 添加表注释
COMMENT ON TABLE user_preferences IS 'Stores user preferences like favorites, hidden users, and custom preferences';
COMMENT ON COLUMN user_preferences.favorites IS 'Array of user IDs that this user has favorited';
COMMENT ON COLUMN user_preferences.hidden_users IS 'Array of user IDs that this user has hidden';
COMMENT ON COLUMN user_preferences.blocked_users IS 'Array of user IDs that this user has blocked';
COMMENT ON COLUMN user_preferences.preferences IS 'JSON object containing other user preferences';

-- 8. 为现有用户创建默认偏好记录（如果不存在）
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

-- 9. 显示迁移统计信息
SELECT 
  'user_preferences' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN favorites != '[]'::jsonb THEN 1 END) as users_with_favorites,
  COUNT(CASE WHEN hidden_users != '[]'::jsonb THEN 1 END) as users_with_hidden_users,
  COUNT(CASE WHEN blocked_users != '[]'::jsonb THEN 1 END) as users_with_blocked_users
FROM user_preferences;
