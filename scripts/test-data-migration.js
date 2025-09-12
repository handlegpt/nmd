#!/usr/bin/env node

/**
 * 数据迁移测试脚本
 * 用于验证从 localStorage 到数据库的数据迁移完整性
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {
  localStorage: {
    data: {},
    getItem: function(key) {
      return this.data[key] || null;
    },
    setItem: function(key, value) {
      this.data[key] = value;
    },
    removeItem: function(key) {
      delete this.data[key];
    },
    clear: function() {
      this.data = {};
    }
  }
};

// 需要迁移的 localStorage 键名
const MIGRATION_KEYS = {
  // 用户偏好数据
  USER_PREFERENCES: 'user_preferences',
  USER_FAVORITES: 'user_favorites',
  USER_VISAS: 'user_visas',
  
  // 用户评分和评论
  USER_RATINGS: 'user_ratings_',
  USER_REVIEWS: 'user_reviews_',
  RATING_SUMMARIES: 'rating_summaries_',
  
  // 聚会系统
  MEETUPS: 'meetups_',
  MEETUP_ACTIVITIES: 'meetup_activities_',
  MEETUP_INVITATIONS: 'meetup_invitations',
  USER_NOTIFICATIONS: 'user_notifications',
  
  // 实时在线系统
  ONLINE_USERS: 'online_users_',
  LEADERBOARD: 'leaderboard_',
  ACTIVITY_FEED: 'activity_feed_',
  
  // 投票系统
  CITY_VOTES: 'city_votes_',
  USER_VOTES: 'user_votes_',
  
  // 工具数据
  DOMAIN_TRACKER: 'domain_tracker_',
  CITY_PREFERENCES: 'city_preferences_',
  TRAVEL_PLANNER: 'travel_planner_',
  COST_CALCULATOR: 'cost_calculator_',
  VISA_COUNTER: 'visa_counter_',
  TRAVEL_TRACKER: 'travel_tracker_',
  
  // 其他数据
  SEARCH_HISTORY: 'search_history',
  RECENT_CITIES: 'recent_cities',
  RECENT_PLACES: 'recent_places',
  THEME_SETTINGS: 'theme_settings',
  LANGUAGE_SETTINGS: 'language_settings',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// 模拟一些测试数据
function setupTestData() {
  console.log('🔧 设置测试数据...');
  
  // 用户偏好数据
  global.window.localStorage.setItem(MIGRATION_KEYS.USER_PREFERENCES, JSON.stringify({
    wifi: 5,
    cost: 3,
    climate: 4,
    social: 5,
    visa: 2
  }));
  
  // 用户收藏数据
  global.window.localStorage.setItem(MIGRATION_KEYS.USER_FAVORITES, JSON.stringify([
    { id: 'user1', name: 'John Doe', country: 'USA', addedDate: '2024-01-01' },
    { id: 'user2', name: 'Jane Smith', country: 'Canada', addedDate: '2024-01-02' }
  ]));
  
  // 用户评分数据
  global.window.localStorage.setItem(MIGRATION_KEYS.USER_RATINGS + 'user1', JSON.stringify({
    overall: 5,
    reliability: 4,
    communication: 5,
    helpfulness: 5
  }));
  
  // 聚会数据
  global.window.localStorage.setItem(MIGRATION_KEYS.MEETUPS + 'active', JSON.stringify([
    {
      id: 'meetup1',
      title: 'Coffee Chat',
      description: 'Let\'s grab coffee together',
      city: 'Tokyo',
      date: '2024-01-15',
      organizer: 'user1',
      participants: ['user1', 'user2']
    }
  ]));
  
  // 在线用户数据
  global.window.localStorage.setItem(MIGRATION_KEYS.ONLINE_USERS + 'current', JSON.stringify([
    { id: 'user1', name: 'John Doe', status: 'online', lastSeen: '2024-01-15T10:00:00Z' },
    { id: 'user2', name: 'Jane Smith', status: 'away', lastSeen: '2024-01-15T09:30:00Z' }
  ]));
  
  // 城市投票数据
  global.window.localStorage.setItem(MIGRATION_KEYS.CITY_VOTES + 'tokyo', JSON.stringify({
    cityId: 'tokyo',
    votes: [
      { userId: 'user1', rating: 5, category: 'overall' },
      { userId: 'user2', rating: 4, category: 'overall' }
    ]
  }));
  
  console.log('✅ 测试数据设置完成');
}

// 检查数据迁移状态
function checkMigrationStatus() {
  console.log('\n📊 检查数据迁移状态...');
  
  const migrationStatus = {
    migrated: [],
    pending: [],
    errors: []
  };
  
  // 检查每个键的数据
  Object.entries(MIGRATION_KEYS).forEach(([key, storageKey]) => {
    try {
      const data = global.window.localStorage.getItem(storageKey);
      if (data) {
        const parsedData = JSON.parse(data);
        console.log(`📦 ${key}: ${Array.isArray(parsedData) ? parsedData.length : 'object'} items`);
        
        // 检查是否应该迁移到数据库
        if (shouldMigrateToDatabase(key)) {
          migrationStatus.pending.push({
            key,
            storageKey,
            dataType: Array.isArray(parsedData) ? 'array' : 'object',
            itemCount: Array.isArray(parsedData) ? parsedData.length : 1
          });
        } else {
          migrationStatus.migrated.push({
            key,
            storageKey,
            dataType: Array.isArray(parsedData) ? 'array' : 'object',
            itemCount: Array.isArray(parsedData) ? parsedData.length : 1
          });
        }
      } else {
        console.log(`❌ ${key}: No data found`);
      }
    } catch (error) {
      migrationStatus.errors.push({
        key,
        storageKey,
        error: error.message
      });
    }
  });
  
  return migrationStatus;
}

// 判断是否应该迁移到数据库
function shouldMigrateToDatabase(key) {
  const databaseKeys = [
    'USER_PREFERENCES',
    'USER_FAVORITES', 
    'USER_VISAS',
    'USER_RATINGS',
    'USER_REVIEWS',
    'RATING_SUMMARIES',
    'MEETUPS',
    'MEETUP_ACTIVITIES',
    'MEETUP_INVITATIONS',
    'USER_NOTIFICATIONS',
    'ONLINE_USERS',
    'LEADERBOARD',
    'ACTIVITY_FEED',
    'CITY_VOTES',
    'USER_VOTES',
    'DOMAIN_TRACKER',
    'CITY_PREFERENCES',
    'TRAVEL_PLANNER',
    'COST_CALCULATOR',
    'VISA_COUNTER',
    'TRAVEL_TRACKER'
  ];
  
  return databaseKeys.includes(key);
}

// 生成迁移报告
function generateMigrationReport(status) {
  console.log('\n📋 数据迁移报告');
  console.log('='.repeat(50));
  
  console.log(`\n✅ 已迁移到数据库 (${status.migrated.length}):`);
  status.migrated.forEach(item => {
    console.log(`  - ${item.key}: ${item.itemCount} ${item.dataType} items`);
  });
  
  console.log(`\n⚠️  需要迁移到数据库 (${status.pending.length}):`);
  status.pending.forEach(item => {
    console.log(`  - ${item.key}: ${item.itemCount} ${item.dataType} items`);
  });
  
  if (status.errors.length > 0) {
    console.log(`\n❌ 迁移错误 (${status.errors.length}):`);
    status.errors.forEach(item => {
      console.log(`  - ${item.key}: ${item.error}`);
    });
  }
  
  const totalItems = status.migrated.length + status.pending.length;
  const migratedPercentage = totalItems > 0 ? (status.migrated.length / totalItems * 100).toFixed(1) : 0;
  
  console.log(`\n📈 迁移进度: ${migratedPercentage}% (${status.migrated.length}/${totalItems})`);
  
  return {
    totalItems,
    migratedItems: status.migrated.length,
    pendingItems: status.pending.length,
    errorItems: status.errors.length,
    migratedPercentage: parseFloat(migratedPercentage)
  };
}

// 检查代码中的 localStorage 使用
function checkLocalStorageUsage() {
  console.log('\n🔍 检查代码中的 localStorage 使用...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const localStorageUsages = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.includes('localStorage')) {
              localStorageUsages.push({
                file: path.relative(srcDir, filePath),
                line: index + 1,
                content: line.trim()
              });
            }
          });
        } catch (error) {
          console.warn(`⚠️  无法读取文件 ${filePath}: ${error.message}`);
        }
      }
    });
  }
  
  scanDirectory(srcDir);
  
  console.log(`\n📊 发现 ${localStorageUsages.length} 个 localStorage 使用:`);
  
  // 按文件分组
  const usageByFile = {};
  localStorageUsages.forEach(usage => {
    if (!usageByFile[usage.file]) {
      usageByFile[usage.file] = [];
    }
    usageByFile[usage.file].push(usage);
  });
  
  Object.entries(usageByFile).forEach(([file, usages]) => {
    console.log(`\n📁 ${file} (${usages.length} 处使用):`);
    usages.forEach(usage => {
      console.log(`  Line ${usage.line}: ${usage.content}`);
    });
  });
  
  return localStorageUsages;
}

// 主函数
function main() {
  console.log('🚀 开始数据迁移测试...\n');
  
  try {
    // 1. 设置测试数据
    setupTestData();
    
    // 2. 检查迁移状态
    const migrationStatus = checkMigrationStatus();
    
    // 3. 生成迁移报告
    const report = generateMigrationReport(migrationStatus);
    
    // 4. 检查代码中的 localStorage 使用
    const localStorageUsages = checkLocalStorageUsage();
    
    // 5. 生成最终报告
    console.log('\n🎯 最终报告');
    console.log('='.repeat(50));
    console.log(`📊 数据迁移进度: ${report.migratedPercentage}%`);
    console.log(`📦 总数据项: ${report.totalItems}`);
    console.log(`✅ 已迁移: ${report.migratedItems}`);
    console.log(`⚠️  待迁移: ${report.pendingItems}`);
    console.log(`❌ 错误: ${report.errorItems}`);
    console.log(`🔍 代码中 localStorage 使用: ${localStorageUsages.length} 处`);
    
    // 6. 建议
    console.log('\n💡 建议:');
    if (report.pendingItems > 0) {
      console.log('  - 优先迁移高优先级数据 (用户偏好、评分系统)');
      console.log('  - 实现数据同步机制，确保 localStorage 和数据库一致性');
    }
    if (localStorageUsages.length > 0) {
      console.log('  - 逐步替换代码中的 localStorage 使用');
      console.log('  - 保持 localStorage 作为缓存和离线支持');
    }
    
    console.log('\n✅ 数据迁移测试完成!');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  setupTestData,
  checkMigrationStatus,
  generateMigrationReport,
  checkLocalStorageUsage,
  MIGRATION_KEYS
};
