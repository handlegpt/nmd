-- 创建用户创建函数，避免ip_address字段的类型转换问题
CREATE OR REPLACE FUNCTION create_user_simple(
  user_email TEXT,
  user_name TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  current_city TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  -- 插入用户，让数据库处理ip_address字段的默认值
  INSERT INTO users (email, name)
  VALUES (user_email, user_name);
  
  -- 返回新创建的用户信息
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.created_at,
    u.current_city,
    u.avatar_url
  FROM users u
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;
