import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface CityVote {
  id: string
  user_id: string
  city_id: string
  vote_type: string
  vote_value: number
  created_at: string
}

export interface CityVoteInput {
  city_id: string
  vote_type: string
  vote_value: number
}

class VotingSystemService {
  /**
   * 获取用户对特定城市的投票
   */
  async getUserCityVote(userId: string, cityId: string, voteType: string): Promise<CityVote | null> {
    try {
      const { data, error } = await supabase
        .from('user_city_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .eq('vote_type', voteType)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch user city vote', error, 'VotingSystemService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching user city vote', error, 'VotingSystemService')
      return null
    }
  }

  /**
   * 获取用户的所有投票
   */
  async getUserVotes(userId: string): Promise<CityVote[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_votes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user votes', error, 'VotingSystemService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user votes', error, 'VotingSystemService')
      return []
    }
  }

  /**
   * 创建或更新城市投票
   */
  async upsertCityVote(userId: string, voteData: CityVoteInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_votes')
        .upsert({
          user_id: userId,
          city_id: voteData.city_id,
          vote_type: voteData.vote_type,
          vote_value: voteData.vote_value
        })

      if (error) {
        logError('Failed to upsert city vote', error, 'VotingSystemService')
        return false
      }

      logInfo('City vote upserted successfully', { 
        userId, 
        cityId: voteData.city_id, 
        voteType: voteData.vote_type 
      }, 'VotingSystemService')
      return true
    } catch (error) {
      logError('Error upserting city vote', error, 'VotingSystemService')
      return false
    }
  }

  /**
   * 删除城市投票
   */
  async deleteCityVote(userId: string, cityId: string, voteType: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_votes')
        .delete()
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .eq('vote_type', voteType)

      if (error) {
        logError('Failed to delete city vote', error, 'VotingSystemService')
        return false
      }

      logInfo('City vote deleted successfully', { 
        userId, 
        cityId, 
        voteType 
      }, 'VotingSystemService')
      return true
    } catch (error) {
      logError('Error deleting city vote', error, 'VotingSystemService')
      return false
    }
  }

  /**
   * 获取城市投票统计
   */
  async getCityVoteStats(cityId: string, voteType?: string): Promise<{
    totalVotes: number
    averageVote: number
    voteDistribution: { [key: number]: number }
  }> {
    try {
      let query = supabase
        .from('user_city_votes')
        .select('vote_value')
        .eq('city_id', cityId)

      if (voteType) {
        query = query.eq('vote_type', voteType)
      }

      const { data, error } = await query

      if (error) {
        logError('Failed to fetch city vote stats', error, 'VotingSystemService')
        return { totalVotes: 0, averageVote: 0, voteDistribution: {} }
      }

      const totalVotes = data.length
      if (totalVotes === 0) {
        return { totalVotes: 0, averageVote: 0, voteDistribution: {} }
      }

      const totalValue = data.reduce((sum: number, vote: any) => sum + vote.vote_value, 0)
      const averageVote = Math.round((totalValue / totalVotes) * 10) / 10

      // Calculate vote distribution
      const voteDistribution: { [key: number]: number } = {}
      data.forEach((vote: any) => {
        voteDistribution[vote.vote_value] = (voteDistribution[vote.vote_value] || 0) + 1
      })

      return {
        totalVotes,
        averageVote,
        voteDistribution
      }
    } catch (error) {
      logError('Error fetching city vote stats', error, 'VotingSystemService')
      return { totalVotes: 0, averageVote: 0, voteDistribution: {} }
    }
  }

  /**
   * 获取用户投票统计
   */
  async getUserVoteStats(userId: string): Promise<{
    totalVotes: number
    voteTypes: { [key: string]: number }
    citiesVoted: number
  }> {
    try {
      const { data, error } = await supabase
        .from('user_city_votes')
        .select('vote_type, city_id')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to fetch user vote stats', error, 'VotingSystemService')
        return { totalVotes: 0, voteTypes: {}, citiesVoted: 0 }
      }

      const totalVotes = data.length
      const uniqueCities = new Set(data.map((vote: any) => vote.city_id)).size

      // Calculate vote types distribution
      const voteTypes: { [key: string]: number } = {}
      data.forEach((vote: any) => {
        voteTypes[vote.vote_type] = (voteTypes[vote.vote_type] || 0) + 1
      })

      return {
        totalVotes,
        voteTypes,
        citiesVoted: uniqueCities
      }
    } catch (error) {
      logError('Error fetching user vote stats', error, 'VotingSystemService')
      return { totalVotes: 0, voteTypes: {}, citiesVoted: 0 }
    }
  }

  /**
   * 检查用户是否已投票
   */
  async hasUserVoted(userId: string, cityId: string, voteType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_city_votes')
        .select('id')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .eq('vote_type', voteType)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check if user has voted', error, 'VotingSystemService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if user has voted', error, 'VotingSystemService')
      return false
    }
  }

  /**
   * 获取热门投票城市
   */
  async getPopularVotedCities(limit: number = 10): Promise<Array<{
    city_id: string
    total_votes: number
    average_vote: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_city_votes')
        .select('city_id, vote_value')

      if (error) {
        logError('Failed to fetch popular voted cities', error, 'VotingSystemService')
        return []
      }

      // Group by city_id and calculate stats
      const cityStats: { [key: string]: { total: number; count: number; values: number[] } } = {}
      data.forEach((vote: any) => {
        if (!cityStats[vote.city_id]) {
          cityStats[vote.city_id] = { total: 0, count: 0, values: [] }
        }
        cityStats[vote.city_id].total += vote.vote_value
        cityStats[vote.city_id].count += 1
        cityStats[vote.city_id].values.push(vote.vote_value)
      })

      // Convert to array and sort by total votes
      return Object.entries(cityStats)
        .map(([city_id, stats]) => ({
          city_id,
          total_votes: stats.count,
          average_vote: Math.round((stats.total / stats.count) * 10) / 10
        }))
        .sort((a, b) => b.total_votes - a.total_votes)
        .slice(0, limit)
    } catch (error) {
      logError('Error fetching popular voted cities', error, 'VotingSystemService')
      return []
    }
  }
}

export const votingSystemService = new VotingSystemService()
