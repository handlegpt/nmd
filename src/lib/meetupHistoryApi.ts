import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface Meetup {
  id: string
  creator_id: string
  title: string
  description?: string
  location: string
  latitude?: number
  longitude?: number
  scheduled_time: string
  duration_minutes: number
  max_participants?: number
  meetup_type: 'casual' | 'work' | 'social' | 'activity'
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  is_public: boolean
  tags: string[]
  created_at: string
  updated_at: string
  // 扩展字段
  creator_name?: string
  total_participants?: number
  accepted_participants?: number
  attended_participants?: number
  average_rating?: number
  total_ratings?: number
}

export interface MeetupParticipant {
  id: string
  meetup_id: string
  user_id: string
  status: 'invited' | 'accepted' | 'declined' | 'attended' | 'no_show'
  response_time?: string
  notes?: string
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
  // 扩展字段
  user_name?: string
  user_avatar?: string
}

export interface MeetupHistory {
  id: string
  meetup_id: string
  action_type: string
  action_by?: string
  old_data?: any
  new_data?: any
  notes?: string
  created_at: string
  // 扩展字段
  action_by_name?: string
}

export interface GetMeetupHistoryOptions {
  page?: number
  limit?: number
  status?: string
  meetup_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

// 获取用户的meetup历史
export async function getUserMeetupHistory(options: GetMeetupHistoryOptions = {}): Promise<{
  meetups: Meetup[]
  total: number
  hasMore: boolean
}> {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      meetup_type,
      date_from,
      date_to,
      search
    } = options

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('meetup_participants')
      .select(`
        *,
        meetups!inner(
          *,
          users!inner(name)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // 应用筛选条件
    if (status) {
      query = query.eq('status', status)
    }

    if (meetup_type) {
      query = query.eq('meetups.meetup_type', meetup_type)
    }

    if (date_from) {
      query = query.gte('meetups.scheduled_time', date_from)
    }

    if (date_to) {
      query = query.lte('meetups.scheduled_time', date_to)
    }

    if (search) {
      query = query.or(`meetups.title.ilike.%${search}%,meetups.description.ilike.%${search}%,meetups.location.ilike.%${search}%`)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: participants, count, error } = await query
      .order('meetups.scheduled_time', { ascending: false })
      .range(from, to)

    if (error) {
      logError('Failed to fetch meetup history', error, 'meetupHistoryApi')
      throw new Error('Failed to fetch meetup history')
    }

    // 转换数据格式
    const meetups: Meetup[] = participants?.map((p: any) => ({
      ...p.meetups,
      creator_name: p.meetups.users?.name
    })) || []

    return {
      meetups,
      total: count || 0,
      hasMore: (count || 0) > (page * limit)
    }
  } catch (error) {
    logError('Error in getUserMeetupHistory', error, 'meetupHistoryApi')
    throw error
  }
}

// 获取meetup详情
export async function getMeetupDetails(meetupId: string): Promise<{
  meetup: Meetup
  participants: MeetupParticipant[]
  history: MeetupHistory[]
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // 获取meetup详情
    const { data: meetup, error: meetupError } = await supabase
      .from('meetups')
      .select(`
        *,
        users!inner(name)
      `)
      .eq('id', meetupId)
      .single()

    if (meetupError) {
      logError('Failed to fetch meetup details', meetupError, 'meetupHistoryApi')
      throw new Error('Failed to fetch meetup details')
    }

    // 获取参与者
    const { data: participants, error: participantsError } = await supabase
      .from('meetup_participants')
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .eq('meetup_id', meetupId)

    if (participantsError) {
      logError('Failed to fetch meetup participants', participantsError, 'meetupHistoryApi')
      throw new Error('Failed to fetch meetup participants')
    }

    // 获取历史记录
    const { data: history, error: historyError } = await supabase
      .from('meetup_history')
      .select(`
        *,
        users!inner(name)
      `)
      .eq('meetup_id', meetupId)
      .order('created_at', { ascending: false })

    if (historyError) {
      logError('Failed to fetch meetup history', historyError, 'meetupHistoryApi')
      throw new Error('Failed to fetch meetup history')
    }

    return {
      meetup: {
        ...meetup,
        creator_name: meetup.users?.name
      },
      participants: participants?.map((p: any) => ({
        ...p,
        user_name: p.users?.name,
        user_avatar: p.users?.avatar_url
      })) || [],
      history: history?.map((h: any) => ({
        ...h,
        action_by_name: h.users?.name
      })) || []
    }
  } catch (error) {
    logError('Error in getMeetupDetails', error, 'meetupHistoryApi')
    throw error
  }
}

// 创建meetup
export async function createMeetup(meetupData: {
  title: string
  description?: string
  location: string
  latitude?: number
  longitude?: number
  scheduled_time: string
  duration_minutes?: number
  max_participants?: number
  meetup_type?: 'casual' | 'work' | 'social' | 'activity'
  is_public?: boolean
  tags?: string[]
}): Promise<Meetup> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: meetup, error } = await supabase
      .from('meetups')
      .insert({
        creator_id: user.id,
        ...meetupData
      })
      .select(`
        *,
        users!inner(name)
      `)
      .single()

    if (error) {
      logError('Failed to create meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to create meetup')
    }

    logInfo('Meetup created successfully', { meetupId: meetup.id }, 'meetupHistoryApi')
    return {
      ...meetup,
      creator_name: meetup.users?.name
    }
  } catch (error) {
    logError('Error in createMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 更新meetup
export async function updateMeetup(meetupId: string, updates: Partial<Meetup>): Promise<Meetup> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: meetup, error } = await supabase
      .from('meetups')
      .update(updates)
      .eq('id', meetupId)
      .eq('creator_id', user.id)
      .select(`
        *,
        users!inner(name)
      `)
      .single()

    if (error) {
      logError('Failed to update meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to update meetup')
    }

    logInfo('Meetup updated successfully', { meetupId }, 'meetupHistoryApi')
    return {
      ...meetup,
      creator_name: meetup.users?.name
    }
  } catch (error) {
    logError('Error in updateMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 取消meetup
export async function cancelMeetup(meetupId: string, reason?: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('meetups')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', meetupId)
      .eq('creator_id', user.id)

    if (error) {
      logError('Failed to cancel meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to cancel meetup')
    }

    // 记录取消历史
    await supabase
      .from('meetup_history')
      .insert({
        meetup_id: meetupId,
        action_type: 'cancelled',
        action_by: user.id,
        notes: reason
      })

    logInfo('Meetup cancelled successfully', { meetupId }, 'meetupHistoryApi')
  } catch (error) {
    logError('Error in cancelMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 加入meetup
export async function joinMeetup(meetupId: string, notes?: string): Promise<MeetupParticipant> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: participant, error } = await supabase
      .from('meetup_participants')
      .insert({
        meetup_id: meetupId,
        user_id: user.id,
        status: 'accepted',
        response_time: new Date().toISOString(),
        notes
      })
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .single()

    if (error) {
      logError('Failed to join meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to join meetup')
    }

    logInfo('User joined meetup successfully', { meetupId, userId: user.id }, 'meetupHistoryApi')
    return {
      ...participant,
      user_name: participant.users?.name,
      user_avatar: participant.users?.avatar_url
    }
  } catch (error) {
    logError('Error in joinMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 离开meetup
export async function leaveMeetup(meetupId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('meetup_participants')
      .delete()
      .eq('meetup_id', meetupId)
      .eq('user_id', user.id)

    if (error) {
      logError('Failed to leave meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to leave meetup')
    }

    logInfo('User left meetup successfully', { meetupId, userId: user.id }, 'meetupHistoryApi')
  } catch (error) {
    logError('Error in leaveMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 评价meetup
export async function rateMeetup(meetupId: string, rating: number, feedback?: string): Promise<MeetupParticipant> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    const { data: participant, error } = await supabase
      .from('meetup_participants')
      .update({
        rating,
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq('meetup_id', meetupId)
      .eq('user_id', user.id)
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .single()

    if (error) {
      logError('Failed to rate meetup', error, 'meetupHistoryApi')
      throw new Error('Failed to rate meetup')
    }

    logInfo('Meetup rated successfully', { meetupId, rating }, 'meetupHistoryApi')
    return {
      ...participant,
      user_name: participant.users?.name,
      user_avatar: participant.users?.avatar_url
    }
  } catch (error) {
    logError('Error in rateMeetup', error, 'meetupHistoryApi')
    throw error
  }
}

// 获取meetup统计信息
export async function getMeetupStats(userId?: string): Promise<{
  totalMeetups: number
  completedMeetups: number
  cancelledMeetups: number
  averageRating: number
  totalRatings: number
  participationRate: number
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      throw new Error('User not authenticated')
    }

    // 获取用户参与的meetup统计
    const { data: stats, error } = await supabase
      .from('meetup_participants')
      .select(`
        status,
        rating,
        meetups!inner(status)
      `)
      .eq('user_id', targetUserId)

    if (error) {
      logError('Failed to fetch meetup stats', error, 'meetupHistoryApi')
      throw new Error('Failed to fetch meetup stats')
    }

    const totalMeetups = stats?.length || 0
    const completedMeetups = stats?.filter((s: any) => s.meetups?.status === 'completed').length || 0
    const cancelledMeetups = stats?.filter((s: any) => s.meetups?.status === 'cancelled').length || 0
    const ratings = stats?.filter((s: any) => s.rating !== null).map((s: any) => s.rating!) || []
    const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
    const participationRate = totalMeetups > 0 ? (completedMeetups / totalMeetups) * 100 : 0

    return {
      totalMeetups,
      completedMeetups,
      cancelledMeetups,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      participationRate: Math.round(participationRate * 10) / 10
    }
  } catch (error) {
    logError('Error in getMeetupStats', error, 'meetupHistoryApi')
    throw error
  }
}
