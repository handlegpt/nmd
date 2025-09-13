-- High Priority Data Tables
-- 高优先级数据表 - 直接使用数据库存储，无需迁移

-- 1. User City Favorites Table - 用户城市收藏表
CREATE TABLE IF NOT EXISTS user_city_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id VARCHAR(255) NOT NULL,
  city_name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_id)
);

-- 2. User City Trajectory Table - 用户城市轨迹表
CREATE TABLE IF NOT EXISTS user_city_trajectory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id VARCHAR(255) NOT NULL,
  city_name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_days INTEGER,
  coordinates JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User City Reviews Table - 用户城市评论表
CREATE TABLE IF NOT EXISTS user_city_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id VARCHAR(255) NOT NULL,
  city_name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_id)
);

-- 4. User Search History Table - 用户搜索历史表
CREATE TABLE IF NOT EXISTS user_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query VARCHAR(500) NOT NULL,
  search_type VARCHAR(50),
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Locations Table - 用户位置表
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(255),
  country VARCHAR(255),
  accuracy INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Connections Table - 用户连接表
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_type VARCHAR(50) DEFAULT 'friend',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_city_favorites_user_id ON user_city_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_favorites_city_id ON user_city_favorites(city_id);

CREATE INDEX IF NOT EXISTS idx_user_city_trajectory_user_id ON user_city_trajectory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_trajectory_city_id ON user_city_trajectory(city_id);
CREATE INDEX IF NOT EXISTS idx_user_city_trajectory_visit_date ON user_city_trajectory(visit_date);

CREATE INDEX IF NOT EXISTS idx_user_city_reviews_user_id ON user_city_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_reviews_city_id ON user_city_reviews(city_id);
CREATE INDEX IF NOT EXISTS idx_user_city_reviews_rating ON user_city_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_created_at ON user_locations(created_at);

CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update time triggers to tables that have updated_at column
DROP TRIGGER IF EXISTS update_user_city_reviews_updated_at ON user_city_reviews;
CREATE TRIGGER update_user_city_reviews_updated_at
    BEFORE UPDATE ON user_city_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_city_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_city_trajectory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_city_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_city_favorites
DROP POLICY IF EXISTS "Users can view their own city favorites" ON user_city_favorites;
DROP POLICY IF EXISTS "Users can create their own city favorites" ON user_city_favorites;
DROP POLICY IF EXISTS "Users can update their own city favorites" ON user_city_favorites;
DROP POLICY IF EXISTS "Users can delete their own city favorites" ON user_city_favorites;

CREATE POLICY "Users can view their own city favorites" ON user_city_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own city favorites" ON user_city_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city favorites" ON user_city_favorites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city favorites" ON user_city_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_city_trajectory
DROP POLICY IF EXISTS "Users can view their own city trajectory" ON user_city_trajectory;
DROP POLICY IF EXISTS "Users can create their own city trajectory" ON user_city_trajectory;
DROP POLICY IF EXISTS "Users can update their own city trajectory" ON user_city_trajectory;
DROP POLICY IF EXISTS "Users can delete their own city trajectory" ON user_city_trajectory;

CREATE POLICY "Users can view their own city trajectory" ON user_city_trajectory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own city trajectory" ON user_city_trajectory
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city trajectory" ON user_city_trajectory
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city trajectory" ON user_city_trajectory
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_city_reviews
DROP POLICY IF EXISTS "Users can view their own city reviews" ON user_city_reviews;
DROP POLICY IF EXISTS "Users can create their own city reviews" ON user_city_reviews;
DROP POLICY IF EXISTS "Users can update their own city reviews" ON user_city_reviews;
DROP POLICY IF EXISTS "Users can delete their own city reviews" ON user_city_reviews;

CREATE POLICY "Users can view their own city reviews" ON user_city_reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own city reviews" ON user_city_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city reviews" ON user_city_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city reviews" ON user_city_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_search_history
DROP POLICY IF EXISTS "Users can view their own search history" ON user_search_history;
DROP POLICY IF EXISTS "Users can create their own search history" ON user_search_history;
DROP POLICY IF EXISTS "Users can update their own search history" ON user_search_history;
DROP POLICY IF EXISTS "Users can delete their own search history" ON user_search_history;

CREATE POLICY "Users can view their own search history" ON user_search_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own search history" ON user_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own search history" ON user_search_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own search history" ON user_search_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_locations
DROP POLICY IF EXISTS "Users can view their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can create their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON user_locations;

CREATE POLICY "Users can view their own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own locations" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own locations" ON user_locations
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON user_connections;

CREATE POLICY "Users can view their own connections" ON user_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can create their own connections" ON user_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own connections" ON user_connections
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can delete their own connections" ON user_connections
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Add table comments
COMMENT ON TABLE user_city_favorites IS 'User favorite cities';
COMMENT ON TABLE user_city_trajectory IS 'User city visit history and trajectory';
COMMENT ON TABLE user_city_reviews IS 'User reviews and ratings for cities';
COMMENT ON TABLE user_search_history IS 'User search history';
COMMENT ON TABLE user_locations IS 'User location data';
COMMENT ON TABLE user_connections IS 'User connections and relationships';

-- Show table creation summary
SELECT 
  'user_city_favorites' as table_name,
  'User favorite cities' as description,
  'High Priority' as priority
UNION ALL
SELECT 
  'user_city_trajectory' as table_name,
  'User city visit history' as description,
  'High Priority' as priority
UNION ALL
SELECT 
  'user_city_reviews' as table_name,
  'User city reviews and ratings' as description,
  'High Priority' as priority
UNION ALL
SELECT 
  'user_search_history' as table_name,
  'User search history' as description,
  'High Priority' as priority
UNION ALL
SELECT 
  'user_locations' as table_name,
  'User location data' as description,
  'High Priority' as priority
UNION ALL
SELECT 
  'user_connections' as table_name,
  'User connections and relationships' as description,
  'High Priority' as priority;
