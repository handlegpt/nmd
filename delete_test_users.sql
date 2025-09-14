-- 删除测试用户
-- 这些用户是昨天添加的测试数据

-- 首先删除相关的用户数据（由于外键约束，需要按顺序删除）
DELETE FROM user_preferences WHERE user_id IN (
  '885de6f6-4416-4dc8-a819-757948c22c86', -- Mike Rodriguez
  '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', -- Alex Chen
  '3d035d76-1c0f-4b85-97a5-b5da6bde1420', -- Sarah Johnson
  'a7093ab2-7df3-461c-bf49-fae99590d19f', -- Emma Wilson
  '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  -- David Kim
);

DELETE FROM user_ratings WHERE user_id IN (
  '885de6f6-4416-4dc8-a819-757948c22c86', -- Mike Rodriguez
  '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', -- Alex Chen
  '3d035d76-1c0f-4b85-97a5-b5da6bde1420', -- Sarah Johnson
  'a7093ab2-7df3-461c-bf49-fae99590d19f', -- Emma Wilson
  '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  -- David Kim
);

DELETE FROM user_reviews WHERE user_id IN (
  '885de6f6-4416-4dc8-a819-757948c22c86', -- Mike Rodriguez
  '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', -- Alex Chen
  '3d035d76-1c0f-4b85-97a5-b5da6bde1420', -- Sarah Johnson
  'a7093ab2-7df3-461c-bf49-fae99590d19f', -- Emma Wilson
  '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  -- David Kim
);

DELETE FROM online_users WHERE user_id IN (
  '885de6f6-4416-4dc8-a819-757948c22c86', -- Mike Rodriguez
  '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', -- Alex Chen
  '3d035d76-1c0f-4b85-97a5-b5da6bde1420', -- Sarah Johnson
  'a7093ab2-7df3-461c-bf49-fae99590d19f', -- Emma Wilson
  '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  -- David Kim
);

-- 最后删除用户记录
DELETE FROM users WHERE id IN (
  '885de6f6-4416-4dc8-a819-757948c22c86', -- Mike Rodriguez
  '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', -- Alex Chen
  '3d035d76-1c0f-4b85-97a5-b5da6bde1420', -- Sarah Johnson
  'a7093ab2-7df3-461c-bf49-fae99590d19f', -- Emma Wilson
  '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  -- David Kim
);

-- 显示删除结果
SELECT 'Test users deleted successfully' as result;
