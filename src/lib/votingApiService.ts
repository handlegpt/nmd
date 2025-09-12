// Voting API Service - 投票API服务
// 替代localStorage的votingSystem.ts

export interface CityVote {
  id: string
  city_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote' | 'neutral'
  vote_weight: number
  created_at: string
  updated_at: string
  city?: {
    id: string
    name: string
    country: string
  }
  user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface PlaceVote {
  id: string
  place_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote' | 'neutral'
  vote_weight: number
  created_at: string
  updated_at: string
  place?: {
    id: string
    name: string
    city_id: string
  }
  user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface VoteSummary {
  id: string
  target_id: string
  target_type: 'city' | 'place'
  total_votes: number
  upvotes: number
  downvotes: number
  neutral_votes: number
  weighted_score: number
  average_rating: number
  last_calculated: string
  created_at: string
  updated_at: string
}

class VotingApiService {
  private baseUrl = '/api'

  // 获取城市投票
  async getCityVotes(
    cityId?: string,
    userId?: string,
    voteType?: string,
    limit = 50
  ): Promise<CityVote[]> {
    try {
      const params = new URLSearchParams()
      if (cityId) params.append('city_id', cityId)
      if (userId) params.append('user_id', userId)
      if (voteType) params.append('vote_type', voteType)
      params.append('limit', limit.toString())

      const response = await fetch(`${this.baseUrl}/city-votes?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch city votes: ${response.statusText}`)
      }

      const data = await response.json()
      return data.votes || []
    } catch (error) {
      console.error('Error fetching city votes:', error)
      return []
    }
  }

  // 创建城市投票
  async createCityVote(
    cityId: string,
    userId: string,
    voteType: 'upvote' | 'downvote' | 'neutral',
    voteWeight = 1
  ): Promise<CityVote | null> {
    try {
      const response = await fetch(`${this.baseUrl}/city-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city_id: cityId,
          user_id: userId,
          vote_type: voteType,
          vote_weight: voteWeight
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create city vote: ${response.statusText}`)
      }

      const data = await response.json()
      return data.vote
    } catch (error) {
      console.error('Error creating city vote:', error)
      return null
    }
  }

  // 删除城市投票
  async deleteCityVote(cityId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/city-votes?city_id=${cityId}&user_id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete city vote: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting city vote:', error)
      return false
    }
  }

  // 获取地点投票
  async getPlaceVotes(
    placeId?: string,
    userId?: string,
    voteType?: string,
    limit = 50
  ): Promise<PlaceVote[]> {
    try {
      const params = new URLSearchParams()
      if (placeId) params.append('place_id', placeId)
      if (userId) params.append('user_id', userId)
      if (voteType) params.append('vote_type', voteType)
      params.append('limit', limit.toString())

      const response = await fetch(`${this.baseUrl}/place-votes?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch place votes: ${response.statusText}`)
      }

      const data = await response.json()
      return data.votes || []
    } catch (error) {
      console.error('Error fetching place votes:', error)
      return []
    }
  }

  // 创建地点投票
  async createPlaceVote(
    placeId: string,
    userId: string,
    voteType: 'upvote' | 'downvote' | 'neutral',
    voteWeight = 1
  ): Promise<PlaceVote | null> {
    try {
      const response = await fetch(`${this.baseUrl}/place-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place_id: placeId,
          user_id: userId,
          vote_type: voteType,
          vote_weight: voteWeight
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create place vote: ${response.statusText}`)
      }

      const data = await response.json()
      return data.vote
    } catch (error) {
      console.error('Error creating place vote:', error)
      return null
    }
  }

  // 删除地点投票
  async deletePlaceVote(placeId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/place-votes?place_id=${placeId}&user_id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete place vote: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting place vote:', error)
      return false
    }
  }

  // 获取投票摘要
  async getVoteSummaries(
    targetId?: string,
    targetType?: 'city' | 'place',
    limit = 50,
    sortBy = 'weighted_score'
  ): Promise<VoteSummary[]> {
    try {
      const params = new URLSearchParams()
      if (targetId) params.append('target_id', targetId)
      if (targetType) params.append('target_type', targetType)
      params.append('limit', limit.toString())
      params.append('sort_by', sortBy)

      const response = await fetch(`${this.baseUrl}/vote-summaries?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch vote summaries: ${response.statusText}`)
      }

      const data = await response.json()
      return data.summaries || []
    } catch (error) {
      console.error('Error fetching vote summaries:', error)
      return []
    }
  }

  // 重新计算投票摘要
  async recalculateVoteSummary(
    targetId: string,
    targetType: 'city' | 'place'
  ): Promise<VoteSummary | null> {
    try {
      const response = await fetch(`${this.baseUrl}/vote-summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_id: targetId,
          target_type: targetType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to recalculate vote summary: ${response.statusText}`)
      }

      const data = await response.json()
      return data.summary
    } catch (error) {
      console.error('Error recalculating vote summary:', error)
      return null
    }
  }

  // 获取特定目标的投票摘要
  async getVoteSummary(targetId: string, targetType: 'city' | 'place'): Promise<VoteSummary | null> {
    try {
      const summaries = await this.getVoteSummaries(targetId, targetType, 1)
      return summaries.length > 0 ? summaries[0] : null
    } catch (error) {
      console.error('Error fetching vote summary:', error)
      return null
    }
  }

  // 获取用户对特定城市的投票
  async getUserCityVote(cityId: string, userId: string): Promise<CityVote | null> {
    try {
      const votes = await this.getCityVotes(cityId, userId)
      return votes.length > 0 ? votes[0] : null
    } catch (error) {
      console.error('Error fetching user city vote:', error)
      return null
    }
  }

  // 获取用户对特定地点的投票
  async getUserPlaceVote(placeId: string, userId: string): Promise<PlaceVote | null> {
    try {
      const votes = await this.getPlaceVotes(placeId, userId)
      return votes.length > 0 ? votes[0] : null
    } catch (error) {
      console.error('Error fetching user place vote:', error)
      return null
    }
  }

  // 获取用户的所有投票
  async getUserVotes(userId: string): Promise<{
    cityVotes: CityVote[]
    placeVotes: PlaceVote[]
  }> {
    try {
      const [cityVotes, placeVotes] = await Promise.all([
        this.getCityVotes(undefined, userId),
        this.getPlaceVotes(undefined, userId)
      ])

      return { cityVotes, placeVotes }
    } catch (error) {
      console.error('Error fetching user votes:', error)
      return { cityVotes: [], placeVotes: [] }
    }
  }

  // 切换城市投票（如果已投票则删除，否则创建）
  async toggleCityVote(
    cityId: string,
    userId: string,
    voteType: 'upvote' | 'downvote' | 'neutral',
    voteWeight = 1
  ): Promise<CityVote | null> {
    try {
      const existingVote = await this.getUserCityVote(cityId, userId)
      
      if (existingVote) {
        // 如果投票类型相同，则删除投票
        if (existingVote.vote_type === voteType) {
          await this.deleteCityVote(cityId, userId)
          return null
        } else {
          // 如果投票类型不同，则更新投票
          return await this.createCityVote(cityId, userId, voteType, voteWeight)
        }
      } else {
        // 创建新投票
        return await this.createCityVote(cityId, userId, voteType, voteWeight)
      }
    } catch (error) {
      console.error('Error toggling city vote:', error)
      return null
    }
  }

  // 切换地点投票
  async togglePlaceVote(
    placeId: string,
    userId: string,
    voteType: 'upvote' | 'downvote' | 'neutral',
    voteWeight = 1
  ): Promise<PlaceVote | null> {
    try {
      const existingVote = await this.getUserPlaceVote(placeId, userId)
      
      if (existingVote) {
        // 如果投票类型相同，则删除投票
        if (existingVote.vote_type === voteType) {
          await this.deletePlaceVote(placeId, userId)
          return null
        } else {
          // 如果投票类型不同，则更新投票
          return await this.createPlaceVote(placeId, userId, voteType, voteWeight)
        }
      } else {
        // 创建新投票
        return await this.createPlaceVote(placeId, userId, voteType, voteWeight)
      }
    } catch (error) {
      console.error('Error toggling place vote:', error)
      return null
    }
  }
}

// 导出单例实例
export const votingApiService = new VotingApiService()
export default votingApiService
