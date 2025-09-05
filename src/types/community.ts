import { Coordinates } from './index'

// 社区基础信息
export interface Community {
  id: string
  name: string
  description: string
  type: CommunityType
  city: string
  country: string
  coordinates?: Coordinates
  
  // 成员信息
  member_count: number
  max_members?: number
  is_public: boolean
  join_approval_required: boolean
  
  // 标签和分类
  tags: string[]
  interests: string[]
  
  // 创建和更新信息
  created_at: string
  updated_at: string
  created_by: string
  is_verified: boolean
  is_featured: boolean
}

// 社区类型
export type CommunityType = 
  | 'digital_nomad' | 'expat' | 'local' | 'professional'
  | 'hobby' | 'language' | 'cultural' | 'sports'
  | 'tech' | 'business' | 'other'

// 社区成员
export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: CommunityRole
  joined_at: string
  last_active: string
  contribution_score: number
  is_moderator: boolean
}

// 社区角色
export type CommunityRole = 'member' | 'moderator' | 'admin' | 'founder'

// 社区活动
export interface CommunityEvent {
  id: string
  community_id: string
  title: string
  description: string
  type: EventType
  start_time: string
  end_time: string
  location: string
  coordinates?: Coordinates
  
  // 参与信息
  max_participants?: number
  current_participants: number
  is_online: boolean
  meeting_link?: string
  
  // 状态
  status: EventStatus
  created_by: string
  created_at: string
  updated_at: string
}

// 活动类型
export type EventType = 
  | 'meetup' | 'workshop' | 'social' | 'professional'
  | 'cultural' | 'sports' | 'online' | 'other'

// 活动状态
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

// 社区消息
export interface CommunityMessage {
  id: string
  community_id: string
  user_id: string
  type: MessageType
  content: string
  attachments?: string[]
  
  // 互动信息
  likes: number
  replies: number
  is_pinned: boolean
  is_edited: boolean
  
  // 时间信息
  created_at: string
  updated_at: string
  last_edited_at?: string
}

// 消息类型
export type MessageType = 'text' | 'image' | 'link' | 'poll' | 'announcement'

// 社区邀请
export interface CommunityInvitation {
  id: string
  community_id: string
  inviter_id: string
  invitee_id: string
  message?: string
  expires_at: string
  status: InvitationStatus
  created_at: string
}

// 邀请状态
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

// 社区搜索参数
export interface CommunitySearchParams {
  query?: string
  type?: CommunityType
  city?: string
  country?: string
  tags?: string[]
  interests?: string[]
  is_public?: boolean
  min_members?: number
  sort_by?: 'member_count' | 'created_at' | 'name'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 社区更新参数
export interface CommunityUpdateParams {
  name?: string
  description?: string
  type?: CommunityType
  tags?: string[]
  interests?: string[]
  is_public?: boolean
  join_approval_required?: boolean
  max_members?: number
}
