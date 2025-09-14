import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/logger'

// 使用服务角色密钥来绕过RLS策略
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for Supabase')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!['pending', 'accepted', 'declined', 'expired'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update invitation status
    const { data, error } = await supabase
      .from('invitations')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        sender:users!invitations_sender_id_fkey(id, name, avatar_url),
        receiver:users!invitations_receiver_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logError('Failed to update invitation', error, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to update invitation' },
        { status: 500 }
      )
    }

    logInfo('Invitation updated successfully', { id, status }, 'InvitationsAPI')

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    logError('Unexpected error in invitations PUT API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { id } = params

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        sender:users!invitations_sender_id_fkey(id, name, avatar_url),
        receiver:users!invitations_receiver_id_fkey(id, name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) {
      logError('Failed to fetch invitation', error, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    logError('Unexpected error in invitations GET API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}