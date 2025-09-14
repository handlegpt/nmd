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

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { sender_id, receiver_id, invitation_type, message, meeting_time, meeting_location } = body

    // Validate required fields
    if (!sender_id || !receiver_id || !invitation_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate invitation type
    if (!['coffee_meetup', 'work_together'].includes(invitation_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation type' },
        { status: 400 }
      )
    }

    // Check if users exist
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', sender_id)
      .single()

    if (senderError || !sender) {
      return NextResponse.json(
        { success: false, error: 'Sender not found' },
        { status: 404 }
      )
    }

    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', receiver_id)
      .single()

    if (receiverError || !receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Check if there's already a pending invitation between these users
    const { data: existingInvitation, error: checkError } = await supabase
      .from('invitations')
      .select('id')
      .eq('sender_id', sender_id)
      .eq('receiver_id', receiver_id)
      .eq('invitation_type', invitation_type)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation already sent' },
        { status: 409 }
      )
    }

    // Create the invitation
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert({
        sender_id,
        receiver_id,
        invitation_type,
        message: message || null,
        meeting_time: meeting_time || null,
        meeting_location: meeting_location || null
      })
      .select()
      .single()

    if (insertError) {
      logError('Failed to create invitation', insertError, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    logInfo('Invitation created successfully', {
      invitationId: invitation.id,
      senderId: sender_id,
      receiverId: receiver_id,
      type: invitation_type
    }, 'InvitationsAPI')

    return NextResponse.json({
      success: true,
      data: invitation
    })

  } catch (error) {
    logError('Unexpected error in invitations API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('invitations')
      .select(`
        *,
        sender:users!invitations_sender_id_fkey(id, name, avatar_url),
        receiver:users!invitations_receiver_id_fkey(id, name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('invitation_type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: invitations, error } = await query

    if (error) {
      logError('Failed to fetch invitations', error, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invitations
    })

  } catch (error) {
    logError('Unexpected error in invitations GET API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
