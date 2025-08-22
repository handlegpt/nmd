import { DatabaseService } from './databaseService';
import { supabase } from '../lib/supabase';

export interface NotificationData {
  user_id: string;
  type: 'greeting' | 'message' | 'activity' | 'system' | 'like' | 'comment' | 'meetup_invite' | 'meetup_update';
  title: string;
  message: string;
  from_user_id?: string;
  related_post_id?: string;
  related_comment_id?: string;
  related_meetup_id?: string;
}

export class NotificationService {
  // Create and send a notification
  static async createNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      const notification = await DatabaseService.createNotification(notificationData);
      return !!notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  // Create notification for post like
  static async notifyPostLike(postId: string, postUserId: string, likedByUserId: string, likedByNickname: string): Promise<boolean> {
    if (postUserId === likedByUserId) return true; // Don't notify self

    return this.createNotification({
      user_id: postUserId,
      type: 'like',
      title: 'New like on your post',
      message: `${likedByNickname} liked your post`,
      from_user_id: likedByUserId,
      related_post_id: postId,
    });
  }

  // Create notification for post comment
  static async notifyPostComment(postId: string, postUserId: string, commentUserId: string, commentUserNickname: string, commentContent: string): Promise<boolean> {
    if (postUserId === commentUserId) return true; // Don't notify self

    const truncatedContent = commentContent.length > 50 
      ? commentContent.substring(0, 50) + '...' 
      : commentContent;

    return this.createNotification({
      user_id: postUserId,
      type: 'comment',
      title: 'New comment on your post',
      message: `${commentUserNickname} commented: "${truncatedContent}"`,
      from_user_id: commentUserId,
      related_post_id: postId,
    });
  }

  // Create notification for new follower
  static async notifyNewFollower(followedUserId: string, followerUserId: string, followerNickname: string): Promise<boolean> {
    if (followedUserId === followerUserId) return true; // Don't notify self

    return this.createNotification({
      user_id: followedUserId,
      type: 'greeting',
      title: 'New follower',
      message: `${followerNickname} started following you`,
      from_user_id: followerUserId,
    });
  }

  // Create notification for meetup invitation
  static async notifyMeetupInvite(meetupId: string, meetupTitle: string, invitedUserId: string, inviterUserId: string, inviterNickname: string): Promise<boolean> {
    return this.createNotification({
      user_id: invitedUserId,
      type: 'meetup_invite',
      title: 'Meetup invitation',
      message: `${inviterNickname} invited you to "${meetupTitle}"`,
      from_user_id: inviterUserId,
      related_meetup_id: meetupId,
    });
  }

  // Create notification for meetup update
  static async notifyMeetupUpdate(meetupId: string, meetupTitle: string, attendeeUserId: string, updateType: 'time' | 'location' | 'cancelled'): Promise<boolean> {
    const messages = {
      time: `The time for "${meetupTitle}" has been updated`,
      location: `The location for "${meetupTitle}" has been updated`,
      cancelled: `"${meetupTitle}" has been cancelled`,
    };

    return this.createNotification({
      user_id: attendeeUserId,
      type: 'meetup_update',
      title: 'Meetup update',
      message: messages[updateType],
      related_meetup_id: meetupId,
    });
  }

  // Create notification for new message
  static async notifyNewMessage(toUserId: string, fromUserId: string, fromNickname: string, messagePreview: string): Promise<boolean> {
    const truncatedMessage = messagePreview.length > 30 
      ? messagePreview.substring(0, 30) + '...' 
      : messagePreview;

    return this.createNotification({
      user_id: toUserId,
      type: 'message',
      title: 'New message',
      message: `${fromNickname}: ${truncatedMessage}`,
      from_user_id: fromUserId,
    });
  }

  // Create system notification
  static async notifySystem(userId: string, title: string, message: string): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
    });
  }

  // Get real-time notifications for a user
  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    return DatabaseService.markAllNotificationsAsRead(userId);
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    return DatabaseService.getUnreadNotificationCount(userId);
  }

  // Delete old notifications (cleanup)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return false;
    }
  }
}
