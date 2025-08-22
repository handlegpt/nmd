#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 NomadNow Supabase 配置向导\n');

// 检查是否已存在.env文件
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  发现现有的 .env 文件');
  const backupPath = path.join(__dirname, '..', '.env.backup');
  fs.copyFileSync(envPath, backupPath);
  console.log(`✅ 已备份到 .env.backup`);
}

// 读取env.example作为模板
const envExamplePath = path.join(__dirname, '..', 'env.example');
const envExample = fs.readFileSync(envExamplePath, 'utf8');

console.log('\n📋 请提供以下Supabase配置信息：\n');

// 这里需要用户手动输入
console.log('1. 打开 https://supabase.com/dashboard');
console.log('2. 进入你的项目');
console.log('3. 点击 Settings → API');
console.log('4. 复制以下信息：\n');

console.log('🔗 Project URL (例如: https://your-project.supabase.co)');
console.log('🔑 anon public key (以 eyJ 开头的长字符串)\n');

console.log('💡 提示：');
console.log('- 如果你还没有Supabase项目，请先创建一个');
console.log('- 项目创建后，在 Settings → API 页面可以找到这些信息');
console.log('- 确保复制的是 "anon public" key，不是 "service_role" key\n');

console.log('📝 配置完成后，请手动更新以下文件：');
console.log('1. 本地开发：创建 .env 文件');
console.log('2. 服务器部署：更新 docker-compose.yml 中的环境变量\n');

console.log('📄 .env 文件示例：');
console.log('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('🔧 数据库表结构将在配置完成后自动创建');
console.log('📊 你可以在 Supabase Dashboard → Table Editor 中查看数据\n');

// 创建数据库初始化脚本
const dbInitPath = path.join(__dirname, 'init-database.sql');
if (!fs.existsSync(dbInitPath)) {
  const dbInitSQL = `-- NomadNow 数据库初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  bio TEXT,
  avatar_url TEXT,
  current_city TEXT,
  is_visible BOOLEAN DEFAULT true,
  is_available_for_meetup BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户位置表
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建帖子表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略
CREATE POLICY "Users can view all visible users" ON users
  FOR SELECT USING (is_visible = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 位置表策略
CREATE POLICY "Users can view all locations" ON user_locations
  FOR SELECT USING (true);

CREATE POLICY "Users can update own location" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 帖子表策略
CREATE POLICY "Users can view all posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 评论表策略
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 消息表策略
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- 通知表策略
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 存储桶策略
CREATE POLICY "Public access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public access to posts" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 创建函数来更新updated_at时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数来处理新用户注册
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器来自动创建用户记录
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

COMMENT ON TABLE users IS '用户信息表';
COMMENT ON TABLE user_locations IS '用户位置信息表';
COMMENT ON TABLE posts IS '用户帖子表';
COMMENT ON TABLE comments IS '帖子评论表';
COMMENT ON TABLE messages IS '用户消息表';
COMMENT ON TABLE notifications IS '用户通知表';
`;

  fs.writeFileSync(dbInitPath, dbInitSQL);
  console.log('✅ 已创建数据库初始化脚本: scripts/init-database.sql');
}

console.log('🎉 配置向导完成！');
console.log('\n📚 下一步：');
console.log('1. 在 Supabase Dashboard 中运行 scripts/init-database.sql');
console.log('2. 更新环境变量');
console.log('3. 重新构建和部署应用\n');
