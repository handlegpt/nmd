#!/usr/bin/env node

/**
 * 翻译键补全脚本
 * 用于添加缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

// 缺失的翻译键
const MISSING_TRANSLATIONS = {
  en: {
    localNomads: {
      title: 'Local Nomads',
      youAreIn: 'You\'re in',
      showAll: 'Show All',
      showNearby: 'Show Nearby',
      nearby: 'people online nearby',
      global: 'nomads active globally',
      noUsers: 'No nomads online at the moment',
      coffee: 'Coffee',
      work: 'Work',
      rate: 'Rate',
      viewAll: 'View All Online Nomads'
    },
    meetups: {
      title: 'Meetups',
      create: 'Create Meetup',
      types: {
        all: 'All',
        coffee: 'Coffee',
        work: 'Work',
        social: 'Social'
      },
      noMeetups: 'No meetups available at the moment'
    }
  }
};

// 翻译文件路径
const TRANSLATION_FILES = [
  'src/locales/en.json',
  'src/i18n/translations/en.json'
];

// 更新翻译文件
function updateTranslationFile(filePath, translations) {
  try {
    let existingTranslations = {};
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      existingTranslations = JSON.parse(content);
    }
    
    // 深度合并翻译
    const mergedTranslations = deepMerge(existingTranslations, translations);
    
    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(mergedTranslations, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// 深度合并对象
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// 创建目录
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 主函数
function main() {
  console.log('🌐 开始修复缺失的翻译键...\n');
  
  try {
    const projectRoot = path.join(__dirname, '..');
    let updatedFiles = 0;
    
    Object.entries(MISSING_TRANSLATIONS).forEach(([locale, translations]) => {
      console.log(`📝 处理语言: ${locale}`);
      
      TRANSLATION_FILES.forEach(relativePath => {
        const fullPath = path.join(projectRoot, relativePath);
        
        // 确保目录存在
        ensureDirectoryExists(fullPath);
        
        // 更新翻译文件
        if (updateTranslationFile(fullPath, translations)) {
          console.log(`  ✅ 更新: ${relativePath}`);
          updatedFiles++;
        } else {
          console.log(`  ❌ 失败: ${relativePath}`);
        }
      });
    });
    
    console.log(`\n📊 统计:`);
    console.log(`  - 更新文件数: ${updatedFiles}`);
    console.log(`  - 语言数: ${Object.keys(MISSING_TRANSLATIONS).length}`);
    
    console.log('\n✅ 翻译键修复完成!');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = {
  updateTranslationFile,
  deepMerge,
  MISSING_TRANSLATIONS
};
