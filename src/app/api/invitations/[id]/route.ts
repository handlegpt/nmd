import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id
    const body = await request.json()
    const { status, meeting_time, meeting_location, message } = body

    // Validate status
    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be accepted or declined' },
        { status: 400 }
      )
    }

    // Get the invitation first
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Invitation is no longer pending' },
        { status: 409 }
      )
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Update the invitation
    const updateData: any = { status }
    
    if (status === 'accepted') {
      if (meeting_time) updateData.meeting_time = meeting_time
      if (meeting_location) updateData.meeting_location = meeting_location
    }
    
    if (message) updateData.message = message

    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', invitationId)
      .select(`
        *,
        sender:users!invitations_sender_id_fkey(id, name, avatar_url),
        receiver:users!invitations_receiver_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (updateError) {
      logError('Failed to update invitation', updateError, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to update invitation' },
        { status: 500 }
      )
    }

    logInfo('Invitation updated successfully', {
      invitationId,
      status,
      senderId: invitation.sender_id,
      receiverId: invitation.receiver_id
    }, 'InvitationsAPI')

    return NextResponse.json({
      success: true,
      data: updatedInvitation
    })

  } catch (error) {
    logError('Unexpected error in invitation update API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id

    // Get the invitation first to check ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('sender_id, receiver_id')
      .eq('id', invitationId)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId)

    if (deleteError) {
      logError('Failed to delete invitation', deleteError, 'InvitationsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to delete invitation' },
        { status: 500 }
      )
    }

    logInfo('Invitation deleted successfully', {
      invitationId,
      senderId: invitation.sender_id,
      receiverId: invitation.receiver_id
    }, 'InvitationsAPI')

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted successfully'
    })

  } catch (error) {
    logError('Unexpected error in invitation delete API', error, 'InvitationsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
