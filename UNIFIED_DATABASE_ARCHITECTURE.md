# 统一数据库架构设计

## 🎯 架构概述

使用单一Supabase PostgreSQL数据库，通过Schema分离实现数据管理：

- **content schema**: Directus管理的内容数据
- **app schema**: 应用管理的用户数据

## 📊 Schema设计

### Content Schema (Directus管理)
```sql
-- 城市信息
CREATE SCHEMA content;

CREATE TABLE content.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    timezone VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visa_days INTEGER,
    visa_type VARCHAR(100),
    cost_of_living DECIMAL(10, 2),
    wifi_speed INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 地点推荐
CREATE TABLE content.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    city_id UUID REFERENCES content.cities(id),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    tags TEXT[],
    wifi_speed INTEGER,
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 5),
    noise_level VARCHAR(20),
    social_atmosphere VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 文章和指南
CREATE TABLE content.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    city_id UUID REFERENCES content.cities(id),
    author_id UUID,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### App Schema (应用管理)
```sql
-- 用户数据
CREATE SCHEMA app;

CREATE TABLE app.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户偏好
CREATE TABLE app.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app.users(id),
    budget_range VARCHAR(50),
    visa_type VARCHAR(100),
    work_style VARCHAR(100),
    climate_preference VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 城市投票
CREATE TABLE app.city_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app.users(id),
    city_id UUID REFERENCES content.cities(id), -- 跨Schema引用
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    wifi_rating INTEGER CHECK (wifi_rating BETWEEN 1 AND 5),
    social_rating INTEGER CHECK (social_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    climate_rating INTEGER CHECK (climate_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 地点投票
CREATE TABLE app.place_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app.users(id),
    place_id UUID REFERENCES content.places(id), -- 跨Schema引用
    vote_type VARCHAR(20) CHECK (vote_type IN ('upvote', 'downvote')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- 用户收藏
CREATE TABLE app.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app.users(id),
    city_id UUID REFERENCES content.cities(id), -- 跨Schema引用
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- 社区聊天
CREATE TABLE app.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app.users(id),
    city_id UUID REFERENCES content.cities(id), -- 跨Schema引用
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 权限配置

### Directus权限
```sql
-- 创建Directus专用用户
CREATE USER directus_user WITH PASSWORD 'your-directus-password';

-- 只授予content schema权限
GRANT USAGE ON SCHEMA content TO directus_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content TO directus_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA content TO directus_user;

-- 授予app schema只读权限（用于引用）
GRANT USAGE ON SCHEMA app TO directus_user;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO directus_user;
```

### Supabase RLS策略
```sql
-- 启用RLS
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.city_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.chat_messages ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON app.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own preferences" ON app.user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own votes" ON app.city_votes
    FOR ALL USING (auth.uid() = user_id);

-- 聊天消息：用户可以看到所有消息，但只能删除自己的
CREATE POLICY "Users can view all messages" ON app.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own messages" ON app.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON app.chat_messages
    FOR DELETE USING (auth.uid() = user_id);
```

## 🔄 数据同步和事件

### Directus Webhooks
```javascript
// 城市数据更新时触发
{
  "trigger": "items.update",
  "collection": "cities",
  "action": "sync_search_index"
}

// 地点数据更新时触发
{
  "trigger": "items.update", 
  "collection": "places",
  "action": "update_city_stats"
}
```

### Supabase Edge Functions
```typescript
// 处理Directus webhook
export default async function handler(req: Request) {
  const { collection, action, payload } = await req.json();
  
  switch (collection) {
    case 'cities':
      await updateCityStats(payload);
      break;
    case 'places':
      await updatePlaceStats(payload);
      break;
  }
}
```

## 📈 查询示例

### 跨Schema查询
```sql
-- 获取用户投票的城市及其详细信息
SELECT 
    cv.overall_rating,
    cv.comment,
    c.name as city_name,
    c.country,
    c.cost_of_living
FROM app.city_votes cv
JOIN content.cities c ON cv.city_id = c.id
WHERE cv.user_id = $1;

-- 获取城市的平均评分和投票数
SELECT 
    c.name,
    c.country,
    AVG(cv.overall_rating) as avg_rating,
    COUNT(cv.id) as vote_count
FROM content.cities c
LEFT JOIN app.city_votes cv ON c.id = cv.city_id
GROUP BY c.id, c.name, c.country
ORDER BY avg_rating DESC;
```

## 🚀 部署步骤

1. **配置Supabase连接**
   ```bash
   # .env文件
   DB_HOST=db.xdpjstyoeqgvaacduzdw.supabase.co
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USER=postgres.xdpjstyoeqgvaacduzdw
   DB_PASSWORD=your-supabase-password
   ```

2. **创建Schema和表**
   ```bash
   # 在Supabase SQL编辑器中执行上述SQL
   ```

3. **配置Directus**
   ```bash
   # 使用content schema权限的用户连接
   DB_USER=directus_user
   DB_PASSWORD=your-directus-password
   ```

4. **部署应用**
   ```bash
   docker-compose up -d
   ```

## ✅ 优势总结

- **统一备份**: 一次备份所有数据
- **跨表查询**: 支持JOIN和外键约束
- **简化迁移**: 单数据库迁移策略
- **数据一致性**: 外键约束保证数据完整性
- **性能优化**: 统一查询优化和索引策略
- **监控统一**: 单一数据库监控和告警
