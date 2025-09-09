-- 用户数据同步相关表结构
-- 用于存储用户资料和工具数据的跨浏览器同步

-- 用户详细资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 用户工具数据表
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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_id ON user_tool_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_tool_name ON user_tool_data(tool_name);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_tool ON user_tool_data(user_id, tool_name);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
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

-- 添加注释
COMMENT ON TABLE user_profiles IS '用户详细资料表，存储用户的个人资料信息';
COMMENT ON TABLE user_tool_data IS '用户工具数据表，存储各种工具的用户数据';
COMMENT ON COLUMN user_profiles.profile_data IS '用户资料数据，包含姓名、头像、偏好等信息';
COMMENT ON COLUMN user_tool_data.tool_name IS '工具名称，如domain_tracker、city_preferences等';
COMMENT ON COLUMN user_tool_data.data IS '工具数据，JSON格式存储';
COMMENT ON COLUMN user_tool_data.version IS '数据版本号，用于冲突检测';
