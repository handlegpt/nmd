-- 创建用户创建函数，正确处理 ip_address 字段的类型转换
CREATE OR REPLACE FUNCTION create_user_with_ip(
  user_email TEXT,
  user_name TEXT,
  user_ip TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  current_city TEXT,
  avatar_url TEXT
) AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 生成新的UUID
  new_user_id := gen_random_uuid();
  
  -- 插入用户，明确处理 ip_address 字段的类型转换
  INSERT INTO users (id, email, name, ip_address, created_at)
  VALUES (new_user_id, user_email, user_name, user_ip::inet, NOW());
  
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
  WHERE u.id = new_user_id;
END;
$$ LANGUAGE plpgsql;
