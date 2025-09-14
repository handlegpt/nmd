#!/usr/bin/env node

/**
 * API Security Migration Script
 * 用于将现有的API端点迁移到新的安全系统
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// API端点安全配置映射
const API_SECURITY_MAPPINGS = {
  // 公开API - 无需认证
  'health': { type: 'public', description: 'Health check endpoint' },
  'time': { type: 'public', description: 'Time endpoint' },
  'weather': { type: 'public', description: 'Weather data endpoint' },
  'speed-test': { type: 'public', description: 'Speed test endpoint' },
  
  // 用户API - 需要用户认证
  'users': { type: 'user', description: 'User management endpoint' },
  'profile': { type: 'user', description: 'User profile endpoint' },
  'preferences': { type: 'user', description: 'User preferences endpoint' },
  'meetups': { type: 'user', description: 'Meetup management endpoint' },
  'invitations': { type: 'user', description: 'Invitation management endpoint' },
  'ratings': { type: 'user', description: 'Rating system endpoint' },
  'reviews': { type: 'user', description: 'Review system endpoint' },
  'places': { type: 'user', description: 'Places management endpoint' },
  'cities': { type: 'user', description: 'Cities data endpoint' },
  'nomad-visas': { type: 'user', description: 'Nomad visa information endpoint' },
  
  // 管理员API - 需要管理员权限
  'admin': { type: 'admin', description: 'Admin operations endpoint' },
  'delete-test-users': { type: 'admin', description: 'Delete test users endpoint' },
  'migrate-users': { type: 'admin', description: 'User migration endpoint' },
  'rate-limit': { type: 'admin', description: 'Rate limit management endpoint' },
  
  // 严格API - 高安全要求
  'auth': { type: 'strict', description: 'Authentication endpoint' },
  'errors': { type: 'strict', description: 'Error reporting endpoint' },
  'community': { type: 'strict', description: 'Community features endpoint' }
}

// 需要验证的API端点
const VALIDATION_SCHEMAS = {
  'users': {
    POST: {
      name: 'UserCreateSchema',
      schema: `z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        age: z.number().min(18).max(120).optional()
      })`
    },
    PUT: {
      name: 'UserUpdateSchema',
      schema: `z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        age: z.number().min(18).max(120).optional()
      })`
    }
  },
  'meetups': {
    POST: {
      name: 'MeetupCreateSchema',
      schema: `z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(1000),
        location: z.string().min(1).max(200),
        date: z.string().datetime(),
        maxParticipants: z.number().min(2).max(100).optional()
      })`
    }
  }
}

// 迁移统计
let migrationStats = {
  filesProcessed: 0,
  endpointsMigrated: 0,
  endpointsSkipped: 0,
  errors: []
}

/**
 * 获取API端点的安全类型
 */
function getSecurityType(apiPath) {
  for (const [pattern, config] of Object.entries(API_SECURITY_MAPPINGS)) {
    if (apiPath.includes(pattern)) {
      return config
    }
  }
  return { type: 'user', description: 'Default user endpoint' }
}

/**
 * 生成安全装饰器导入
 */
function generateSecurityImports(securityType) {
  const imports = []
  
  switch (securityType) {
    case 'public':
      imports.push("import { publicAPI } from '@/lib/apiSecurityDecorator'")
      break
    case 'user':
      imports.push("import { userAPI } from '@/lib/apiSecurityDecorator'")
      break
    case 'admin':
      imports.push("import { adminAPI } from '@/lib/apiSecurityDecorator'")
      break
    case 'strict':
      imports.push("import { strictAPI } from '@/lib/apiSecurityDecorator'")
      break
  }
  
  return imports
}

/**
 * 生成验证模式导入
 */
function generateValidationImports(apiPath) {
  const imports = []
  const pathParts = apiPath.split('/')
  const endpointName = pathParts[pathParts.length - 2] // 获取端点名称
  
  if (VALIDATION_SCHEMAS[endpointName]) {
    imports.push("import { z } from 'zod'")
  }
  
  return imports
}

/**
 * 生成验证模式定义
 */
function generateValidationSchemas(apiPath) {
  const schemas = []
  const pathParts = apiPath.split('/')
  const endpointName = pathParts[pathParts.length - 2]
  
  if (VALIDATION_SCHEMAS[endpointName]) {
    for (const [method, config] of Object.entries(VALIDATION_SCHEMAS[endpointName])) {
      schemas.push(`const ${config.name} = ${config.schema}`)
    }
  }
  
  return schemas
}

/**
 * 迁移单个API文件
 */
function migrateAPIFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    // 获取API路径
    const apiPath = filePath.replace('src/app/api/', '').replace('/route.ts', '')
    const securityConfig = getSecurityType(apiPath)
    
    // 生成新的导入
    const securityImports = generateSecurityImports(securityConfig.type)
    const validationImports = generateValidationImports(apiPath)
    const allImports = [...securityImports, ...validationImports]
    
    // 生成验证模式
    const validationSchemas = generateValidationSchemas(apiPath)
    
    // 查找现有的导出函数
    const exportFunctions = []
    lines.forEach((line, index) => {
      if (line.match(/^export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/)) {
        const method = line.match(/(GET|POST|PUT|DELETE|PATCH)/)[1]
        exportFunctions.push({ method, line, index })
      }
    })
    
    if (exportFunctions.length === 0) {
      migrationStats.endpointsSkipped++
      return
    }
    
    // 生成新的内容
    const newLines = []
    
    // 添加导入
    newLines.push('/**')
    newLines.push(' * Secure API Endpoint')
    newLines.push(` * ${securityConfig.description}`)
    newLines.push(' */')
    newLines.push('')
    
    allImports.forEach(importLine => {
      newLines.push(importLine)
    })
    
    if (validationSchemas.length > 0) {
      newLines.push('')
      validationSchemas.forEach(schema => {
        newLines.push(schema)
      })
    }
    
    newLines.push('')
    
    // 迁移每个导出函数
    exportFunctions.forEach(({ method, line, index }) => {
      const securityDecorator = securityConfig.type + 'API'
      const schemaName = VALIDATION_SCHEMAS[apiPath.split('/').pop()]?.[method]?.name
      
      if (schemaName) {
        newLines.push(`export const ${method} = ${securityDecorator}(${schemaName})(async (request, context) => {`)
      } else {
        newLines.push(`export const ${method} = ${securityDecorator}()(async (request, context) => {`)
      }
      
      // 复制函数体（跳过原始的函数声明行）
      let braceCount = 0
      let inFunction = false
      
      for (let i = index + 1; i < lines.length; i++) {
        const currentLine = lines[i]
        
        if (currentLine.includes('{')) {
          braceCount++
          inFunction = true
        }
        if (currentLine.includes('}')) {
          braceCount--
        }
        
        if (inFunction) {
          newLines.push(currentLine)
        }
        
        if (braceCount === 0 && inFunction) {
          break
        }
      }
      
      newLines.push('')
    })
    
    // 写回文件
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
    
    migrationStats.endpointsMigrated += exportFunctions.length
    console.log(`✅ Migrated ${filePath} (${exportFunctions.length} endpoints)`)
    
  } catch (error) {
    migrationStats.errors.push({
      file: filePath,
      error: error.message
    })
    console.error(`❌ Error migrating ${filePath}:`, error.message)
  }
}

/**
 * 生成迁移报告
 */
function generateMigrationReport() {
  const report = `
# 🔒 API安全迁移报告

## 📊 迁移统计
- **处理文件数**: ${migrationStats.filesProcessed}
- **迁移端点数**: ${migrationStats.endpointsMigrated}
- **跳过端点数**: ${migrationStats.endpointsSkipped}
- **错误数**: ${migrationStats.errors.length}

## 🎯 迁移效果
- **迁移成功率**: ${migrationStats.filesProcessed > 0 ? ((migrationStats.endpointsMigrated / (migrationStats.endpointsMigrated + migrationStats.endpointsSkipped)) * 100).toFixed(1) : 0}%

## ❌ 错误列表
${migrationStats.errors.length > 0 ? migrationStats.errors.map(err => `- ${err.file}: ${err.error}`).join('\n') : '无错误'}

## 🔧 后续操作建议
1. 测试所有迁移的API端点
2. 更新API文档
3. 配置生产环境的安全参数
4. 监控API安全状态
5. 定期审查安全配置

## 📋 安全配置说明

### 公开API (publicAPI)
- 无需认证
- 基础速率限制
- 适用于健康检查、公共数据等

### 用户API (userAPI)
- 需要用户认证
- 中等速率限制
- 适用于用户相关操作

### 管理员API (adminAPI)
- 需要管理员权限
- 高速率限制
- 适用于管理操作

### 严格API (strictAPI)
- 高安全要求
- 严格速率限制
- 适用于认证、错误报告等

---
生成时间: ${new Date().toISOString()}
`

  fs.writeFileSync('API_SECURITY_MIGRATION_REPORT.md', report, 'utf8')
  console.log('\n📋 迁移报告已保存到: API_SECURITY_MIGRATION_REPORT.md')
}

/**
 * 主函数
 */
function main() {
  console.log('🔒 开始API安全迁移...\n')
  
  const apiFiles = glob.sync('src/app/api/**/route.ts', {
    ignore: ['src/app/api/secure-example/route.ts'] // 跳过示例文件
  })
  
  console.log(`📁 找到 ${apiFiles.length} 个API文件需要迁移\n`)
  
  apiFiles.forEach(file => {
    migrationStats.filesProcessed++
    migrateAPIFile(file)
  })
  
  console.log('\n📊 迁移完成！')
  console.log(`✅ 处理文件: ${migrationStats.filesProcessed}`)
  console.log(`🔄 迁移端点: ${migrationStats.endpointsMigrated}`)
  console.log(`⏭️  跳过端点: ${migrationStats.endpointsSkipped}`)
  console.log(`❌ 错误数量: ${migrationStats.errors.length}`)
  
  generateMigrationReport()
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  migrateAPIFile,
  getSecurityType,
  generateSecurityImports,
  migrationStats
}
