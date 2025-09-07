-- 清理 users 表，移除可能由 Directus 添加的隐藏字段
-- 这个脚本需要直接在 Supabase 数据库中执行

-- 1. 检查是否存在 ip_address 字段
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'ip_address'
    ) THEN
        -- 如果存在，删除这个字段
        ALTER TABLE users DROP COLUMN ip_address;
        RAISE NOTICE 'ip_address column dropped from users table';
    ELSE
        RAISE NOTICE 'ip_address column does not exist in users table';
    END IF;
END $$;

-- 2. 检查并清理其他可能由 Directus 添加的字段
DO $$
BEGIN
    -- 检查是否存在其他可能的问题字段
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE users DROP COLUMN status;
        RAISE NOTICE 'status column dropped from users table';
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP COLUMN role;
        RAISE NOTICE 'role column dropped from users table';
    END IF;
END $$;

-- 3. 确保表结构正确
-- 重新创建表以确保结构正确（如果需要的话）
-- 注意：这会删除所有数据，只在开发环境中使用
