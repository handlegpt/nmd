-- 修复 ip_address 字段的类型转换问题
-- 这个脚本需要在 Supabase 仪表板的 SQL 编辑器中执行

-- 1. 首先检查 ip_address 字段是否存在
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'ip_address';

-- 2. 如果字段存在但没有默认值，添加默认值
ALTER TABLE users ALTER COLUMN ip_address SET DEFAULT '127.0.0.1'::inet;

-- 3. 如果字段存在但不允许 NULL，修改为允许 NULL
ALTER TABLE users ALTER COLUMN ip_address DROP NOT NULL;

-- 4. 验证修改结果
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'ip_address';
