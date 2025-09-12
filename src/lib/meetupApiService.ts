// Meetup API Service - 聚会API服务
// 替代localStorage的meetupSystem.ts

export interface Meetup {
  id: string
  organizer_id: string
  title: string
  description?: string
  location: string
  meeting_time: string
  max_participants: number
  current_participants: number
  status: 'active' | 'cancelled' | 'completed' | 'full'
  meetup_type: 'coffee' | 'work' | 'social' | 'other'
  tags: string[]
  created_at: string
  updated_at: string
  organizer?: {
    id: string
    name: string
    avatar_url?: string
    current_city?: string
  }
  participants?: MeetupParticipant[]
  activities?: MeetupActivity[]
  reviews?: MeetupReview[]
}

export interface MeetupParticipant {
  id: string
  meetup_id: string
  user_id: string
  status: 'joined' | 'left' | 'removed'
  joined_at: string
  left_at?: string
  user?: {
    id: string
    name: string
    avatar_url?: string
    current_city?: string
    profession?: string
  }
}

export interface MeetupActivity {
  id: string
  meetup_id: string
  user_id: string
  activity_type: 'created' | 'joined' | 'left' | 'cancelled' | 'completed' | 'reviewed'
  activity_data: Record<string, any>
  created_at: string
  user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface MeetupReview {
  id: string
  meetup_id: string
  reviewer_id: string
  content?: string
  rating?: number
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    name: string
    avatar_url?: string
  }
}

class MeetupApiService {
  private baseUrl = '/api'

  // 获取聚会列表
  async getMeetups(
    status = 'active',
    meetupType?: string,
    location?: string,
    limit = 20,
    offset = 0
  ): Promise<Meetup[]> {
    try {
      const params = new URLSearchParams()
      params.append('status', status)
      if (meetupType) params.append('type', meetupType)
      if (location) params.append('location', location)
      params.append('limit', limit.toString())
      params.append('offset', offset.toString())

      const response = await fetch(`${this.baseUrl}/meetups?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch meetups: ${response.statusText}`)
      }

      const data = await response.json()
      return data.meetups || []
    } catch (error) {
      console.error('Error fetching meetups:', error)
      return []
    }
  }

  // 创建聚会
  async createMeetup(meetupData: {
    organizer_id: string
    title: string
    description?: string
    location: string
    meeting_time: string
    max_participants?: number
    meetup_type?: string
    tags?: string[]
  }): Promise<Meetup | null> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetupData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create meetup: ${response.statusText}`)
      }

      const data = await response.json()
      return data.meetup
    } catch (error) {
      console.error('Error creating meetup:', error)
      return null
    }
  }

  // 获取特定聚会详情
  async getMeetup(meetupId: string): Promise<Meetup | null> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to fetch meetup: ${response.statusText}`)
      }

      const data = await response.json()
      return data.meetup
    } catch (error) {
      console.error('Error fetching meetup:', error)
      return null
    }
  }

  // 更新聚会
  async updateMeetup(meetupId: string, updateData: Partial<Meetup>): Promise<Meetup | null> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update meetup: ${response.statusText}`)
      }

      const data = await response.json()
      return data.meetup
    } catch (error) {
      console.error('Error updating meetup:', error)
      return null
    }
  }

  // 删除聚会
  async deleteMeetup(meetupId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete meetup: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting meetup:', error)
      return false
    }
  }

  // 获取聚会参与者
  async getMeetupParticipants(meetupId: string): Promise<MeetupParticipant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}/participants`)
      if (!response.ok) {
        throw new Error(`Failed to fetch meetup participants: ${response.statusText}`)
      }

      const data = await response.json()
      return data.participants || []
    } catch (error) {
      console.error('Error fetching meetup participants:', error)
      return []
    }
  }

  // 加入聚会
  async joinMeetup(meetupId: string, userId: string): Promise<MeetupParticipant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to join meetup: ${response.statusText}`)
      }

      const data = await response.json()
      return data.participant
    } catch (error) {
      console.error('Error joining meetup:', error)
      return null
    }
  }

  // 离开聚会
  async leaveMeetup(meetupId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/meetups/${meetupId}/participants?user_id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to leave meetup: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error leaving meetup:', error)
      return false
    }
  }

  // 获取用户参与的聚会
  async getUserMeetups(userId: string, status = 'active'): Promise<Meetup[]> {
    try {
      const meetups = await this.getMeetups(status)
      return meetups.filter(meetup => 
        meetup.participants?.some(participant => 
          participant.user_id === userId && participant.status === 'joined'
        )
      )
    } catch (error) {
      console.error('Error fetching user meetups:', error)
      return []
    }
  }

  // 获取用户组织的聚会
  async getUserOrganizedMeetups(userId: string, status = 'active'): Promise<Meetup[]> {
    try {
      const meetups = await this.getMeetups(status)
      return meetups.filter(meetup => meetup.organizer_id === userId)
    } catch (error) {
      console.error('Error fetching user organized meetups:', error)
      return []
    }
  }

  // 检查用户是否已参与聚会
  async isUserParticipant(meetupId: string, userId: string): Promise<boolean> {
    try {
      const participants = await this.getMeetupParticipants(meetupId)
      return participants.some(participant => 
        participant.user_id === userId && participant.status === 'joined'
      )
    } catch (error) {
      console.error('Error checking user participation:', error)
      return false
    }
  }
}

// 导出单例实例
export const meetupApiService = new MeetupApiService()
export default meetupApiService
