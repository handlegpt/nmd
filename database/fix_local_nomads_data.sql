-- Fix Local Nomads data issues
-- 修复Local Nomads数据问题

-- 1. Check if online_users table exists
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'online_users'
    ) THEN '✅ online_users table exists' 
    ELSE '❌ online_users table missing' END as online_users_status;

-- 2. Create online_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS online_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    location_data JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Enable RLS for online_users table
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for online_users table
DROP POLICY IF EXISTS "Users can view all online users" ON online_users;
CREATE POLICY "Users can view all online users" ON online_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own online status" ON online_users;
CREATE POLICY "Users can update their own online status" ON online_users FOR ALL USING (auth.uid() = user_id);

-- 5. Check users table data
SELECT 
    'users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_visible_in_nomads = true THEN 1 END) as visible_users,
    COUNT(CASE WHEN is_online = true THEN 1 END) as online_users
FROM users;

-- 6. Insert test users if needed
INSERT INTO users (
    id,
    email,
    name,
    avatar_url,
    current_city,
    profession,
    company,
    bio,
    interests,
    is_visible_in_nomads,
    is_online,
    is_available,
    last_seen,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'alex@example.com',
    'Alex Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Tokyo',
    'Software Developer',
    'Tech Startup',
    'Digital nomad exploring Asia. Love coffee, coding, and meeting new people!',
    ARRAY['Technology', 'Coffee', 'Travel', 'Photography'],
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'sarah@example.com',
    'Sarah Johnson',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'Lisbon',
    'UX Designer',
    'Remote Agency',
    'Creative designer working remotely from beautiful Lisbon. Always up for a coffee chat!',
    ARRAY['Design', 'Art', 'Coffee', 'Networking'],
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'mike@example.com',
    'Mike Rodriguez',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Bangkok',
    'Marketing Consultant',
    'Freelance',
    'Marketing consultant living the digital nomad life in Bangkok. Love exploring local food!',
    ARRAY['Marketing', 'Food', 'Travel', 'Business'],
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'emma@example.com',
    'Emma Wilson',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'Berlin',
    'Content Creator',
    'Personal Brand',
    'Content creator and travel blogger. Always looking for new adventures and connections!',
    ARRAY['Content Creation', 'Travel', 'Photography', 'Social Media'],
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'david@example.com',
    'David Kim',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'Mexico City',
    'Data Scientist',
    'Tech Company',
    'Data scientist working remotely. Love analyzing data and exploring new cities!',
    ARRAY['Data Science', 'Technology', 'Travel', 'Coffee'],
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 7. Insert online status for test users
INSERT INTO online_users (user_id, status, location_data, device_info, last_seen)
SELECT 
    u.id,
    'online',
    jsonb_build_object(
        'city', u.current_city,
        'country', 'Japan',
        'latitude', 35.6762,
        'longitude', 139.6503
    ),
    jsonb_build_object(
        'browser', 'Chrome',
        'os', 'macOS',
        'device', 'Desktop'
    ),
    NOW()
FROM users u
WHERE u.is_visible_in_nomads = true
  AND u.is_online = true
  AND NOT EXISTS (
      SELECT 1 FROM online_users ou WHERE ou.user_id = u.id
  );

-- 8. Verify the data
SELECT 
    'After fix' as status,
    (SELECT COUNT(*) FROM users WHERE is_visible_in_nomads = true) as visible_users,
    (SELECT COUNT(*) FROM online_users) as online_users_count,
    (SELECT COUNT(*) FROM online_users WHERE status = 'online') as online_status_count;

-- 9. Show sample data
SELECT 
    u.name,
    u.current_city,
    u.profession,
    ou.status,
    ou.last_seen
FROM users u
LEFT JOIN online_users ou ON u.id = ou.user_id
WHERE u.is_visible_in_nomads = true
ORDER BY ou.last_seen DESC NULLS LAST
LIMIT 10;
