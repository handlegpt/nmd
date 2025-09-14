#!/usr/bin/env node

/**
 * 敏感日志清理脚本
 * 用于批量清理代码中的敏感console.log语句
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 敏感关键词列表
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
  'database_password',
  'email_password',
  'admin_password',
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
  'process.env',
  'NEXT_PUBLIC_',
  'SUPABASE_',
  'OPENAI_',
  'GOOGLE_',
  'NUMBEO_',
  'BRIGHT_DATA_'
]

// 需要清理的文件模式
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

// 日志清理统计
let stats = {
  filesProcessed: 0,
  totalLogsFound: 0,
  sensitiveLogsFound: 0,
  logsRemoved: 0,
  logsReplaced: 0,
  errors: []
}

/**
 * 检查日志是否包含敏感信息
 */
function isSensitiveLog(logContent) {
  const lowerContent = logContent.toLowerCase()
  return SENSITIVE_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  )
}

/**
 * 清理单个文件中的敏感日志
 */
function cleanFileLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    let modified = false
    const newLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // 检查是否是console.log语句
      if (trimmedLine.startsWith('console.') && 
          (trimmedLine.includes('log(') || 
           trimmedLine.includes('error(') || 
           trimmedLine.includes('warn(') || 
           trimmedLine.includes('info(') || 
           trimmedLine.includes('debug('))) {
        
        stats.totalLogsFound++
        
        // 检查是否包含敏感信息
        if (isSensitiveLog(line)) {
          stats.sensitiveLogsFound++
          
          // 决定是删除还是替换
          if (shouldRemoveLog(line)) {
            // 完全删除这行
            console.log(`🗑️  Removing sensitive log in ${filePath}:${i + 1}`)
            console.log(`   ${line}`)
            modified = true
            stats.logsRemoved++
            continue // 跳过这行
          } else {
            // 替换为安全的日志
            const safeLog = replaceWithSafeLog(line, filePath, i + 1)
            newLines.push(safeLog)
            modified = true
            stats.logsReplaced++
            continue
          }
        }
      }
      
      newLines.push(line)
    }
    
    // 如果文件被修改，写回文件
    if (modified) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
      console.log(`✅ Cleaned ${filePath}`)
    }
    
    stats.filesProcessed++
    
  } catch (error) {
    stats.errors.push({
      file: filePath,
      error: error.message
    })
    console.error(`❌ Error processing ${filePath}:`, error.message)
  }
}

/**
 * 判断是否应该完全删除日志
 */
function shouldRemoveLog(logLine) {
  // 如果日志只包含敏感信息，则删除
  const sensitiveOnly = SENSITIVE_KEYWORDS.some(keyword => 
    logLine.toLowerCase().includes(keyword.toLowerCase()) && 
    logLine.length < 100 // 短日志更可能是纯敏感信息
  )
  
  return sensitiveOnly
}

/**
 * 替换为安全的日志
 */
function replaceWithSafeLog(originalLog, filePath, lineNumber) {
  // 提取日志级别
  const logLevel = originalLog.match(/console\.(log|error|warn|info|debug)/)?.[1] || 'log'
  
  // 创建安全的替换日志
  const safeLog = `    // ${originalLog.trim()}\n    console.${logLevel}('[REDACTED] Sensitive information logged at ${path.basename(filePath)}:${lineNumber}')`
  
  return safeLog
}

/**
 * 获取所有需要处理的文件
 */
function getAllFiles() {
  let allFiles = []
  
  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      cwd: process.cwd()
    })
    allFiles = allFiles.concat(files)
  })
  
  // 去重
  return [...new Set(allFiles)]
}

/**
 * 生成清理报告
 */
function generateReport() {
  const report = `
# 🔒 敏感日志清理报告

## 📊 清理统计
- **处理文件数**: ${stats.filesProcessed}
- **发现日志总数**: ${stats.totalLogsFound}
- **敏感日志数**: ${stats.sensitiveLogsFound}
- **删除日志数**: ${stats.logsRemoved}
- **替换日志数**: ${stats.logsReplaced}
- **错误数**: ${stats.errors.length}

## 🎯 清理效果
- **敏感日志清理率**: ${stats.sensitiveLogsFound > 0 ? ((stats.logsRemoved + stats.logsReplaced) / stats.sensitiveLogsFound * 100).toFixed(1) : 0}%
- **总体日志清理率**: ${stats.totalLogsFound > 0 ? ((stats.logsRemoved + stats.logsReplaced) / stats.totalLogsFound * 100).toFixed(1) : 0}%

## ❌ 错误列表
${stats.errors.length > 0 ? stats.errors.map(err => `- ${err.file}: ${err.error}`).join('\n') : '无错误'}

## 🔧 建议后续操作
1. 使用新的安全日志记录器 (enhancedSecureLogger)
2. 在CI/CD中集成敏感信息检测
3. 定期运行此脚本进行清理
4. 培训开发团队使用安全的日志记录方式

---
生成时间: ${new Date().toISOString()}
`

  // 保存报告
  fs.writeFileSync('SENSITIVE_LOGS_CLEANUP_REPORT.md', report, 'utf8')
  console.log('\n📋 清理报告已保存到: SENSITIVE_LOGS_CLEANUP_REPORT.md')
}

/**
 * 主函数
 */
function main() {
  console.log('🔒 开始清理敏感日志...\n')
  
  const files = getAllFiles()
  console.log(`📁 找到 ${files.length} 个文件需要检查\n`)
  
  files.forEach(file => {
    cleanFileLogs(file)
  })
  
  console.log('\n📊 清理完成！')
  console.log(`✅ 处理文件: ${stats.filesProcessed}`)
  console.log(`📝 发现日志: ${stats.totalLogsFound}`)
  console.log(`🚨 敏感日志: ${stats.sensitiveLogsFound}`)
  console.log(`🗑️  删除日志: ${stats.logsRemoved}`)
  console.log(`🔄 替换日志: ${stats.logsReplaced}`)
  console.log(`❌ 错误数量: ${stats.errors.length}`)
  
  generateReport()
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  cleanFileLogs,
  isSensitiveLog,
  shouldRemoveLog,
  replaceWithSafeLog,
  stats
}
