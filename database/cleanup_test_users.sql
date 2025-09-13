-- 清理测试用户数据，只保留一个用户
-- 这个脚本会删除大部分测试用户，只保留一个

-- 1. 首先查看当前有多少用户
SELECT 
  'Current users count' as info,
  COUNT(*) as count
FROM users;

-- 2. 查看用户列表（按创建时间排序）
SELECT 
  id,
  email,
  name,
  created_at
FROM users 
ORDER BY created_at ASC;

-- 3. 删除测试用户（保留最早创建的一个用户）
-- 这里我们保留第一个用户，删除其他所有用户
DELETE FROM users 
WHERE id NOT IN (
  SELECT id FROM users ORDER BY created_at ASC LIMIT 1
);

-- 4. 清理相关的用户偏好数据
DELETE FROM user_preferences 
WHERE user_id NOT IN (
  SELECT id FROM users ORDER BY created_at ASC LIMIT 1
);

-- 5. 清理在线用户数据
DELETE FROM online_users 
WHERE user_id NOT IN (
  SELECT id FROM users ORDER BY created_at ASC LIMIT 1
);

-- 6. 清理其他可能相关的用户数据
-- 如果有其他表引用了用户ID，也需要清理

-- 7. 显示清理后的结果
SELECT 
  'After cleanup' as info,
  COUNT(*) as remaining_users
FROM users;

-- 8. 显示保留的用户信息
SELECT 
  'Remaining user' as info,
  id,
  email,
  name,
  created_at
FROM users;
