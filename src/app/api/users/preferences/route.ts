import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/users/preferences - 获取用户偏好数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    logInfo('Fetching user preferences', { userId }, 'UserPreferencesAPI')
    
    // 获取用户偏好数据
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      logError('Error fetching user preferences', error, 'UserPreferencesAPI')
      return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 })
    }
    
    // 如果没有找到偏好数据，返回默认值
    const defaultPreferences = {
      favorites: [],
      hidden_users: [],
      blocked_users: [],
      preferences: {}
    }
    
    const result = preferences || defaultPreferences
    
    logInfo('Successfully fetched user preferences', { userId, hasPreferences: !!preferences }, 'UserPreferencesAPI')
    return NextResponse.json({ 
      success: true,
      preferences: result
    })
    
  } catch (error) {
    logError('Unexpected error in user preferences API', error, 'UserPreferencesAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users/preferences - 更新用户偏好数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, favorites, hidden_users, blocked_users, preferences } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    logInfo('Updating user preferences', { userId }, 'UserPreferencesAPI')
    
    // 准备更新数据
    const updateData = {
      user_id: userId,
      favorites: favorites || [],
      hidden_users: hidden_users || [],
      blocked_users: blocked_users || [],
      preferences: preferences || {},
      updated_at: new Date().toISOString()
    }
    
    // 使用 upsert 操作（如果存在则更新，不存在则插入）
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(updateData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) {
      logError('Error updating user preferences', error, 'UserPreferencesAPI')
      return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 })
    }
    
    logInfo('Successfully updated user preferences', { userId }, 'UserPreferencesAPI')
    return NextResponse.json({ 
      success: true,
      preferences: data
    })
    
  } catch (error) {
    logError('Unexpected error in user preferences API', error, 'UserPreferencesAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
