# 用户数据同步系统使用指南

## 概述

为了解决用户数据在不同浏览器间不同步的问题，我们建立了一个统一的用户数据同步系统。这个系统确保用户在任何设备上登录时都能访问到完整的数据。

## 系统架构

### 1. 数据存储层次

```
┌─────────────────────────────────────────────────────────────┐
│                    用户数据同步系统                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   用户资料      │  │   工具数据      │  │   缓存层     │ │
│  │  (Profile)      │  │  (Tool Data)    │  │ (LocalStorage)│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Supabase 数据库                          │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ user_profiles   │  │ user_tool_data  │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. 核心组件

- **UserDataSyncService**: 统一的数据同步服务
- **ToolDataManager**: 工具数据管理器
- **数据库表**: `user_profiles`, `user_tool_data`

## 使用方法

### 1. 用户资料同步

#### 加载用户资料
```typescript
import { userDataSync } from '@/lib/userDataSync'

// 从服务器加载用户资料
const profile = await userDataSync.loadUserProfile(userId)
if (profile) {
  // 使用服务器数据
  setProfile(profile)
} else {
  // 使用本地缓存或创建默认资料
  const localProfile = userDataSync.getLocalUserProfile()
  if (localProfile) {
    setProfile(localProfile)
    // 同步到服务器
    await userDataSync.saveUserProfile(userId, localProfile)
  }
}
```

#### 保存用户资料
```typescript
// 保存到服务器和本地
const success = await userDataSync.saveUserProfile(userId, profileData)
if (success) {
  console.log('Profile saved successfully')
} else {
  // 即使服务器保存失败，也保存到本地
  localStorage.setItem('user_profile_details', JSON.stringify(profileData))
}
```

### 2. 工具数据同步

#### 使用预定义配置
```typescript
import { createToolDataManager, TOOL_CONFIGS } from '@/lib/toolDataManager'

// 创建Domain Tracker数据管理器
const domainManager = createToolDataManager(TOOL_CONFIGS.DOMAIN_TRACKER)
await domainManager.initialize(userId)

// 设置数据
await domainManager.setData('domains', domains)
await domainManager.setData('transactions', transactions)

// 获取数据
const domains = domainManager.getData('domains')
const transactions = domainManager.getData('transactions')
```

#### 创建自定义工具
```typescript
// 定义工具配置
const customToolConfig = {
  toolName: 'my_custom_tool',
  dataKeys: ['data1', 'data2', 'settings'],
  encryption: true,
  autoSync: true,
  conflictResolution: 'server'
}

// 创建管理器
const manager = createToolDataManager(customToolConfig)
await manager.initialize(userId)

// 使用
await manager.setData('data1', myData)
const data = manager.getData('data1')
```

### 3. 在React组件中使用

#### 使用Hook
```typescript
import { useToolDataManager } from '@/lib/toolDataManager.example'

function MyToolComponent() {
  const { data, loading, setData, sync } = useToolDataManager(
    TOOL_CONFIGS.DOMAIN_TRACKER,
    userId
  )
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <button onClick={() => setData('domains', newDomains)}>
        Save Domains
      </button>
      <button onClick={sync}>
        Sync Data
      </button>
    </div>
  )
}
```

#### 直接使用管理器
```typescript
function MyToolComponent() {
  const [manager] = useState(() => createToolDataManager(TOOL_CONFIGS.DOMAIN_TRACKER))
  const [data, setData] = useState({})
  
  useEffect(() => {
    const initializeManager = async () => {
      await manager.initialize(userId)
      setData(manager.getAllData())
    }
    
    initializeManager()
    
    // 监听数据变化
    const unsubscribe = manager.addListener(setData)
    return unsubscribe
  }, [])
  
  return <div>{/* 组件内容 */}</div>
}
```

## 数据同步流程

### 1. 用户登录时
```
用户登录 → 设置JWT令牌 → 同步所有用户数据 → 跳转到仪表板
```

### 2. 数据保存时
```
用户操作 → 更新本地状态 → 保存到服务器 → 更新本地缓存
```

### 3. 数据加载时
```
页面加载 → 尝试从服务器加载 → 失败则使用本地缓存 → 同步到服务器
```

## 配置选项

### ToolDataConfig
```typescript
interface ToolDataConfig {
  toolName: string           // 工具名称
  dataKeys: string[]         // 数据键名列表
  encryption?: boolean       // 是否加密（默认true）
  autoSync?: boolean         // 自动同步（默认true）
  conflictResolution?: 'server' | 'client' | 'merge'  // 冲突解决策略
}
```

### 预定义配置
```typescript
export const TOOL_CONFIGS = {
  DOMAIN_TRACKER: {
    toolName: 'domain_tracker',
    dataKeys: ['domains', 'transactions', 'stats', 'settings'],
    encryption: true,
    autoSync: true,
    conflictResolution: 'server'
  },
  CITY_PREFERENCES: {
    toolName: 'city_preferences',
    dataKeys: ['favorites', 'visited', 'wishlist', 'ratings'],
    encryption: false,
    autoSync: true,
    conflictResolution: 'merge'
  }
}
```

## 最佳实践

### 1. 错误处理
```typescript
try {
  await userDataSync.saveUserProfile(userId, profile)
} catch (error) {
  console.error('Failed to save to server:', error)
  // 保存到本地作为备份
  localStorage.setItem('user_profile_details', JSON.stringify(profile))
}
```

### 2. 性能优化
```typescript
// 批量操作
await manager.setMultipleData({
  domains: newDomains,
  transactions: newTransactions,
  stats: newStats
})

// 防抖保存
const debouncedSave = debounce(() => {
  manager.syncData()
}, 1000)
```

### 3. 数据验证
```typescript
// 在保存前验证数据
const isValid = validateData(data)
if (isValid) {
  await manager.setData('domains', data)
} else {
  throw new Error('Invalid data')
}
```

## 数据库表结构

### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### user_tool_data
```sql
CREATE TABLE user_tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  version BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);
```

## 迁移指南

### 从localStorage迁移到同步系统

1. **更新现有工具**
```typescript
// 旧方式
const data = localStorage.getItem('my_tool_data')
localStorage.setItem('my_tool_data', JSON.stringify(newData))

// 新方式
const manager = createToolDataManager(TOOL_CONFIGS.MY_TOOL)
await manager.initialize(userId)
const data = manager.getData('data')
await manager.setData('data', newData)
```

2. **数据迁移**
```typescript
// 迁移现有数据
const oldData = localStorage.getItem('old_tool_data')
if (oldData) {
  const parsedData = JSON.parse(oldData)
  await manager.setData('data', parsedData)
  localStorage.removeItem('old_tool_data')
}
```

## 故障排除

### 常见问题

1. **数据不同步**
   - 检查网络连接
   - 验证用户ID是否正确
   - 查看控制台错误信息

2. **数据丢失**
   - 检查本地缓存
   - 验证服务器数据
   - 使用数据恢复功能

3. **性能问题**
   - 减少自动同步频率
   - 使用批量操作
   - 优化数据大小

### 调试工具
```typescript
// 启用调试日志
localStorage.setItem('debug_user_sync', 'true')

// 手动同步
await userDataSync.syncAllUserData(userId)

// 清除缓存
userDataSync.clearLocalCache(userId)
```

## 未来扩展

1. **离线支持**: 使用Service Worker实现离线数据同步
2. **冲突解决**: 实现更复杂的冲突解决策略
3. **数据压缩**: 对大文件进行压缩存储
4. **版本控制**: 实现数据版本管理和回滚功能
5. **多设备同步**: 支持实时多设备数据同步
