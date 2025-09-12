import { logInfo, logError } from '@/lib/logger'

export interface Invitation {
  id: string
  sender_id: string
  receiver_id: string
  invitation_type: 'coffee_meetup' | 'work_together'
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  meeting_time?: string
  meeting_location?: string
  created_at: string
  updated_at: string
  expires_at: string
  sender?: {
    id: string
    name: string
    avatar_url?: string
  }
  receiver?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface CreateInvitationData {
  sender_id: string
  receiver_id: string
  invitation_type: 'coffee_meetup' | 'work_together'
  message?: string
  meeting_time?: string
  meeting_location?: string
}

export interface UpdateInvitationData {
  status: 'accepted' | 'declined'
  meeting_time?: string
  meeting_location?: string
  message?: string
}

class InvitationService {
  private baseUrl = '/api/invitations'

  async createInvitation(data: CreateInvitationData): Promise<{ success: boolean; data?: Invitation; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        logError('Failed to create invitation', { status: response.status, error: result.error }, 'InvitationService')
        return { success: false, error: result.error || 'Failed to create invitation' }
      }

      logInfo('Invitation created successfully', { invitationId: result.data?.id, type: data.invitation_type }, 'InvitationService')
      return { success: true, data: result.data }
    } catch (error) {
      logError('Error creating invitation', error, 'InvitationService')
      return { success: false, error: 'Network error' }
    }
  }

  async getUserInvitations(userId: string, options?: {
    type?: 'coffee_meetup' | 'work_together'
    status?: 'pending' | 'accepted' | 'declined' | 'expired'
  }): Promise<{ success: boolean; data?: Invitation[]; error?: string }> {
    try {
      const params = new URLSearchParams({ user_id: userId })
      if (options?.type) params.append('type', options.type)
      if (options?.status) params.append('status', options.status)

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        logError('Failed to fetch invitations', { status: response.status, error: result.error }, 'InvitationService')
        return { success: false, error: result.error || 'Failed to fetch invitations' }
      }

      return { success: true, data: result.data }
    } catch (error) {
      logError('Error fetching invitations', error, 'InvitationService')
      return { success: false, error: 'Network error' }
    }
  }

  async updateInvitation(invitationId: string, data: UpdateInvitationData): Promise<{ success: boolean; data?: Invitation; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        logError('Failed to update invitation', { status: response.status, error: result.error }, 'InvitationService')
        return { success: false, error: result.error || 'Failed to update invitation' }
      }

      logInfo('Invitation updated successfully', { invitationId, status: data.status }, 'InvitationService')
      return { success: true, data: result.data }
    } catch (error) {
      logError('Error updating invitation', error, 'InvitationService')
      return { success: false, error: 'Network error' }
    }
  }

  async deleteInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${invitationId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        logError('Failed to delete invitation', { status: response.status, error: result.error }, 'InvitationService')
        return { success: false, error: result.error || 'Failed to delete invitation' }
      }

      logInfo('Invitation deleted successfully', { invitationId }, 'InvitationService')
      return { success: true }
    } catch (error) {
      logError('Error deleting invitation', error, 'InvitationService')
      return { success: false, error: 'Network error' }
    }
  }

  async getPendingInvitations(userId: string): Promise<{ success: boolean; data?: Invitation[]; error?: string }> {
    return this.getUserInvitations(userId, { status: 'pending' })
  }

  async getSentInvitations(userId: string): Promise<{ success: boolean; data?: Invitation[]; error?: string }> {
    const result = await this.getUserInvitations(userId)
    if (!result.success || !result.data) {
      return result
    }

    // Filter to only show invitations sent by this user
    const sentInvitations = result.data.filter(invitation => invitation.sender_id === userId)
    return { success: true, data: sentInvitations }
  }

  async getReceivedInvitations(userId: string): Promise<{ success: boolean; data?: Invitation[]; error?: string }> {
    const result = await this.getUserInvitations(userId)
    if (!result.success || !result.data) {
      return result
    }

    // Filter to only show invitations received by this user
    const receivedInvitations = result.data.filter(invitation => invitation.receiver_id === userId)
    return { success: true, data: receivedInvitations }
  }
}

export const invitationService = new InvitationService()
