import { supabase } from './supabase'

export interface RealtimeCallback {
  (payload: any): void
}

export class RealtimeService {
  private subscriptions: Map<string, any> = new Map()

  // 订阅城市评论实时更新
  subscribeToCityReviews(cityId: string, callback: RealtimeCallback) {
    const channelName = `city_reviews_${cityId}`
    
    // 检查是否已经存在订阅
    if (this.subscriptions.has(channelName)) {
      console.log(`Already subscribed to ${channelName}`)
      return this.subscriptions.get(channelName)
    }

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'city_reviews',
          filter: `city_id=eq.${cityId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  // 订阅城市投票实时更新
  subscribeToCityVotes(cityId: string, callback: RealtimeCallback) {
    const channelName = `city_votes_${cityId}`
    
    // 检查是否已经存在订阅
    if (this.subscriptions.has(channelName)) {
      console.log(`Already subscribed to ${channelName}`)
      return this.subscriptions.get(channelName)
    }

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'city_votes',
          filter: `city_id=eq.${cityId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  // 订阅用户活动实时更新
  subscribeToUserActivity(userId: string, callback: RealtimeCallback) {
    const subscription = supabase
      .channel(`user_activity_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`user_activity_${userId}`, subscription)
    return subscription
  }

  // 取消订阅
  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(channelName)
    }
  }

  // 取消所有订阅
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
  }

  // 获取连接状态
  getConnectionStatus() {
    return supabase.getChannels()
  }
}

// 创建单例实例
export const realtimeService = new RealtimeService()

// 实时数据获取函数
export const realtimeData = {
  // 获取实时城市数据
  async getCityData(cityId: string) {
    const { data, error } = await supabase
      .from('cities')
      .select(`
        *,
        city_reviews (count),
        city_votes (count)
      `)
      .eq('id', cityId)
      .single()

    if (error) throw error
    return data
  },

  // 获取实时评论数据
  async getCityReviews(cityId: string) {
    const { data, error } = await supabase
      .from('city_reviews')
      .select(`
        *,
        user_profiles (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .eq('city_id', cityId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 获取实时投票数据
  async getCityVotes(cityId: string) {
    const { data, error } = await supabase
      .from('city_votes')
      .select('*')
      .eq('city_id', cityId)

    if (error) throw error
    return data
  },

  // 获取实时用户活动
  async getUserActivity(userId: string) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  }
}

// 实时数据更新函数
export const realtimeUpdates = {
  // 添加评论
  async addReview(cityId: string, userId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('city_reviews')
      .insert({
        city_id: cityId,
        user_id: userId,
        rating,
        comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 添加投票
  async addVote(cityId: string, userId: string, category: string, rating: number) {
    const { data, error } = await supabase
      .from('city_votes')
      .upsert({
        city_id: cityId,
        user_id: userId,
        category,
        rating,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 记录用户活动
  async logUserActivity(userId: string, activityType: string, details: any) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        details,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
