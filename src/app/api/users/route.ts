import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/users - 获取所有注册用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get('include_hidden') === 'true'
    
    logInfo('Fetching all registered users', { includeHidden }, 'UsersAPI')
    
    // 构建查询 - 查询所有可用字段
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        current_city,
        profession,
        company,
        bio,
        interests,
        coordinates,
        is_visible_in_nomads,
        is_online,
        is_available,
        last_seen,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
    
    // 如果不包含隐藏用户，只获取可见的用户
    if (!includeHidden) {
      query = query.eq('is_visible_in_nomads', true)
    }
    
    const { data: users, error } = await query
    
    if (error) {
      logError('Error fetching users', error, 'UsersAPI')
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    // 格式化用户数据 - 使用数据库中的实际字段
    const formattedUsers = users?.map((user: any) => ({
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      avatar: user.avatar_url || (user.name ? user.name.substring(0, 2).toUpperCase() : 'NN'),
      profession: user.profession || 'Digital Nomad',
      company: user.company || 'Freelance',
      location: user.current_city || 'Unknown Location',
      bio: user.bio || 'Digital nomad exploring the world!',
      interests: user.interests || ['Travel', 'Technology'],
      coordinates: user.coordinates,
      isOnline: user.is_online ?? true,
      isAvailable: user.is_available ?? true,
      lastSeen: user.last_seen,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at,
      isVisible: user.is_visible_in_nomads !== false
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
