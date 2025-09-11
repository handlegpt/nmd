import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/users - 获取所有注册用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get('include_hidden') === 'true'
    
    logInfo('Fetching all registered users', { includeHidden }, 'UsersAPI')
    
    // 构建查询 - 只查询存在的字段
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    // 注意：is_visible_in_nomads字段不存在，暂时跳过过滤
    // TODO: 添加is_visible_in_nomads字段到数据库
    
    const { data: users, error } = await query
    
    if (error) {
      logError('Error fetching users', error, 'UsersAPI')
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    // 格式化用户数据 - 只使用存在的字段
    const formattedUsers = users?.map((user: any) => ({
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      avatar: user.avatar_url || (user.name ? user.name.substring(0, 2).toUpperCase() : 'NN'),
      profession: 'Digital Nomad', // 默认值，因为字段不存在
      company: 'Freelance', // 默认值，因为字段不存在
      location: 'Unknown Location', // 默认值，因为字段不存在
      bio: 'Digital nomad exploring the world!', // 默认值，因为字段不存在
      interests: ['Travel', 'Technology'], // 默认值，因为字段不存在
      coordinates: null, // 默认值，因为字段不存在
      createdAt: user.created_at,
      updatedAt: user.created_at, // 使用created_at作为updated_at
      isVisible: true // 默认可见，因为字段不存在
    })) || []
    
    logInfo('Successfully fetched users', { count: formattedUsers.length }, 'UsersAPI')
    return NextResponse.json({ 
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    })
    
  } catch (error) {
    logError('Unexpected error in users API', error, 'UsersAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
