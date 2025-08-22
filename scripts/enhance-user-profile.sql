-- Enhance User Profile Database Schema
-- This script adds new tables and columns for enhanced user profiles

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  location TEXT,
  skills_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_history table
CREATE TABLE IF NOT EXISTS travel_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follow_relationships table
CREATE TABLE IF NOT EXISTS follow_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  meetups_attended INTEGER DEFAULT 0,
  meetups_created INTEGER DEFAULT 0,
  countries_visited INTEGER DEFAULT 0,
  cities_visited INTEGER DEFAULT 0,
  total_distance_traveled DECIMAL(10,2) DEFAULT 0,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
  notification_settings JSONB DEFAULT '{
    "messages": true,
    "meetups": true,
    "likes": true,
    "comments": true,
    "new_followers": true,
    "location_updates": true
  }',
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_history_user_id ON travel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_relationships_follower_id ON follow_relationships(follower_id);
CREATE INDEX IF NOT EXISTS idx_follow_relationships_following_id ON follow_relationships(following_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to new tables
CREATE TRIGGER update_work_experience_updated_at 
  BEFORE UPDATE ON work_experience 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at 
  BEFORE UPDATE ON education 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_history_updated_at 
  BEFORE UPDATE ON travel_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at 
  BEFORE UPDATE ON user_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user stats and preferences when a user is created
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user stats
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  
  -- Create user preferences
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for new user profile creation
CREATE TRIGGER create_user_profile_data
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- Create function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE user_stats 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Increment followers count for following
    UPDATE user_stats 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE user_stats 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrement followers count for following
    UPDATE user_stats 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Add trigger for follow count updates
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follow_relationships
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Create function to update post count
CREATE OR REPLACE FUNCTION update_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats 
    SET posts_count = posts_count + 1 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats 
    SET posts_count = posts_count - 1 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Add trigger for post count updates
CREATE TRIGGER update_post_count_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_post_count();

-- Create function to update last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats 
  SET last_active = NOW() 
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for last active updates (on post creation)
CREATE TRIGGER update_last_active_trigger
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_experience
CREATE POLICY "Users can view their own work experience" ON work_experience
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work experience" ON work_experience
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experience" ON work_experience
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experience" ON work_experience
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for education
CREATE POLICY "Users can view their own education" ON education
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education" ON education
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education" ON education
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education" ON education
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for travel_history
CREATE POLICY "Users can view their own travel history" ON travel_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel history" ON travel_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel history" ON travel_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel history" ON travel_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for follow_relationships
CREATE POLICY "Users can view follow relationships" ON follow_relationships
  FOR SELECT USING (true);

CREATE POLICY "Users can create follow relationships" ON follow_relationships
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationships" ON follow_relationships
  FOR DELETE USING (auth.uid() = follower_id);

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data for existing users (optional)
-- This will create stats and preferences for users who don't have them yet
INSERT INTO user_stats (user_id, posts_count, followers_count, following_count)
SELECT id, 0, 0, 0
FROM users
WHERE id NOT IN (SELECT user_id FROM user_stats)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_preferences (user_id)
SELECT id
FROM users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON work_experience TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT ALL ON travel_history TO authenticated;
GRANT ALL ON follow_relationships TO authenticated;
GRANT ALL ON user_stats TO authenticated;
GRANT ALL ON user_preferences TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
