-- 检查 meetups 表是否存在及其结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'meetups' 
ORDER BY ordinal_position;

-- 检查 meetup_participants 表是否存在及其结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'meetup_participants' 
ORDER BY ordinal_position;

-- 检查表中是否有数据
SELECT COUNT(*) as meetups_count FROM meetups;
SELECT COUNT(*) as participants_count FROM meetup_participants;
