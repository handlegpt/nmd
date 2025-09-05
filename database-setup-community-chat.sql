-- Community Chat Database Design
-- Community messaging system

-- 1. Community messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (message_type IN ('general', 'question', 'info', 'help')),
  location VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Message likes table
CREATE TABLE IF NOT EXISTS message_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- 3. Message replies table
CREATE TABLE IF NOT EXISTS message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('like', 'reply', 'mention')),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_type ON community_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent_id ON community_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_location ON community_messages(location);
CREATE INDEX IF NOT EXISTS idx_community_messages_tags ON community_messages USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_message_likes_message_id ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user_id ON message_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_message_replies_parent_id ON message_replies(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_replies_user_id ON message_replies(user_id);

CREATE INDEX IF NOT EXISTS idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_is_read ON message_notifications(is_read);

-- Create triggers to update message statistics
CREATE OR REPLACE FUNCTION update_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add like
    UPDATE community_messages 
    SET likes_count = likes_count + 1, updated_at = NOW()
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove like
    UPDATE community_messages 
    SET likes_count = likes_count - 1, updated_at = NOW()
    WHERE id = OLD.message_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_likes_count
  AFTER INSERT OR DELETE ON message_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_message_stats();

-- Create trigger to update reply count
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add reply
    UPDATE community_messages 
    SET replies_count = replies_count + 1, updated_at = NOW()
    WHERE id = NEW.parent_message_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove reply
    UPDATE community_messages 
    SET replies_count = replies_count - 1, updated_at = NOW()
    WHERE id = OLD.parent_message_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON message_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_count();

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_community_messages_updated_at
  BEFORE UPDATE ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_message_replies_updated_at
  BEFORE UPDATE ON message_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies: Community messages
CREATE POLICY "Allow public read community messages" ON community_messages
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Allow authenticated users to insert messages" ON community_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own messages" ON community_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own messages" ON community_messages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies: Message likes
CREATE POLICY "Allow public read message likes" ON message_likes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert likes" ON message_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own likes" ON message_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies: Message replies
CREATE POLICY "Allow public read message replies" ON message_replies
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Allow authenticated users to insert replies" ON message_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own replies" ON message_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own replies" ON message_replies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies: Message notifications
CREATE POLICY "Allow users to read own notifications" ON message_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow system to insert notifications" ON message_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own notifications" ON message_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create view to simplify queries
CREATE OR REPLACE VIEW community_messages_with_user_info AS
SELECT 
  cm.*,
  u.name as user_name,
  u.avatar_url as user_avatar,
  cm.location as user_location,
  EXISTS(SELECT 1 FROM message_likes ml WHERE ml.message_id = cm.id AND ml.user_id = auth.uid()) as is_liked_by_current_user
FROM community_messages cm
LEFT JOIN users u ON cm.user_id = u.id
WHERE NOT cm.is_deleted;

-- Create function to get message with replies
CREATE OR REPLACE FUNCTION get_message_with_replies(message_uuid UUID)
RETURNS TABLE (
  message_data JSON,
  replies_data JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT row_to_json(cm.*) FROM community_messages_with_user_info cm WHERE cm.id = message_uuid),
    (SELECT json_agg(row_to_json(mr.*)) 
     FROM (
       SELECT 
         mr.*,
         u.name as user_name,
         u.avatar_url as user_avatar
       FROM message_replies mr
       LEFT JOIN users u ON mr.user_id = u.id
       WHERE mr.parent_message_id = message_uuid AND NOT mr.is_deleted
       ORDER BY mr.created_at ASC
     ) mr
    );
END;
$$ LANGUAGE plpgsql;
