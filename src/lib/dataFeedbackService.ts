// Data feedback service for user-reported data accuracy issues
// This service handles user feedback about city data accuracy

export interface DataFeedback {
  id: string;
  userId?: string;
  cityId: string;
  cityName: string;
  country: string;
  dataType: 'cost_of_living' | 'wifi_speed' | 'visa_info' | 'other';
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  evidence?: string; // URL to evidence or additional info
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

class DataFeedbackService {
  private feedback: DataFeedback[] = [];
  private readonly STORAGE_KEY = 'nomadnow_data_feedback';

  constructor() {
    this.loadFeedback();
  }

  // Load feedback from localStorage
  private loadFeedback(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.feedback = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
      this.feedback = [];
    }
  }

  // Save feedback to localStorage
  private saveFeedback(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feedback));
    } catch (error) {
      console.error('Error saving feedback data:', error);
    }
  }

  // Submit new feedback
  submitFeedback(feedback: Omit<DataFeedback, 'id' | 'createdAt' | 'updatedAt' | 'status'>): string {
    const newFeedback: DataFeedback = {
      ...feedback,
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feedback.push(newFeedback);
    this.saveFeedback();
    
    // In a real app, you would also send this to your backend
    this.sendToBackend(newFeedback);
    
    return newFeedback.id;
  }

  // Get feedback by ID
  getFeedback(id: string): DataFeedback | null {
    return this.feedback.find(f => f.id === id) || null;
  }

  // Get all feedback
  getAllFeedback(): DataFeedback[] {
    return [...this.feedback];
  }

  // Get feedback by city
  getFeedbackByCity(cityId: string): DataFeedback[] {
    return this.feedback.filter(f => f.cityId === cityId);
  }

  // Get feedback by status
  getFeedbackByStatus(status: DataFeedback['status']): DataFeedback[] {
    return this.feedback.filter(f => f.status === status);
  }

  // Update feedback status
  updateFeedbackStatus(id: string, status: DataFeedback['status'], reviewedBy?: string, reviewNotes?: string): boolean {
    const feedback = this.feedback.find(f => f.id === id);
    if (!feedback) return false;

    feedback.status = status;
    feedback.updatedAt = new Date().toISOString();
    if (reviewedBy) feedback.reviewedBy = reviewedBy;
    if (reviewNotes) feedback.reviewNotes = reviewNotes;

    this.saveFeedback();
    return true;
  }

  // Get feedback statistics
  getFeedbackStats(): FeedbackStats {
    const stats: FeedbackStats = {
      total: this.feedback.length,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      byType: {},
      byPriority: {}
    };

    this.feedback.forEach(feedback => {
      // Count by status
      switch (feedback.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'reviewed':
          stats.reviewed++;
          break;
        case 'accepted':
          stats.accepted++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }

      // Count by type
      stats.byType[feedback.dataType] = (stats.byType[feedback.dataType] || 0) + 1;

      // Count by priority
      stats.byPriority[feedback.priority] = (stats.byPriority[feedback.priority] || 0) + 1;
    });

    return stats;
  }

  // Get recent feedback
  getRecentFeedback(limit: number = 10): DataFeedback[] {
    return this.feedback
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Search feedback
  searchFeedback(query: string): DataFeedback[] {
    const lowerQuery = query.toLowerCase();
    return this.feedback.filter(feedback =>
      feedback.cityName.toLowerCase().includes(lowerQuery) ||
      feedback.country.toLowerCase().includes(lowerQuery) ||
      feedback.reason.toLowerCase().includes(lowerQuery) ||
      feedback.field.toLowerCase().includes(lowerQuery)
    );
  }

  // Delete feedback
  deleteFeedback(id: string): boolean {
    const index = this.feedback.findIndex(f => f.id === id);
    if (index === -1) return false;

    this.feedback.splice(index, 1);
    this.saveFeedback();
    return true;
  }

  // Generate unique ID
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send feedback to backend (placeholder)
  private async sendToBackend(feedback: DataFeedback): Promise<void> {
    try {
      // In a real app, you would send this to your backend API
      console.log('Sending feedback to backend:', feedback);
      
      // Example API call:
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedback)
      // });
    } catch (error) {
      console.error('Error sending feedback to backend:', error);
    }
  }

  // Export feedback data
  exportFeedback(): string {
    return JSON.stringify(this.feedback, null, 2);
  }

  // Import feedback data
  importFeedback(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.feedback = imported;
        this.saveFeedback();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing feedback data:', error);
      return false;
    }
  }
}

export const dataFeedbackService = new DataFeedbackService();
