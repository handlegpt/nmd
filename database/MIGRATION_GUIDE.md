# Nomad Agent Database Migration Guide

## 现有数据库结构分析

根据检查结果，现有的 `cities` 表结构与新的 Nomad Agent 设计有差异：

### 现有字段：
- `id` (uuid) - 使用 UUID 而不是 SERIAL
- `name`, `country`, `country_code`, `timezone` - 基本匹配
- `latitude`, `longitude` - 匹配
- `visa_days`, `visa_type` - 现有字段，需要保留
- `cost_of_living`, `wifi_speed` - 现有字段，需要保留
- `created_at`, `updated_at` - 匹配

### 需要添加的字段：
- `slug` - URL友好的标识符
- `country_name` - 国家全名
- `population`, `language`, `currency` - 城市基本信息
- `climate_tag`, `safety_score` - 环境评分
- `cost_min_usd`, `cost_max_usd` - 成本区间
- `nomad_score`, `community_score`, `coffee_score`, `coworking_score` - 数字游民评分
- `is_active` - 是否激活

## 迁移步骤

### 1. 检查现有表结构
```sql
-- 运行这个查询来检查现有表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cities' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 2. 迁移现有 cities 表
```sql
-- 运行 database/migrate_existing_cities.sql
-- 这个脚本会：
-- - 添加缺失的字段
-- - 从现有数据生成新字段的值
-- - 创建必要的索引和约束
```

### 3. 创建其他新表
```sql
-- 运行 database/nomad_agent_schema_safe.sql
-- 这个脚本会：
-- - 创建所有新的表（nomad_visas, city_costs, travel_plans 等）
-- - 创建视图、触发器、RLS策略
-- - 插入示例数据
```

## 执行顺序

1. **先运行**: `database/migrate_existing_cities.sql`
2. **再运行**: `database/nomad_agent_schema_safe.sql`

## 数据迁移策略

### 现有数据保留
- 所有现有的城市数据都会被保留
- 现有字段值会被用来计算新字段的默认值
- 不会丢失任何现有数据

### 新字段默认值
- `slug`: 从 `name` 和 `country` 生成
- `country_name`: 从 `country_code` 映射
- `wifi_speed_mbps`: 使用现有的 `wifi_speed` 值
- `cost_min_usd`: `cost_of_living * 0.8`
- `cost_max_usd`: `cost_of_living * 1.2`
- `nomad_score`: 基于现有 `wifi_speed` 和 `cost_of_living` 计算
- 其他评分字段: 默认值 7.0

## 验证迁移

迁移完成后，可以运行以下查询验证：

```sql
-- 检查 cities 表的新结构
SELECT * FROM cities LIMIT 5;

-- 检查新创建的表
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('nomad_visas', 'city_costs', 'travel_plans', 'plan_legs', 'plan_days', 'plan_items', 'user_preferences', 'user_nomad_visa_applications', 'data_sources')
ORDER BY tablename;

-- 检查视图
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('city_overview', 'plan_details');
```

## 回滚计划

如果需要回滚，可以：

1. 删除新添加的字段：
```sql
ALTER TABLE cities DROP COLUMN IF EXISTS slug;
ALTER TABLE cities DROP COLUMN IF EXISTS country_name;
-- ... 其他字段
```

2. 删除新创建的表：
```sql
DROP TABLE IF EXISTS data_sources CASCADE;
DROP TABLE IF EXISTS user_nomad_visa_applications CASCADE;
-- ... 其他表
```

## 注意事项

- 迁移是安全的，不会影响现有数据
- 建议在测试环境先验证
- 迁移过程中数据库会短暂锁定
- 确保有足够的存储空间
