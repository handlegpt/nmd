-- 创建用户创建函数，正确处理 ip_address 字段的类型转换
CREATE OR REPLACE FUNCTION create_user_with_proper_ip(
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
BEGIN
  -- 使用 INSERT ... ON CONFLICT 来处理 upsert 逻辑
  INSERT INTO users (email, name, ip_address)
  VALUES (user_email, user_name, user_ip::inet)
  ON CONFLICT (email) 
  DO UPDATE SET
    name = EXCLUDED.name,
    ip_address = EXCLUDED.ip_address
  RETURNING users.id, users.email, users.name, users.created_at, users.current_city, users.avatar_url;
END;
$$ LANGUAGE plpgsql;
