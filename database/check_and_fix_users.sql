-- Check and fix users table data
-- 检查并修复用户表数据

-- 1. Check if users table exists and has data
SELECT 
    'users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_visible_in_nomads = true THEN 1 END) as visible_users,
    COUNT(CASE WHEN is_online = true THEN 1 END) as online_users
FROM users;

-- 2. Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. Insert test users if table is empty
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

-- 5. Verify the inserted data
SELECT 
    'After insert' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_visible_in_nomads = true THEN 1 END) as visible_users,
    COUNT(CASE WHEN is_online = true THEN 1 END) as online_users
FROM users;

-- 6. Show sample users
SELECT 
    name,
    current_city,
    profession,
    is_visible_in_nomads,
    is_online,
    is_available
FROM users 
WHERE is_visible_in_nomads = true
ORDER BY created_at DESC
LIMIT 10;
