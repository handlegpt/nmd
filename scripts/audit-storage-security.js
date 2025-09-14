#!/usr/bin/env node

/**
 * 本地存储安全审计脚本
 * 用于分析localStorage和sessionStorage的使用情况，识别潜在的安全风险
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 敏感数据关键词
const SENSITIVE_KEYWORDS = [
  'password',
  'token',
  'key',
  'secret',
  'auth',
  'credential',
  'session',
  'cookie',
  'jwt',
  'api_key',
  'access_token',
  'refresh_token',
  'private_key',
  'client_secret',
  'user_password',
  'verification_code',
  'otp',
  'pin',
  'ssn',
  'credit_card',
  'bank_account',
  'phone_number',
  'address',
  'ip_address',
  'user_agent',
  'referer',
  'authorization',
  'x-api-key',
  'x-auth-token',
  'email',
  'profile',
  'personal',
  'private',
  'sensitive'
]

// 高风险存储模式
const HIGH_RISK_PATTERNS = [
  /localStorage\.setItem\([^,]+,\s*[^)]*token[^)]*\)/gi,
  /localStorage\.setItem\([^,]+,\s*[^)]*password[^)]*\)/gi,
  /localStorage\.setItem\([^,]+,\s*[^)]*secret[^)]*\)/gi,
  /localStorage\.setItem\([^,]+,\s*[^)]*key[^)]*\)/gi,
  /sessionStorage\.setItem\([^,]+,\s*[^)]*token[^)]*\)/gi,
  /sessionStorage\.setItem\([^,]+,\s*[^)]*password[^)]*\)/gi,
  /sessionStorage\.setItem\([^,]+,\s*[^)]*secret[^)]*\)/gi,
  /sessionStorage\.setItem\([^,]+,\s*[^)]*key[^)]*\)/gi
]

// 需要审计的文件模式
const FILE_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx'
]

// 排除的文件和目录
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  '**/*.d.ts',
  '**/test/**',
  '**/tests/**',
  '**/__tests__/**',
  '**/spec/**',
  '**/specs/**'
]

// 审计统计
let auditStats = {
  filesProcessed: 0,
  totalStorageUsage: 0,
  localStorageUsage: 0,
  sessionStorageUsage: 0,
  sensitiveStorageUsage: 0,
  highRiskStorageUsage: 0,
  unencryptedStorageUsage: 0,
  storageItems: [],
  securityIssues: [],
  recommendations: []
}

/**
 * 检查存储项是否包含敏感信息
 */
function isSensitiveStorage(key, value) {
  const lowerKey = key.toLowerCase()
  const lowerValue = (value || '').toLowerCase()
  
  return SENSITIVE_KEYWORDS.some(keyword => 
    lowerKey.includes(keyword.toLowerCase()) || 
    lowerValue.includes(keyword.toLowerCase())
  )
}

/**
 * 检查是否匹配高风险模式
 */
function isHighRiskStorage(code) {
  return HIGH_RISK_PATTERNS.some(pattern => pattern.test(code))
}

/**
 * 提取存储键名
 */
function extractStorageKey(code) {
  const keyMatch = code.match(/\.setItem\(['"`]([^'"`]+)['"`]/)
  return keyMatch ? keyMatch[1] : 'unknown'
}

/**
 * 提取存储值
 */
function extractStorageValue(code) {
  const valueMatch = code.match(/\.setItem\([^,]+,\s*(.+)\)/)
  return valueMatch ? valueMatch[1].trim() : 'unknown'
}

/**
 * 分析单个文件中的存储使用
 */
function analyzeFileStorage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // 检查localStorage使用
      if (trimmedLine.includes('localStorage.')) {
        auditStats.localStorageUsage++
        auditStats.totalStorageUsage++
        
        const storageItem = {
          file: filePath,
          line: index + 1,
          type: 'localStorage',
          code: trimmedLine,
          key: extractStorageKey(trimmedLine),
          value: extractStorageValue(trimmedLine),
          isSensitive: false,
          isHighRisk: false,
          isEncrypted: false
        }
        
        // 检查是否敏感
        if (isSensitiveStorage(storageItem.key, storageItem.value)) {
          storageItem.isSensitive = true
          auditStats.sensitiveStorageUsage++
        }
        
        // 检查是否高风险
        if (isHighRiskStorage(trimmedLine)) {
          storageItem.isHighRisk = true
          auditStats.highRiskStorageUsage++
        }
        
        // 检查是否加密
        if (!trimmedLine.includes('encrypt') && !trimmedLine.includes('cipher')) {
          storageItem.isEncrypted = false
          auditStats.unencryptedStorageUsage++
        }
        
        auditStats.storageItems.push(storageItem)
      }
      
      // 检查sessionStorage使用
      if (trimmedLine.includes('sessionStorage.')) {
        auditStats.sessionStorageUsage++
        auditStats.totalStorageUsage++
        
        const storageItem = {
          file: filePath,
          line: index + 1,
          type: 'sessionStorage',
          code: trimmedLine,
          key: extractStorageKey(trimmedLine),
          value: extractStorageValue(trimmedLine),
          isSensitive: false,
          isHighRisk: false,
          isEncrypted: false
        }
        
        // 检查是否敏感
        if (isSensitiveStorage(storageItem.key, storageItem.value)) {
          storageItem.isSensitive = true
          auditStats.sensitiveStorageUsage++
        }
        
        // 检查是否高风险
        if (isHighRiskStorage(trimmedLine)) {
          storageItem.isHighRisk = true
          auditStats.highRiskStorageUsage++
        }
        
        // 检查是否加密
        if (!trimmedLine.includes('encrypt') && !trimmedLine.includes('cipher')) {
          storageItem.isEncrypted = false
          auditStats.unencryptedStorageUsage++
        }
        
        auditStats.storageItems.push(storageItem)
      }
    })
    
    auditStats.filesProcessed++
    
  } catch (error) {
    auditStats.securityIssues.push({
      type: 'file_read_error',
      file: filePath,
      error: error.message
    })
  }
}

/**
 * 生成安全建议
 */
function generateRecommendations() {
  const recommendations = []
  
  // 基于审计结果生成建议
  if (auditStats.sensitiveStorageUsage > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Sensitive Data Storage',
      issue: `${auditStats.sensitiveStorageUsage} 个存储项包含敏感信息`,
      recommendation: '立即加密所有敏感数据或移除客户端存储',
      files: auditStats.storageItems
        .filter(item => item.isSensitive)
        .map(item => item.file)
        .filter((file, index, arr) => arr.indexOf(file) === index)
    })
  }
  
  if (auditStats.highRiskStorageUsage > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'High Risk Storage',
      issue: `${auditStats.highRiskStorageUsage} 个高风险存储使用`,
      recommendation: '使用安全存储服务或加密存储',
      files: auditStats.storageItems
        .filter(item => item.isHighRisk)
        .map(item => item.file)
        .filter((file, index, arr) => arr.indexOf(file) === index)
    })
  }
  
  if (auditStats.unencryptedStorageUsage > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Unencrypted Storage',
      issue: `${auditStats.unencryptedStorageUsage} 个未加密存储项`,
      recommendation: '实现数据加密存储机制',
      files: auditStats.storageItems
        .filter(item => !item.isEncrypted)
        .map(item => item.file)
        .filter((file, index, arr) => arr.indexOf(file) === index)
    })
  }
  
  // 通用建议
  recommendations.push({
    priority: 'MEDIUM',
    category: 'General Security',
    issue: '缺少存储数据验证',
    recommendation: '实现存储数据的完整性验证和过期机制'
  })
  
  recommendations.push({
    priority: 'LOW',
    category: 'Best Practices',
    issue: '缺少存储清理机制',
    recommendation: '实现定期清理过期存储数据的机制'
  })
  
  auditStats.recommendations = recommendations
}

/**
 * 生成审计报告
 */
function generateReport() {
  const report = `
# 🔒 本地存储安全审计报告

## 📊 审计统计
- **处理文件数**: ${auditStats.filesProcessed}
- **存储使用总数**: ${auditStats.totalStorageUsage}
- **localStorage使用**: ${auditStats.localStorageUsage}
- **sessionStorage使用**: ${auditStats.sessionStorageUsage}
- **敏感数据存储**: ${auditStats.sensitiveStorageUsage}
- **高风险存储**: ${auditStats.highRiskStorageUsage}
- **未加密存储**: ${auditStats.unencryptedStorageUsage}

## 🚨 安全风险分析

### 高风险存储项
${auditStats.storageItems
  .filter(item => item.isHighRisk)
  .map(item => `- **${item.file}:${item.line}** - ${item.key} (${item.type})`)
  .join('\n') || '无高风险存储项'}

### 敏感数据存储
${auditStats.storageItems
  .filter(item => item.isSensitive)
  .map(item => `- **${item.file}:${item.line}** - ${item.key} (${item.type})`)
  .join('\n') || '无敏感数据存储'}

### 未加密存储
${auditStats.storageItems
  .filter(item => !item.isEncrypted)
  .map(item => `- **${item.file}:${item.line}** - ${item.key} (${item.type})`)
  .join('\n') || '所有存储都已加密'}

## 🔧 安全建议

${auditStats.recommendations.map(rec => `
### ${rec.priority} - ${rec.category}
**问题**: ${rec.issue}
**建议**: ${rec.recommendation}
${rec.files ? `**影响文件**: ${rec.files.join(', ')}` : ''}
`).join('\n')}

## 📋 详细存储项列表

${auditStats.storageItems.map(item => `
### ${item.file}:${item.line}
- **类型**: ${item.type}
- **键名**: ${item.key}
- **值**: ${item.value}
- **敏感**: ${item.isSensitive ? '⚠️ 是' : '✅ 否'}
- **高风险**: ${item.isHighRisk ? '🚨 是' : '✅ 否'}
- **加密**: ${item.isEncrypted ? '🔒 是' : '❌ 否'}
- **代码**: \`${item.code}\`
`).join('\n')}

## 🛡️ 安全最佳实践

1. **数据分类**: 将数据分为公开、内部、敏感、机密四个级别
2. **加密存储**: 所有敏感数据必须加密后存储
3. **数据验证**: 实现存储数据的完整性验证
4. **过期机制**: 设置存储数据的过期时间
5. **清理机制**: 定期清理不需要的存储数据
6. **访问控制**: 限制对敏感存储数据的访问
7. **审计日志**: 记录所有存储操作

---
生成时间: ${new Date().toISOString()}
`

  // 保存报告
  fs.writeFileSync('STORAGE_SECURITY_AUDIT_REPORT.md', report, 'utf8')
  console.log('\n📋 审计报告已保存到: STORAGE_SECURITY_AUDIT_REPORT.md')
}

/**
 * 主函数
 */
function main() {
  console.log('🔒 开始本地存储安全审计...\n')
  
  const files = glob.sync(FILE_PATTERNS[0], {
    ignore: EXCLUDE_PATTERNS,
    cwd: process.cwd()
  })
  
  console.log(`📁 找到 ${files.length} 个文件需要审计\n`)
  
  files.forEach(file => {
    analyzeFileStorage(file)
  })
  
  generateRecommendations()
  
  console.log('\n📊 审计完成！')
  console.log(`✅ 处理文件: ${auditStats.filesProcessed}`)
  console.log(`📝 存储使用: ${auditStats.totalStorageUsage}`)
  console.log(`🚨 敏感存储: ${auditStats.sensitiveStorageUsage}`)
  console.log(`⚠️  高风险存储: ${auditStats.highRiskStorageUsage}`)
  console.log(`🔓 未加密存储: ${auditStats.unencryptedStorageUsage}`)
  console.log(`❌ 安全问题: ${auditStats.securityIssues.length}`)
  
  generateReport()
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  analyzeFileStorage,
  isSensitiveStorage,
  isHighRiskStorage,
  auditStats
}
