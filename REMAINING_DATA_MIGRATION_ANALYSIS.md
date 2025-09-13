# 剩余数据迁移分析报告

## 📊 数据迁移状态总览

### ✅ 已完成迁移的数据
1. **用户偏好数据** - `user_preferences` 表
   - `nomadFavorites` → `favorites` (JSONB)
   - `hidden_nomad_users` → `hidden_users` (JSONB)
   - `blocked_users` → `blocked_users` (JSONB)

2. **用户基础数据** - `users` 表
   - 用户基本信息、头像、偏好等

3. **在线用户状态** - `online_users` 表
   - 用户在线状态、最后活跃时间等

4. **聚会数据** - `meetups` 表
   - 聚会信息、参与者等

### 🔄 需要迁移的数据类型

## 1. 城市相关数据 (高优先级)

### 1.1 城市收藏数据
- **localStorage 键**: `cityFavorites`
- **用途**: 用户收藏的城市列表
- **建议表结构**: 
  ```sql
  CREATE TABLE user_city_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
  );
  ```

### 1.2 城市轨迹数据
- **localStorage 键**: `city_trajectory`
- **用途**: 用户访问过的城市历史
- **建议表结构**:
  ```sql
  CREATE TABLE user_city_trajectory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_days INTEGER,
    coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 1.3 城市评论数据
- **localStorage 键**: `city_reviews_${cityId}`
- **用途**: 用户对城市的评论和评分
- **建议表结构**:
  ```sql
  CREATE TABLE user_city_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

## 2. 工具数据 (中优先级)

### 2.1 域名追踪器数据
- **localStorage 键**: `domainTracker_domains`, `domainTracker_transactions`, `domainTracker_stats`
- **用途**: 域名管理工具的数据
- **建议表结构**:
  ```sql
  CREATE TABLE user_tool_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_name)
  );
  ```

### 2.2 投票系统数据
- **localStorage 键**: `${storageKey}_${cityId}`, `${userVotesKey}_${userId}`
- **用途**: 城市投票数据
- **建议表结构**:
  ```sql
  CREATE TABLE user_city_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    vote_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id, vote_type)
  );
  ```

### 2.3 搜索历史数据
- **localStorage 键**: `searchHistory`
- **用途**: 用户搜索历史
- **建议表结构**:
  ```sql
  CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    search_type VARCHAR(50),
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

## 3. 位置和连接数据 (中优先级)

### 3.1 用户位置数据
- **localStorage 键**: `userLocation`
- **用途**: 用户当前位置信息
- **建议表结构**:
  ```sql
  CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(255),
    country VARCHAR(255),
    accuracy INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 3.2 用户连接数据
- **localStorage 键**: `nomad_connections`
- **用途**: 用户之间的连接关系
- **建议表结构**:
  ```sql
  CREATE TABLE user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) DEFAULT 'friend',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, connected_user_id)
  );
  ```

## 4. 媒体和内容数据 (低优先级)

### 4.1 城市照片数据
- **localStorage 键**: `city_photos_${cityName}`
- **用途**: 用户上传的城市照片
- **建议表结构**:
  ```sql
  CREATE TABLE user_city_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    photo_description TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 4.2 本地地点数据
- **localStorage 键**: `nomad_local_places`
- **用途**: 用户收藏的本地地点
- **建议表结构**:
  ```sql
  CREATE TABLE user_local_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(255) NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    place_type VARCHAR(100),
    coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

## 5. 系统数据 (低优先级)

### 5.1 错误监控数据
- **localStorage 键**: `react_errors`, `react_errors_detailed`
- **用途**: 前端错误日志
- **建议表结构**:
  ```sql
  CREATE TABLE user_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    error_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 5.2 网络速度测试数据
- **localStorage 键**: `speedTestResults`
- **用途**: WiFi 速度测试结果
- **建议表结构**:
  ```sql
  CREATE TABLE user_speed_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    download_speed DECIMAL(10, 2),
    upload_speed DECIMAL(10, 2),
    ping_ms INTEGER,
    test_location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

## 6. 用户设置数据 (低优先级)

### 6.1 用户设置
- **localStorage 键**: `userSettings`
- **用途**: 用户应用设置
- **建议表结构**:
  ```sql
  CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
  );
  ```

### 6.2 通知设置
- **localStorage 键**: `nomad_notification_settings`
- **用途**: 用户通知偏好设置
- **建议表结构**:
  ```sql
  CREATE TABLE user_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    meetup_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
  );
  ```

## 📋 迁移优先级建议

### 🔴 高优先级 (立即迁移)
1. **城市收藏数据** - 用户核心功能
2. **城市轨迹数据** - 用户核心功能
3. **城市评论数据** - 用户核心功能

### 🟡 中优先级 (近期迁移)
1. **工具数据** - 域名追踪器等工具
2. **投票系统数据** - 社区功能
3. **搜索历史数据** - 用户体验
4. **用户位置数据** - 位置相关功能
5. **用户连接数据** - 社交功能

### 🟢 低优先级 (后期迁移)
1. **媒体和内容数据** - 照片、地点等
2. **系统数据** - 错误日志、速度测试等
3. **用户设置数据** - 应用设置、通知设置等

## 🚀 实施建议

### 阶段 1: 核心数据迁移 (1-2周)
- 创建城市相关数据表
- 实现城市收藏、轨迹、评论的迁移
- 更新相关 API 和前端代码

### 阶段 2: 工具数据迁移 (2-3周)
- 创建工具数据表
- 实现域名追踪器等工具的迁移
- 更新工具相关功能

### 阶段 3: 系统数据迁移 (3-4周)
- 创建系统数据表
- 实现错误日志、设置等迁移
- 完善数据同步机制

## 📊 数据量估算

基于当前用户数量 (1个真实用户 + 测试数据):
- **城市数据**: ~50-100 条记录
- **工具数据**: ~20-50 条记录
- **系统数据**: ~100-200 条记录

总计约 200-400 条记录需要迁移。

## 🔧 技术实现要点

1. **批量迁移**: 使用批量插入提高效率
2. **数据验证**: 确保数据完整性和一致性
3. **回滚机制**: 提供数据迁移的回滚功能
4. **增量同步**: 支持增量数据同步
5. **错误处理**: 完善的错误处理和日志记录

---

*此分析报告基于当前代码库的 localStorage 使用情况，建议按优先级逐步实施数据迁移。*
