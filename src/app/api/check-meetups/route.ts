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
    
    logInfo('Checking meetups tables', {}, 'CheckMeetupsAPI')
    
    // 首先检查表是否已存在
    const { data: existingMeetups, error: checkError } = await supabase
      .from('meetups')
      .select('id')
      .limit(1)

    if (existingMeetups && existingMeetups.length > 0) {
      logInfo('Meetups table already exists', {}, 'CheckMeetupsAPI')
      return NextResponse.json({
        success: true,
        message: 'Meetups tables already exist',
        meetupsCount: existingMeetups.length
      })
    }

    // 如果表不存在，返回错误信息，建议手动创建
    logError('Meetups table does not exist', checkError, 'CheckMeetupsAPI')
    return NextResponse.json({
      success: false,
      message: 'Meetups table does not exist. Please create it manually using the SQL script.',
      error: checkError?.message || 'Table not found'
    })

    // 检查创建结果
    const { data: meetupsCount } = await supabase!
      .from('meetups')
      .select('*', { count: 'exact', head: true })

    const { data: participantsCount } = await supabase!
      .from('meetup_participants')
      .select('*', { count: 'exact', head: true })

    const result = {
      success: true,
      message: 'Meetups tables check completed',
      meetupsCount: meetupsCount?.length || 0,
      participantsCount: participantsCount?.length || 0
    }

    logInfo('Meetups tables check completed', result, 'CheckMeetupsAPI')

    return NextResponse.json(result)

  } catch (error) {
    logError('Unexpected error in check meetups API', error, 'CheckMeetupsAPI')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
