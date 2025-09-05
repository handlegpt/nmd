-- Notifications Database Design
-- Complete notification management system

-- 1. Notifications table (main notification records)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'meetup_invitation', 'meetup_reminder', 'meetup_update', 'meetup_cancelled', 'city_update', 'visa_reminder', 'weather_alert', 'social_mention', 'system_announcement'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Store notification-specific data
  priority INTEGER DEFAULT 1, -- 1-5 priority levels
  is_read BOOLEAN DEFAULT FALSE,
  is_actionable BOOLEAN DEFAULT TRUE,
  action_type VARCHAR(50), -- 'accept', 'decline', 'view', 'reply', 'dismiss'
  action_data JSONB DEFAULT '{}', -- Store action-specific data
  expires_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Notification preferences table (user notification settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- 3. Notification templates table (for system notifications)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Notification delivery logs table (for tracking delivery status)
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  delivery_method VARCHAR(20) NOT NULL, -- 'email', 'push', 'in_app'
  status VARCHAR(20) NOT NULL, -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(type);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status ON notification_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_created_at ON notification_delivery_logs(created_at DESC);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_notification_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER trigger_update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamps();

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies: Notifications
CREATE POLICY "Allow users to view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow system to create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- System can create notifications for any user

-- RLS policies: Notification preferences
CREATE POLICY "Allow users to view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies: Notification templates (read-only for all authenticated users)
CREATE POLICY "Allow authenticated users to view templates" ON notification_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies: Notification delivery logs (system only)
CREATE POLICY "Allow system to manage delivery logs" ON notification_delivery_logs
  FOR ALL USING (true);

-- Create function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  user_uuid UUID,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  filter_read BOOLEAN DEFAULT NULL,
  filter_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  notifications JSON,
  total_count BIGINT,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH notification_counts AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_read = FALSE) as unread
    FROM notifications 
    WHERE user_id = user_uuid
      AND (filter_read IS NULL OR is_read = filter_read)
      AND (filter_type IS NULL OR type = filter_type)
  ),
  notification_data AS (
    SELECT 
      row_to_json(n.*) as notification_json
    FROM notifications n
    WHERE n.user_id = user_uuid
      AND (filter_read IS NULL OR n.is_read = filter_read)
      AND (filter_type IS NULL OR n.type = filter_type)
    ORDER BY n.created_at DESC
    LIMIT page_size OFFSET ((page_num - 1) * page_size)
  )
  SELECT 
    COALESCE(json_agg(notification_json), '[]'::json) as notifications,
    nc.total as total_count,
    nc.unread as unread_count
  FROM notification_counts nc
  CROSS JOIN notification_data;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  user_uuid UUID,
  notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF notification_ids IS NULL THEN
    -- Mark all notifications as read
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = user_uuid AND is_read = FALSE;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = user_uuid AND id = ANY(notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type VARCHAR(50),
  notification_title VARCHAR(255),
  notification_message TEXT,
  notification_data JSONB DEFAULT '{}',
  notification_priority INTEGER DEFAULT 1,
  notification_action_type VARCHAR(50) DEFAULT NULL,
  notification_action_data JSONB DEFAULT '{}',
  notification_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority,
    action_type,
    action_data,
    expires_at
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_data,
    notification_priority,
    notification_action_type,
    notification_action_data,
    notification_expires_at
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO notification_templates (type, title_template, message_template, variables) VALUES
('meetup_invitation', 'New Meetup Invitation', '{creator_name} invited you to a meetup at {location}', '{"creator_name": "string", "location": "string"}'),
('meetup_reminder', 'Meetup Reminder', 'You have a meetup scheduled at {time} at {location}', '{"time": "string", "location": "string"}'),
('meetup_update', 'Meetup Update', '{creator_name} updated the meetup details', '{"creator_name": "string"}'),
('meetup_cancelled', 'Meetup Cancelled', 'The meetup at {location} has been cancelled', '{"location": "string"}'),
('city_update', 'City Update', 'New information available for {city_name}', '{"city_name": "string"}'),
('visa_reminder', 'Visa Reminder', 'Your visa expires in {days} days', '{"days": "number"}'),
('weather_alert', 'Weather Alert', 'Weather alert for {city_name}: {description}', '{"city_name": "string", "description": "string"}'),
('social_mention', 'Social Mention', '{user_name} mentioned you in a message', '{"user_name": "string"}'),
('system_announcement', 'System Announcement', '{title}', '{"title": "string"}')
ON CONFLICT (type) DO NOTHING;

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, type, email_enabled, push_enabled, in_app_enabled)
SELECT 
  u.id,
  t.type,
  TRUE,
  TRUE,
  TRUE
FROM users u
CROSS JOIN notification_templates t
ON CONFLICT (user_id, type) DO NOTHING;
