# 数据库迁移状态报告

## ✅ 已完成迁移的数据

### 1. 用户系统
- ✅ **users表** - 用户基本信息
- ✅ **user_profiles表** - 用户详细资料
- ✅ **user_preferences表** - 用户偏好设置（收藏、隐藏用户等）
- ✅ **invitations表** - 邀请系统（Coffee Meetup, Work Together）

### 2. 城市和地点系统
- ✅ **cities表** - 城市信息
- ✅ **places表** - 地点信息
- ✅ **place_reviews表** - 地点评论

## ⚠️ 仍在使用localStorage的数据（需要迁移）

### 1. 用户评分和评论系统
**文件**: `src/lib/ratingSystem.ts`, `src/lib/userRatingService.ts`
**数据**:
- 用户评分 (`user_ratings`)
- 用户评论 (`user_reviews`)
- 评分摘要 (`rating_summaries`)

**影响**: 用户评分和评论功能仍在使用localStorage

### 2. 聚会系统
**文件**: `src/lib/meetupSystem.ts`
**数据**:
- 聚会记录 (`meetups`)
- 聚会活动 (`meetup_activities`)
- 聚会参与者 (`meetup_participants`)

**影响**: 聚会创建、加入、评论功能仍在使用localStorage

### 3. 实时在线系统
**文件**: `src/lib/realtimeSystem.ts`
**数据**:
- 在线用户 (`user_activity`)
- 排行榜 (`leaderboard`)
- 活动事件 (`activity_events`)

**影响**: 实时在线状态、排行榜功能仍在使用localStorage

### 4. 投票系统
**文件**: `src/lib/votingSystem.ts`
**数据**:
- 城市投票 (`city_votes`)
- 用户投票记录 (`user_votes`)

**影响**: 城市投票功能仍在使用localStorage

### 5. 工具数据
**文件**: `src/lib/userDataSync.ts`, `src/lib/toolDataManager.ts`
**数据**:
- 域名追踪数据 (`domain_tracker`)
- 城市偏好数据 (`city_preferences`)
- 旅行规划数据 (`travel_planner`)

**影响**: 各种工具的用户数据仍在使用localStorage

## 🎯 需要创建的数据库表

### 1. 用户评分系统表
```sql
-- user_ratings表
CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rater_id UUID REFERENCES users(id),
    rated_user_id UUID REFERENCES users(id),
    category VARCHAR(50),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_reviews表
CREATE TABLE user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id),
    reviewed_user_id UUID REFERENCES users(id),
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 聚会系统表
```sql
-- meetups表
CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    meeting_time TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- meetup_participants表
CREATE TABLE meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'joined',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 实时系统表
```sql
-- user_activity表
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(50),
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 投票系统表
```sql
-- city_votes表
CREATE TABLE city_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id),
    user_id UUID REFERENCES users(id),
    vote_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 迁移优先级

### 高优先级 (影响核心功能)
1. **用户评分系统** - 影响用户互动和信任度
2. **聚会系统** - 影响社区功能
3. **实时在线系统** - 影响用户体验

### 中优先级 (影响工具功能)
4. **投票系统** - 影响城市评价
5. **工具数据** - 影响各种工具的数据持久化

## 🚀 下一步行动

1. **创建缺失的数据库表**
2. **更新服务层代码** - 从localStorage迁移到数据库API
3. **测试数据迁移** - 确保现有数据不丢失
4. **清理localStorage依赖** - 移除生产环境中的localStorage使用

## 📈 当前状态

- ✅ **核心用户系统**: 100% 已迁移
- ✅ **邀请系统**: 100% 已迁移  
- ⚠️ **评分系统**: 0% 已迁移 (仍使用localStorage)
- ⚠️ **聚会系统**: 0% 已迁移 (仍使用localStorage)
- ⚠️ **实时系统**: 0% 已迁移 (仍使用localStorage)
- ⚠️ **投票系统**: 0% 已迁移 (仍使用localStorage)

**总体迁移进度: 约40%**
