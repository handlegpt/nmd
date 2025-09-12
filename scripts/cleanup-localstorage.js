#!/usr/bin/env node

/**
 * localStorage 清理脚本
 * 用于移除生产环境中不必要的 localStorage 使用
 */

const fs = require('fs');
const path = require('path');

// 需要清理的 localStorage 使用模式
const CLEANUP_PATTERNS = [
  // 1. 直接 localStorage 调用
  {
    pattern: /localStorage\.getItem\(['"`]([^'"`]+)['"`]\)/g,
    replacement: '// TODO: Replace with database API call for $1',
    description: 'Replace localStorage.getItem with database API'
  },
  {
    pattern: /localStorage\.setItem\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
    replacement: '// TODO: Replace with database API call for $1',
    description: 'Replace localStorage.setItem with database API'
  },
  {
    pattern: /localStorage\.removeItem\(['"`]([^'"`]+)['"`]\)/g,
    replacement: '// TODO: Replace with database API call for $1',
    description: 'Replace localStorage.removeItem with database API'
  },
  {
    pattern: /localStorage\.clear\(\)/g,
    replacement: '// TODO: Replace with database API call',
    description: 'Replace localStorage.clear with database API'
  }
];

// 需要保留的 localStorage 使用（用于缓存和离线支持）
const PRESERVE_PATTERNS = [
  'theme',
  'language',
  'session_token',
  'user_profile_details', // 临时保留，作为缓存
  'login_email',
  'quickStartCompleted'
];

// 需要完全移除的 localStorage 键
const REMOVE_KEYS = [
  'nomadFavorites',
  'hidden_nomad_users',
  'user_ratings_',
  'user_reviews_',
  'rating_summaries_',
  'meetups_',
  'meetup_activities_',
  'meetup_invitations',
  'user_notifications',
  'online_users_',
  'leaderboard_',
  'activity_feed_',
  'city_votes_',
  'user_votes_',
  'domain_tracker_',
  'city_preferences_',
  'travel_planner_',
  'cost_calculator_',
  'visa_counter_',
  'travel_tracker_',
  'search_history',
  'recent_cities',
  'recent_places',
  'notification_settings'
];

// 扫描目录中的文件
function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// 检查是否应该保留这个 localStorage 使用
function shouldPreserve(key) {
  return PRESERVE_PATTERNS.some(pattern => 
    key.includes(pattern) || pattern.includes(key)
  );
}

// 检查是否应该移除这个 localStorage 使用
function shouldRemove(key) {
  return REMOVE_KEYS.some(pattern => 
    key.includes(pattern) || pattern.includes(key)
  );
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // 检查 localStorage 使用
    const localStorageMatches = content.match(/localStorage\.[a-zA-Z]+\([^)]+\)/g) || [];
    
    if (localStorageMatches.length === 0) {
      return { file: filePath, modified: false, changes: [] };
    }
    
    const changes = [];
    
    // 处理每个 localStorage 使用
    localStorageMatches.forEach(match => {
      // 提取键名
      const keyMatch = match.match(/localStorage\.[a-zA-Z]+\(['"`]([^'"`]+)['"`]/);
      if (keyMatch) {
        const key = keyMatch[1];
        
        if (shouldRemove(key)) {
          // 完全移除这个 localStorage 使用
          newContent = newContent.replace(match, '// REMOVED: localStorage usage for ' + key);
          changes.push(`Removed localStorage usage for: ${key}`);
          modified = true;
        } else if (!shouldPreserve(key)) {
          // 替换为 TODO 注释
          newContent = newContent.replace(match, `// TODO: Replace localStorage with database API for ${key}`);
          changes.push(`Marked for replacement: ${key}`);
          modified = true;
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    return { file: filePath, modified, changes };
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return { file: filePath, modified: false, error: error.message };
  }
}

// 生成清理报告
function generateCleanupReport(results) {
  console.log('\n📋 localStorage 清理报告');
  console.log('='.repeat(50));
  
  const modifiedFiles = results.filter(r => r.modified);
  const errorFiles = results.filter(r => r.error);
  
  console.log(`\n📊 统计:`);
  console.log(`  - 总文件数: ${results.length}`);
  console.log(`  - 修改文件数: ${modifiedFiles.length}`);
  console.log(`  - 错误文件数: ${errorFiles.length}`);
  
  if (modifiedFiles.length > 0) {
    console.log(`\n✅ 已修改的文件:`);
    modifiedFiles.forEach(result => {
      console.log(`\n📁 ${result.file}:`);
      result.changes.forEach(change => {
        console.log(`  - ${change}`);
      });
    });
  }
  
  if (errorFiles.length > 0) {
    console.log(`\n❌ 处理错误的文件:`);
    errorFiles.forEach(result => {
      console.log(`  - ${result.file}: ${result.error}`);
    });
  }
  
  console.log(`\n💡 建议:`);
  console.log(`  - 检查修改的文件，确保功能正常`);
  console.log(`  - 实现数据库 API 替换 TODO 注释`);
  console.log(`  - 测试应用功能，确保没有破坏性更改`);
  
  return {
    totalFiles: results.length,
    modifiedFiles: modifiedFiles.length,
    errorFiles: errorFiles.length,
    results
  };
}

// 主函数
function main() {
  console.log('🧹 开始 localStorage 清理...\n');
  
  try {
    const srcDir = path.join(__dirname, '..', 'src');
    
    if (!fs.existsSync(srcDir)) {
      console.error('❌ src 目录不存在');
      process.exit(1);
    }
    
    console.log(`📁 扫描目录: ${srcDir}`);
    const files = scanDirectory(srcDir);
    console.log(`📦 找到 ${files.length} 个文件\n`);
    
    const results = files.map(processFile);
    const report = generateCleanupReport(results);
    
    console.log('\n✅ localStorage 清理完成!');
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行清理
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  generateCleanupReport,
  shouldPreserve,
  shouldRemove,
  CLEANUP_PATTERNS,
  PRESERVE_PATTERNS,
  REMOVE_KEYS
};
