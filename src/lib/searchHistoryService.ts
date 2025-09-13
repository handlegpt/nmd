import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface SearchHistoryEntry {
  id: string
  user_id: string
  search_query: string
  search_type?: string
  results_count?: number
  created_at: string
}

export interface SearchHistoryInput {
  search_query: string
  search_type?: string
  results_count?: number
}

class SearchHistoryService {
  /**
   * 获取用户搜索历史
   */
  async getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch user search history', error, 'SearchHistoryService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user search history', error, 'SearchHistoryService')
      return []
    }
  }

  /**
   * 添加搜索记录
   */
  async addSearchEntry(userId: string, searchData: SearchHistoryInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_search_history')
        .insert({
          user_id: userId,
          search_query: searchData.search_query,
          search_type: searchData.search_type,
          results_count: searchData.results_count
        })

      if (error) {
        logError('Failed to add search entry', error, 'SearchHistoryService')
        return false
      }

      logInfo('Search entry added successfully', { userId, query: searchData.search_query }, 'SearchHistoryService')
      return true
    } catch (error) {
      logError('Error adding search entry', error, 'SearchHistoryService')
      return false
    }
  }

  /**
   * 删除搜索记录
   */
  async deleteSearchEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_search_history')
        .delete()
        .eq('id', entryId)

      if (error) {
        logError('Failed to delete search entry', error, 'SearchHistoryService')
        return false
      }

      logInfo('Search entry deleted successfully', { entryId }, 'SearchHistoryService')
      return true
    } catch (error) {
      logError('Error deleting search entry', error, 'SearchHistoryService')
      return false
    }
  }

  /**
   * 清空用户搜索历史
   */
  async clearUserSearchHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_search_history')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logError('Failed to clear user search history', error, 'SearchHistoryService')
        return false
      }

      logInfo('User search history cleared successfully', { userId }, 'SearchHistoryService')
      return true
    } catch (error) {
      logError('Error clearing user search history', error, 'SearchHistoryService')
      return false
    }
  }

  /**
   * 获取用户搜索统计
   */
  async getUserSearchStats(userId: string): Promise<{
    totalSearches: number
    uniqueQueries: number
    mostSearchedType?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('search_query, search_type')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get user search stats', error, 'SearchHistoryService')
        return { totalSearches: 0, uniqueQueries: 0 }
      }

      const totalSearches = data.length
      const uniqueQueries = new Set(data.map((entry: any) => entry.search_query)).size
      
      // Find most searched type
      const typeCounts: { [key: string]: number } = {}
      data.forEach((entry: any) => {
        if (entry.search_type) {
          typeCounts[entry.search_type] = (typeCounts[entry.search_type] || 0) + 1
        }
      })
      
      const mostSearchedType = Object.keys(typeCounts).reduce((a, b) => 
        typeCounts[a] > typeCounts[b] ? a : b, Object.keys(typeCounts)[0]
      )

      return {
        totalSearches,
        uniqueQueries,
        mostSearchedType
      }
    } catch (error) {
      logError('Error getting user search stats', error, 'SearchHistoryService')
      return { totalSearches: 0, uniqueQueries: 0 }
    }
  }

  /**
   * 获取热门搜索查询
   */
  async getPopularSearchQueries(limit: number = 10): Promise<Array<{
    search_query: string
    search_count: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('search_query')

      if (error) {
        logError('Failed to get popular search queries', error, 'SearchHistoryService')
        return []
      }

      // Count occurrences of each query
      const queryCounts: { [key: string]: number } = {}
      data.forEach((entry: any) => {
        queryCounts[entry.search_query] = (queryCounts[entry.search_query] || 0) + 1
      })

      // Sort by count and return top queries
      return Object.entries(queryCounts)
        .map(([query, count]) => ({ search_query: query, search_count: count }))
        .sort((a, b) => b.search_count - a.search_count)
        .slice(0, limit)
    } catch (error) {
      logError('Error getting popular search queries', error, 'SearchHistoryService')
      return []
    }
  }

  /**
   * 检查搜索查询是否已存在
   */
  async hasSearchedQuery(userId: string, query: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('id')
        .eq('user_id', userId)
        .eq('search_query', query)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check if query was searched', error, 'SearchHistoryService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if query was searched', error, 'SearchHistoryService')
      return false
    }
  }
}

export const searchHistoryService = new SearchHistoryService()
