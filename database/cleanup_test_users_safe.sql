-- 安全清理测试用户数据
-- 这个脚本会显示用户列表，让您选择保留哪个用户

-- 1. 查看当前所有用户
SELECT 
  'Current users' as info,
  id,
  email,
  name,
  created_at
FROM users 
ORDER BY created_at ASC;

-- 2. 查看用户偏好数据
SELECT 
  'User preferences' as info,
  up.user_id,
  u.email,
  up.favorites,
  up.hidden_users,
  up.created_at
FROM user_preferences up
JOIN users u ON up.user_id = u.id
ORDER BY up.created_at ASC;

-- 3. 查看在线用户数据
SELECT 
  'Online users' as info,
  ou.user_id,
  u.email,
  ou.status,
  ou.last_seen
FROM online_users ou
JOIN users u ON ou.user_id = u.id
ORDER BY ou.last_seen DESC;

-- 4. 统计信息
SELECT 
  'Statistics' as info,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM user_preferences) as users_with_preferences,
  (SELECT COUNT(*) FROM online_users) as online_users_count;
