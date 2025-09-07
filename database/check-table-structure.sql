-- 检查 users 表的实际结构
-- 这个脚本需要在 Supabase 仪表板的 SQL 编辑器中执行

-- 1. 检查表的所有列
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 检查表约束
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users';

-- 3. 检查触发器
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 4. 尝试直接插入测试数据
INSERT INTO users (email, name) 
VALUES ('test-direct-insert@example.com', 'Test User Direct')
RETURNING id, email, name, created_at;
