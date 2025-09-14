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

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    logInfo('Checking meetups table structure', {}, 'TestMeetupsTableAPI')
    
    // 检查 meetups 表结构
    const { data: meetupsColumns, error: meetupsError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'meetups' 
          ORDER BY ordinal_position;
        `
      })

    // 检查 meetup_participants 表结构
    const { data: participantsColumns, error: participantsError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'meetup_participants' 
          ORDER BY ordinal_position;
        `
      })

    // 检查表中数据数量
    const { data: meetupsCount, error: meetupsCountError } = await supabase
      .from('meetups')
      .select('*', { count: 'exact', head: true })

    const { data: participantsCount, error: participantsCountError } = await supabase
      .from('meetup_participants')
      .select('*', { count: 'exact', head: true })

    // 尝试获取一些示例数据
    const { data: sampleMeetups, error: sampleError } = await supabase
      .from('meetups')
      .select('*')
      .limit(5)

    const result = {
      success: true,
      meetupsTable: {
        exists: !meetupsError,
        columns: meetupsColumns || [],
        error: meetupsError?.message,
        count: meetupsCount?.length || 0
      },
      participantsTable: {
        exists: !participantsError,
        columns: participantsColumns || [],
        error: participantsError?.message,
        count: participantsCount?.length || 0
      },
      sampleData: {
        meetups: sampleMeetups || [],
        error: sampleError?.message
      }
    }

    logInfo('Meetups table check completed', result, 'TestMeetupsTableAPI')

    return NextResponse.json(result)

  } catch (error) {
    logError('Unexpected error in test meetups table API', error, 'TestMeetupsTableAPI')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
