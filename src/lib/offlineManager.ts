import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresIn: number; // milliseconds
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private pendingActions: OfflineAction[] = [];
  private cacheExpiryTime = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.initializeNetworkListener();
    this.loadPendingActions();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        this.processPendingActions();
      }
    });
  }

  // Cache management
  async setCache(key: string, data: any, expiresIn?: number): Promise<void> {
    try {
      const cachedData: CachedData = {
        key,
        data,
        timestamp: Date.now(),
        expiresIn: expiresIn || this.cacheExpiryTime,
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cachedData: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.timestamp > cachedData.expiresIn;

      if (isExpired) {
        await this.removeCache(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Offline actions management
  async addPendingAction(type: string, payload: any): Promise<void> {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
    };

    this.pendingActions.push(action);
    await this.savePendingActions();
  }

  async removePendingAction(actionId: string): Promise<void> {
    this.pendingActions = this.pendingActions.filter(action => action.id !== actionId);
    await this.savePendingActions();
  }

  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem('pending_actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const actions = await AsyncStorage.getItem('pending_actions');
      if (actions) {
        this.pendingActions = JSON.parse(actions);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  }

  private async processPendingActions(): Promise<void> {
    if (!this.isOnline || this.pendingActions.length === 0) return;

    const actionsToProcess = [...this.pendingActions];
    
    for (const action of actionsToProcess) {
      try {
        await this.processAction(action);
        await this.removePendingAction(action.id);
      } catch (error) {
        console.error('Error processing pending action:', error);
      }
    }
  }

  private async processAction(action: OfflineAction): Promise<void> {
    // This would typically make API calls to sync data
    // For now, we'll just log the action
    console.log('Processing offline action:', action);
    
    // Example implementation:
    switch (action.type) {
      case 'CREATE_POST':
        // await api.createPost(action.payload);
        break;
      case 'UPDATE_PROFILE':
        // await api.updateProfile(action.payload);
        break;
      case 'JOIN_MEETUP':
        // await api.joinMeetup(action.payload);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // Utility methods
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  getPendingActions(): OfflineAction[] {
    return [...this.pendingActions];
  }

  // Data synchronization
  async syncData(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync data while offline');
    }

    await this.processPendingActions();
  }

  // Cache statistics
  async getCacheStats(): Promise<{ totalKeys: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        totalKeys: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalKeys: 0, totalSize: 0 };
    }
  }
}

export default OfflineManager;
