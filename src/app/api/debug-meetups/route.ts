import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    const results: any = {}
    
    // 检查 meetups 表
    try {
      const { data: meetups, error: meetupsError } = await supabase
        .from('meetups')
        .select('*')
        .limit(1)
      
      results.meetups = {
        exists: !meetupsError,
        error: meetupsError?.message,
        count: meetups?.length || 0
      }
    } catch (e) {
      results.meetups = { exists: false, error: e instanceof Error ? e.message : 'Unknown error' }
    }
    
    // 检查 meetup_participants 表
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('meetup_participants')
        .select('*')
        .limit(1)
      
      results.meetup_participants = {
        exists: !participantsError,
        error: participantsError?.message,
        count: participants?.length || 0
      }
    } catch (e) {
      results.meetup_participants = { exists: false, error: e instanceof Error ? e.message : 'Unknown error' }
    }
    
    // 检查 users 表
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name')
        .limit(2)
      
      results.users = {
        exists: !usersError,
        error: usersError?.message,
        count: users?.length || 0,
        sample: users
      }
    } catch (e) {
      results.users = { exists: false, error: e instanceof Error ? e.message : 'Unknown error' }
    }
    
    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
