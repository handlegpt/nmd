// 真实投票系统
export interface Vote {
  id: string
  userId: string
  cityId: string
  itemType: 'pro' | 'con' | 'overall'
  itemId: string
  voteType: 'upvote' | 'downvote'
  timestamp: string
}

export interface VoteItem {
  id: string
  title: string
  description: string
  votes: number
  upvotes: number
  downvotes: number
  userVote?: 'upvote' | 'downvote' | null
}

export interface CityVotes {
  cityId: string
  pros: VoteItem[]
  cons: VoteItem[]
  overallRating: number
  totalVotes: number
}

class VotingSystem {
  private storageKey = 'city_votes'
  private userVotesKey = 'user_votes'

  // 获取城市投票数据
  getCityVotes(cityId: string): CityVotes {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${cityId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load city votes:', error)
    }

    // 返回默认投票数据
    return {
      cityId,
      pros: [],
      cons: [],
      overallRating: 0,
      totalVotes: 0
    }
  }

  // 保存城市投票数据
  saveCityVotes(cityId: string, votes: CityVotes): void {
    try {
      localStorage.setItem(`${this.storageKey}_${cityId}`, JSON.stringify(votes))
    } catch (error) {
      console.error('Failed to save city votes:', error)
    }
  }

  // 获取用户投票记录
  getUserVotes(userId: string): Vote[] {
    try {
      const stored = localStorage.getItem(`${this.userVotesKey}_${userId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load user votes:', error)
    }
    return []
  }

  // 保存用户投票记录
  saveUserVotes(userId: string, votes: Vote[]): void {
    try {
      localStorage.setItem(`${this.userVotesKey}_${userId}`, JSON.stringify(votes))
    } catch (error) {
      console.error('Failed to save user votes:', error)
    }
  }

  // 投票
  vote(userId: string, cityId: string, itemType: 'pro' | 'con' | 'overall', itemId: string, voteType: 'upvote' | 'downvote'): boolean {
    try {
      // 获取当前投票数据
      const cityVotes = this.getCityVotes(cityId)
      const userVotes = this.getUserVotes(userId)

      // 检查用户是否已经投票
      const existingVoteIndex = userVotes.findIndex(vote => 
        vote.cityId === cityId && 
        vote.itemType === itemType && 
        vote.itemId === itemId
      )

      // 创建新投票记录
      const newVote: Vote = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        cityId,
        itemType,
        itemId,
        voteType,
        timestamp: new Date().toISOString()
      }

      // 更新城市投票数据
      if (itemType === 'pro') {
        const proIndex = cityVotes.pros.findIndex(pro => pro.id === itemId)
        if (proIndex !== -1) {
          const pro = cityVotes.pros[proIndex]
          
          // 如果用户之前投过票，先撤销之前的投票
          if (existingVoteIndex !== -1) {
            const oldVote = userVotes[existingVoteIndex]
            if (oldVote.voteType === 'upvote') {
              pro.upvotes--
              pro.votes--
            } else {
              pro.downvotes--
              pro.votes++
            }
            userVotes.splice(existingVoteIndex, 1)
          }

          // 添加新投票
          if (voteType === 'upvote') {
            pro.upvotes++
            pro.votes++
          } else {
            pro.downvotes++
            pro.votes--
          }
          pro.userVote = voteType
        }
      } else if (itemType === 'con') {
        const conIndex = cityVotes.cons.findIndex(con => con.id === itemId)
        if (conIndex !== -1) {
          const con = cityVotes.cons[conIndex]
          
          // 如果用户之前投过票，先撤销之前的投票
          if (existingVoteIndex !== -1) {
            const oldVote = userVotes[existingVoteIndex]
            if (oldVote.voteType === 'upvote') {
              con.upvotes--
              con.votes++
            } else {
              con.downvotes--
              con.votes--
            }
            userVotes.splice(existingVoteIndex, 1)
          }

          // 添加新投票
          if (voteType === 'upvote') {
            con.upvotes++
            con.votes++
          } else {
            con.downvotes++
            con.votes--
          }
          con.userVote = voteType
        }
      }

      // 更新用户投票记录
      if (existingVoteIndex !== -1) {
        userVotes[existingVoteIndex] = newVote
      } else {
        userVotes.push(newVote)
      }

      // 保存数据
      this.saveCityVotes(cityId, cityVotes)
      this.saveUserVotes(userId, userVotes)

      return true
    } catch (error) {
      console.error('Failed to vote:', error)
      return false
    }
  }

  // 初始化城市投票数据
  initializeCityVotes(cityId: string, pros: VoteItem[], cons: VoteItem[]): void {
    const cityVotes: CityVotes = {
      cityId,
      pros: pros.map(pro => ({ ...pro, userVote: null })),
      cons: cons.map(con => ({ ...con, userVote: null })),
      overallRating: 0,
      totalVotes: 0
    }
    this.saveCityVotes(cityId, cityVotes)
  }

  // 获取用户对特定项目的投票状态
  getUserVoteStatus(userId: string, cityId: string, itemType: 'pro' | 'con', itemId: string): 'upvote' | 'downvote' | null {
    const userVotes = this.getUserVotes(userId)
    const vote = userVotes.find(v => 
      v.cityId === cityId && 
      v.itemType === itemType && 
      v.itemId === itemId
    )
    return vote ? vote.voteType : null
  }

  // 更新用户投票状态到城市数据中
  updateUserVoteStatus(userId: string, cityVotes: CityVotes): CityVotes {
    const userVotes = this.getUserVotes(userId)
    
    // 更新pros的用户投票状态
    cityVotes.pros = cityVotes.pros.map(pro => ({
      ...pro,
      userVote: this.getUserVoteStatus(userId, cityVotes.cityId, 'pro', pro.id)
    }))

    // 更新cons的用户投票状态
    cityVotes.cons = cityVotes.cons.map(con => ({
      ...con,
      userVote: this.getUserVoteStatus(userId, cityVotes.cityId, 'con', con.id)
    }))

    return cityVotes
  }
}

export const votingSystem = new VotingSystem()
