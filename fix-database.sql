-- 修复 users 表结构 - 添加缺失的字段
-- 在 Supabase SQL 编辑器中执行此脚本

-- 1. 添加 current_city 字段
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'current_city'
    ) THEN
        ALTER TABLE users ADD COLUMN current_city TEXT;
        RAISE NOTICE '✅ Added current_city column to users table';
    ELSE
        RAISE NOTICE 'ℹ️ current_city column already exists in users table';
    END IF;
END $$;

-- 2. 添加 avatar_url 字段
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✅ Added avatar_url column to users table';
    ELSE
        RAISE NOTICE 'ℹ️ avatar_url column already exists in users table';
    END IF;
END $$;

-- 3. 验证修复结果
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN column_name IN ('current_city', 'avatar_url') THEN '✅ Fixed'
        ELSE 'ℹ️ Existing'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 4. 测试查询
SELECT 
    'Database structure check completed' as message,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name IN ('current_city', 'avatar_url') THEN 1 END) as fixed_columns
FROM information_schema.columns 
WHERE table_name = 'users';
