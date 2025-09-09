// Manual data update service for city data
// This service handles manual updates to city data with validation and tracking

export interface ManualUpdate {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  source: string; // 'admin', 'user_feedback', 'api_update', 'manual_research'
  updatedBy: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface UpdateStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byField: Record<string, number>;
  bySource: Record<string, number>;
  recentUpdates: ManualUpdate[];
}

class ManualDataUpdateService {
  private updates: ManualUpdate[] = [];
  private readonly STORAGE_KEY = 'nomadnow_manual_updates';

  constructor() {
    this.loadUpdates();
  }

  // Load updates from localStorage
  private loadUpdates(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.updates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading manual updates:', error);
      this.updates = [];
    }
  }

  // Save updates to localStorage
  private saveUpdates(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.updates));
    } catch (error) {
      console.error('Error saving manual updates:', error);
    }
  }

  // Submit new manual update
  submitUpdate(update: Omit<ManualUpdate, 'id' | 'updatedAt' | 'status'>): string {
    const newUpdate: ManualUpdate = {
      ...update,
      id: this.generateId(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.updates.push(newUpdate);
    this.saveUpdates();
    
    // In a real app, you would also send this to your backend
    this.sendToBackend(newUpdate);
    
    return newUpdate.id;
  }

  // Approve update
  approveUpdate(id: string, approvedBy: string, notes?: string): boolean {
    const update = this.updates.find(u => u.id === id);
    if (!update) return false;

    update.status = 'approved';
    update.approvedBy = approvedBy;
    update.approvedAt = new Date().toISOString();
    if (notes) update.notes = notes;

    this.saveUpdates();
    return true;
  }

  // Reject update
  rejectUpdate(id: string, approvedBy: string, notes?: string): boolean {
    const update = this.updates.find(u => u.id === id);
    if (!update) return false;

    update.status = 'rejected';
    update.approvedBy = approvedBy;
    update.approvedAt = new Date().toISOString();
    if (notes) update.notes = notes;

    this.saveUpdates();
    return true;
  }

  // Get update by ID
  getUpdate(id: string): ManualUpdate | null {
    return this.updates.find(u => u.id === id) || null;
  }

  // Get all updates
  getAllUpdates(): ManualUpdate[] {
    return [...this.updates];
  }

  // Get updates by city
  getUpdatesByCity(cityId: string): ManualUpdate[] {
    return this.updates.filter(u => u.cityId === cityId);
  }

  // Get updates by status
  getUpdatesByStatus(status: ManualUpdate['status']): ManualUpdate[] {
    return this.updates.filter(u => u.status === status);
  }

  // Get pending updates
  getPendingUpdates(): ManualUpdate[] {
    return this.getUpdatesByStatus('pending');
  }

  // Get approved updates
  getApprovedUpdates(): ManualUpdate[] {
    return this.getUpdatesByStatus('approved');
  }

  // Get update statistics
  getUpdateStats(): UpdateStats {
    const stats: UpdateStats = {
      total: this.updates.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      byField: {},
      bySource: {},
      recentUpdates: []
    };

    this.updates.forEach(update => {
      // Count by status
      switch (update.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }

      // Count by field
      stats.byField[update.field] = (stats.byField[update.field] || 0) + 1;

      // Count by source
      stats.bySource[update.source] = (stats.bySource[update.source] || 0) + 1;
    });

    // Get recent updates (last 10)
    stats.recentUpdates = this.updates
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    return stats;
  }

  // Search updates
  searchUpdates(query: string): ManualUpdate[] {
    const lowerQuery = query.toLowerCase();
    return this.updates.filter(update =>
      update.cityName.toLowerCase().includes(lowerQuery) ||
      update.country.toLowerCase().includes(lowerQuery) ||
      update.field.toLowerCase().includes(lowerQuery) ||
      update.reason.toLowerCase().includes(lowerQuery)
    );
  }

  // Delete update
  deleteUpdate(id: string): boolean {
    const index = this.updates.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.updates.splice(index, 1);
    this.saveUpdates();
    return true;
  }

  // Validate update data
  validateUpdate(update: Partial<ManualUpdate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!update.cityId) errors.push('City ID is required');
    if (!update.cityName) errors.push('City name is required');
    if (!update.country) errors.push('Country is required');
    if (!update.field) errors.push('Field is required');
    if (update.oldValue === undefined) errors.push('Old value is required');
    if (update.newValue === undefined) errors.push('New value is required');
    if (!update.reason) errors.push('Reason is required');
    if (!update.source) errors.push('Source is required');
    if (!update.updatedBy) errors.push('Updated by is required');

    // Validate field values based on field type
    if (update.field && update.newValue !== undefined) {
      switch (update.field) {
        case 'cost_of_living':
          if (typeof update.newValue !== 'number' || update.newValue < 0) {
            errors.push('Cost of living must be a positive number');
          }
          break;
        case 'wifi_speed':
          if (typeof update.newValue !== 'number' || update.newValue < 0) {
            errors.push('WiFi speed must be a positive number');
          }
          break;
        case 'visa_days':
          if (typeof update.newValue !== 'number' || update.newValue < 0) {
            errors.push('Visa days must be a positive number');
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate unique ID
  private generateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send update to backend (placeholder)
  private async sendToBackend(update: ManualUpdate): Promise<void> {
    try {
      // In a real app, you would send this to your backend API
      console.log('Sending manual update to backend:', update);
      
      // Example API call:
      // await fetch('/api/manual-updates', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(update)
      // });
    } catch (error) {
      console.error('Error sending manual update to backend:', error);
    }
  }

  // Export updates data
  exportUpdates(): string {
    return JSON.stringify(this.updates, null, 2);
  }

  // Import updates data
  importUpdates(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.updates = imported;
        this.saveUpdates();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing updates data:', error);
      return false;
    }
  }

  // Get update history for a specific city and field
  getUpdateHistory(cityId: string, field: string): ManualUpdate[] {
    return this.updates
      .filter(u => u.cityId === cityId && u.field === field)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Get latest approved value for a field
  getLatestApprovedValue(cityId: string, field: string): any {
    const approvedUpdates = this.updates
      .filter(u => u.cityId === cityId && u.field === field && u.status === 'approved')
      .sort((a, b) => new Date(b.approvedAt || b.updatedAt).getTime() - new Date(a.approvedAt || a.updatedAt).getTime());

    return approvedUpdates.length > 0 ? approvedUpdates[0].newValue : null;
  }
}

export const manualDataUpdateService = new ManualDataUpdateService();
