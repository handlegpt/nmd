const { createClient } = require('@supabase/supabase-js')

// 测试 Supabase 连接
async function testSupabaseConnection() {
  console.log('🔍 测试 Supabase 连接...')
  
  // 从环境变量读取配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 环境变量')
    return
  }
  
  console.log('📋 Supabase URL:', supabaseUrl)
  console.log('🔑 Service Role Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 测试连接
    console.log('🧪 测试数据库连接...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ 数据库连接错误:', error)
    } else {
      console.log('✅ 数据库连接成功!')
    }
    
    // 测试 RPC 调用
    console.log('🧪 测试 RPC 调用...')
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_count')
      .single()
    
    if (rpcError) {
      console.log('⚠️  RPC 调用失败 (这是正常的):', rpcError.message)
    } else {
      console.log('✅ RPC 调用成功!')
    }
    
  } catch (err) {
    console.error('💥 连接测试失败:', err.message)
  }
}

testSupabaseConnection()
