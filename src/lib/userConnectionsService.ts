import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface UserConnection {
  id: string
  user_id: string
  connected_user_id: string
  connection_type: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
}

export interface UserConnectionInput {
  connected_user_id: string
  connection_type?: string
  status?: 'pending' | 'accepted' | 'declined' | 'blocked'
}

class UserConnectionsService {
  /**
   * 获取用户连接列表
   */
  async getUserConnections(userId: string, status?: string): Promise<UserConnection[]> {
    try {
      let query = supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user connections', error, 'UserConnectionsService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user connections', error, 'UserConnectionsService')
      return []
    }
  }

  /**
   * 获取连接到用户的列表
   */
  async getConnectionsToUser(userId: string, status?: string): Promise<UserConnection[]> {
    try {
      let query = supabase
        .from('user_connections')
        .select('*')
        .eq('connected_user_id', userId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch connections to user', error, 'UserConnectionsService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching connections to user', error, 'UserConnectionsService')
      return []
    }
  }

  /**
   * 创建连接请求
   */
  async createConnection(userId: string, connectionData: UserConnectionInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          user_id: userId,
          connected_user_id: connectionData.connected_user_id,
          connection_type: connectionData.connection_type || 'friend',
          status: connectionData.status || 'pending'
        })

      if (error) {
        logError('Failed to create connection', error, 'UserConnectionsService')
        return false
      }

      logInfo('Connection created successfully', { 
        userId, 
        connectedUserId: connectionData.connected_user_id 
      }, 'UserConnectionsService')
      return true
    } catch (error) {
      logError('Error creating connection', error, 'UserConnectionsService')
      return false
    }
  }

  /**
   * 更新连接状态
   */
  async updateConnectionStatus(connectionId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status })
        .eq('id', connectionId)

      if (error) {
        logError('Failed to update connection status', error, 'UserConnectionsService')
        return false
      }

      logInfo('Connection status updated successfully', { connectionId, status }, 'UserConnectionsService')
      return true
    } catch (error) {
      logError('Error updating connection status', error, 'UserConnectionsService')
      return false
    }
  }

  /**
   * 删除连接
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId)

      if (error) {
        logError('Failed to delete connection', error, 'UserConnectionsService')
        return false
      }

      logInfo('Connection deleted successfully', { connectionId }, 'UserConnectionsService')
      return true
    } catch (error) {
      logError('Error deleting connection', error, 'UserConnectionsService')
      return false
    }
  }

  /**
   * 检查两个用户是否已连接
   */
  async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('id')
        .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
        .eq('status', 'accepted')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check if users are connected', error, 'UserConnectionsService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if users are connected', error, 'UserConnectionsService')
      return false
    }
  }

  /**
   * 获取连接统计
   */
  async getConnectionStats(userId: string): Promise<{
    totalConnections: number
    pendingConnections: number
    acceptedConnections: number
    blockedConnections: number
  }> {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('status')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get connection stats', error, 'UserConnectionsService')
        return { totalConnections: 0, pendingConnections: 0, acceptedConnections: 0, blockedConnections: 0 }
      }

      const totalConnections = data.length
      const pendingConnections = data.filter((conn: any) => conn.status === 'pending').length
      const acceptedConnections = data.filter((conn: any) => conn.status === 'accepted').length
      const blockedConnections = data.filter((conn: any) => conn.status === 'blocked').length

      return {
        totalConnections,
        pendingConnections,
        acceptedConnections,
        blockedConnections
      }
    } catch (error) {
      logError('Error getting connection stats', error, 'UserConnectionsService')
      return { totalConnections: 0, pendingConnections: 0, acceptedConnections: 0, blockedConnections: 0 }
    }
  }

  /**
   * 获取用户的连接建议
   */
  async getConnectionSuggestions(userId: string, limit: number = 10): Promise<string[]> {
    try {
      // This is a simplified version - in a real app, you'd want more sophisticated logic
      // For now, we'll just return users who are not already connected
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .neq('id', userId)
        .limit(limit)

      if (error) {
        logError('Failed to get connection suggestions', error, 'UserConnectionsService')
        return []
      }

      // Filter out users who are already connected
      const connectedUserIds = await this.getConnectedUserIds(userId)
      return data
        .map((user: any) => user.id)
        .filter((id: string) => !connectedUserIds.includes(id))
    } catch (error) {
      logError('Error getting connection suggestions', error, 'UserConnectionsService')
      return []
    }
  }

  /**
   * 获取已连接的用户ID列表
   */
  private async getConnectedUserIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      if (error) {
        logError('Failed to get connected user IDs', error, 'UserConnectionsService')
        return []
      }

      return data.map((conn: any) => conn.connected_user_id)
    } catch (error) {
      logError('Error getting connected user IDs', error, 'UserConnectionsService')
      return []
    }
  }
}

export const userConnectionsService = new UserConnectionsService()
