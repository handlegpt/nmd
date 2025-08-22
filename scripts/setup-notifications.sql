-- Setup notifications table and related structures
-- This script creates the notifications table with proper RLS policies

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('greeting', 'message', 'activity', 'system', 'like', 'comment', 'meetup_invite', 'meetup_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  related_meetup_id TEXT, -- Will reference meetups table when created
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON notifications(from_user_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = user_uuid AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON notifications TO authenticated;

-- Insert some sample notifications for testing (optional)
-- Uncomment the following lines if you want to add sample data

/*
INSERT INTO notifications (user_id, type, title, message, from_user_id) VALUES
  ('your-user-id-here', 'system', 'Welcome to NomadNow!', 'Your account has been successfully created. Start exploring and connecting with other digital nomads!', NULL),
  ('your-user-id-here', 'greeting', 'New follower', 'John Doe started following you', 'another-user-id-here'),
  ('your-user-id-here', 'message', 'New message', 'Jane Smith sent you a message: "Hey! Are you still in Bali?"', 'another-user-id-here');
*/

-- Create a view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_notifications,
  COUNT(*) FILTER (WHERE type = 'message') as message_notifications,
  COUNT(*) FILTER (WHERE type = 'like') as like_notifications,
  COUNT(*) FILTER (WHERE type = 'comment') as comment_notifications,
  MAX(created_at) as last_notification_at
FROM notifications
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON notification_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own notification stats" ON notification_stats
  FOR SELECT USING (auth.uid() = user_id);
