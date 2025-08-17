// Mock Supabase client for web compatibility
const createMockClient = () => ({
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
  }),
});

// Always use mock mode for web compatibility
const isMockMode = true;

console.log('Running in mock mode. All Supabase functionality will be simulated.');

// Create mock Supabase client
const supabase = createMockClient();

export { supabase, isMockMode };

// Database schema SQL (execute in Supabase SQL editor)
/*
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  current_city TEXT NOT NULL,
  languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  is_available_for_meetup BOOLEAN DEFAULT true,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User locations table
CREATE TABLE user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  participants UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view visible users" ON users
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Location policies
CREATE POLICY "Users can view nearby locations" ON user_locations
  FOR SELECT USING (true);

CREATE POLICY "Users can update own location" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Message policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Activity policies
CREATE POLICY "Users can view all activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Users can create activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid() = created_by);
*/ 