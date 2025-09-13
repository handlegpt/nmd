-- 清理测试用户，只保留指定的用户
-- 请将 'YOUR_USER_ID_HERE' 替换为您要保留的用户ID

-- 1. 首先运行这个查询来查看所有用户，找到您要保留的用户ID
SELECT 
  id,
  email,
  name,
  created_at
FROM users 
ORDER BY created_at ASC;

-- 2. 将下面的 'YOUR_USER_ID_HERE' 替换为您要保留的用户ID，然后执行清理
-- 例如：如果您的用户ID是 '123e4567-e89b-12d3-a456-426614174000'
-- 则将 'YOUR_USER_ID_HERE' 替换为 '123e4567-e89b-12d3-a456-426614174000'

-- 删除其他用户（保留指定用户）
DELETE FROM users 
WHERE id != 'YOUR_USER_ID_HERE';

-- 清理用户偏好数据（保留指定用户）
DELETE FROM user_preferences 
WHERE user_id != 'YOUR_USER_ID_HERE';

-- 清理在线用户数据（保留指定用户）
DELETE FROM online_users 
WHERE user_id != 'YOUR_USER_ID_HERE';

-- 清理其他可能相关的用户数据
-- 如果有聚会参与者数据
DELETE FROM meetup_participants 
WHERE user_id != 'YOUR_USER_ID_HERE';

-- 如果有用户评分数据
DELETE FROM user_ratings 
WHERE user_id != 'YOUR_USER_ID_HERE' 
   OR reviewer_id != 'YOUR_USER_ID_HERE';

-- 如果有用户评论数据
DELETE FROM user_reviews 
WHERE user_id != 'YOUR_USER_ID_HERE' 
   OR reviewer_id != 'YOUR_USER_ID_HERE';

-- 3. 验证清理结果
SELECT 
  'Remaining users' as info,
  COUNT(*) as count
FROM users;

SELECT 
  'Remaining user details' as info,
  id,
  email,
  name,
  created_at
FROM users;
