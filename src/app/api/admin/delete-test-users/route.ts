import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/logger'

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for Supabase')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    logInfo('Starting deletion of test users', {}, 'DeleteTestUsersAPI')
    
    // 测试用户ID列表
    const testUserIds = [
      '885de6f6-4416-4dc8-a819-757948c22c86', // Mike Rodriguez
      '0e6b3579-4092-4bad-90e6-a6faa1f0de5a', // Alex Chen
      '3d035d76-1c0f-4b85-97a5-b5da6bde1420', // Sarah Johnson
      'a7093ab2-7df3-461c-bf49-fae99590d19f', // Emma Wilson
      '90f0a358-c9f7-4d5d-b942-b5af4cbc2f18'  // David Kim
    ]

    const results = {
      userPreferences: 0,
      userRatings: 0,
      userReviews: 0,
      onlineUsers: 0,
      users: 0
    }

    // 删除用户偏好设置
    const { error: prefsError, count: prefsCount } = await supabase
      .from('user_preferences')
      .delete()
      .in('user_id', testUserIds)
    
    if (prefsError) {
      logError('Error deleting user preferences', prefsError, 'DeleteTestUsersAPI')
    } else {
      results.userPreferences = prefsCount || 0
    }

    // 删除用户评分
    const { error: ratingsError, count: ratingsCount } = await supabase
      .from('user_ratings')
      .delete()
      .in('user_id', testUserIds)
    
    if (ratingsError) {
      logError('Error deleting user ratings', ratingsError, 'DeleteTestUsersAPI')
    } else {
      results.userRatings = ratingsCount || 0
    }

    // 删除用户评论
    const { error: reviewsError, count: reviewsCount } = await supabase
      .from('user_reviews')
      .delete()
      .in('user_id', testUserIds)
    
    if (reviewsError) {
      logError('Error deleting user reviews', reviewsError, 'DeleteTestUsersAPI')
    } else {
      results.userReviews = reviewsCount || 0
    }

    // 删除在线用户记录
    const { error: onlineError, count: onlineCount } = await supabase
      .from('online_users')
      .delete()
      .in('user_id', testUserIds)
    
    if (onlineError) {
      logError('Error deleting online users', onlineError, 'DeleteTestUsersAPI')
    } else {
      results.onlineUsers = onlineCount || 0
    }

    // 最后删除用户记录
    const { error: usersError, count: usersCount } = await supabase
      .from('users')
      .delete()
      .in('id', testUserIds)
    
    if (usersError) {
      logError('Error deleting users', usersError, 'DeleteTestUsersAPI')
      return NextResponse.json(
        { error: 'Failed to delete users', details: usersError.message },
        { status: 500 }
      )
    } else {
      results.users = usersCount || 0
    }

    logInfo('Test users deleted successfully', results, 'DeleteTestUsersAPI')

    return NextResponse.json({
      success: true,
      message: 'Test users deleted successfully',
      results: results,
      deletedUserIds: testUserIds
    })

  } catch (error) {
    logError('Unexpected error in delete test users API', error, 'DeleteTestUsersAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
