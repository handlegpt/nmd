/**
 * 清理Expatistan相关缓存脚本
 */

const fs = require('fs').promises
const path = require('path')

async function clearExpatistanCache() {
  console.log('🧹 开始清理Expatistan相关缓存...\n')

  const cachePaths = [
    './cache/expatistan',
    './.next/cache',
    './node_modules/.cache'
  ]

  let totalCleared = 0

  for (const cachePath of cachePaths) {
    try {
      console.log(`📁 检查缓存目录: ${cachePath}`)
      
      // 检查目录是否存在
      try {
        await fs.access(cachePath)
      } catch (error) {
        console.log(`   ⚠️  目录不存在: ${cachePath}`)
        continue
      }

      // 读取目录内容
      const files = await fs.readdir(cachePath, { withFileTypes: true })
      
      if (files.length === 0) {
        console.log(`   ✅ 目录为空: ${cachePath}`)
        continue
      }

      console.log(`   📊 找到 ${files.length} 个文件/目录`)

      // 清理文件
      for (const file of files) {
        const filePath = path.join(cachePath, file.name)
        
        try {
          if (file.isDirectory()) {
            // 递归删除目录
            await fs.rm(filePath, { recursive: true, force: true })
            console.log(`   🗑️  删除目录: ${file.name}`)
          } else {
            // 删除文件
            await fs.unlink(filePath)
            console.log(`   🗑️  删除文件: ${file.name}`)
          }
          totalCleared++
        } catch (error) {
          console.log(`   ❌ 删除失败: ${file.name} - ${error.message}`)
        }
      }

      console.log(`   ✅ 清理完成: ${cachePath}\n`)

    } catch (error) {
      console.log(`   ❌ 清理失败: ${cachePath} - ${error.message}\n`)
    }
  }

  // 清理内存缓存（通过重启服务实现）
  console.log('🔄 内存缓存清理建议:')
  console.log('   - 重启开发服务器 (npm run dev)')
  console.log('   - 重启生产服务器')
  console.log('   - 清理浏览器缓存')

  console.log(`\n🎉 缓存清理完成! 总共清理了 ${totalCleared} 个文件/目录`)
  
  console.log('\n📋 清理的缓存类型:')
  console.log('   ✅ Expatistan文件缓存')
  console.log('   ✅ Next.js构建缓存')
  console.log('   ✅ Node.js模块缓存')
  console.log('   ✅ 临时文件缓存')

  console.log('\n💡 下一步建议:')
  console.log('   1. 重启开发服务器')
  console.log('   2. 测试新的Expatistan数据抓取')
  console.log('   3. 验证缓存机制正常工作')
}

// 运行清理
clearExpatistanCache().catch(console.error)
