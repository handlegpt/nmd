-- 修复 security_audit_log 表的触发器问题
-- 这个脚本需要在 Supabase 仪表板的 SQL 编辑器中执行

-- 1. 首先检查当前的触发器
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 2. 检查 security_audit_log 表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'security_audit_log' 
ORDER BY ordinal_position;

-- 3. 修复触发器函数 - 正确处理 IP 地址类型转换
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    table_name,
    operation,
    user_id,
    record_id,
    old_data,
    new_data,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    -- 修复：正确处理 IP 地址类型转换
    CASE 
      WHEN current_setting('request.headers', true)::jsonb->>'x-forwarded-for' IS NOT NULL 
      THEN (current_setting('request.headers', true)::jsonb->>'x-forwarded-for')::inet
      ELSE '127.0.0.1'::inet
    END,
    current_setting('request.headers', true)::jsonb->>'user-agent',
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 测试触发器是否正常工作
-- 先尝试插入一个测试用户
INSERT INTO users (email, name) 
VALUES ('test-trigger-fix@example.com', 'Test Trigger Fix')
RETURNING id, email, name, created_at;

-- 5. 检查安全审计日志是否正常记录
SELECT * FROM security_audit_log 
WHERE table_name = 'users' 
ORDER BY timestamp DESC 
LIMIT 5;
