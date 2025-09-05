-- Meetup History Database Design
-- Complete meetup lifecycle management system

-- 1. Meetups table (main meetup records)
CREATE TABLE IF NOT EXISTS meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER,
  meetup_type VARCHAR(50) DEFAULT 'casual', -- 'casual', 'work', 'social', 'activity'
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Meetup participants table
CREATE TABLE IF NOT EXISTS meetup_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'invited', -- 'invited', 'accepted', 'declined', 'attended', 'no_show'
  response_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- 3. Meetup history table (detailed history records)
CREATE TABLE IF NOT EXISTS meetup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'cancelled', 'completed', 'participant_joined', 'participant_left'
  action_by UUID REFERENCES users(id),
  old_data JSONB, -- Store previous state
  new_data JSONB, -- Store new state
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Meetup reminders table
CREATE TABLE IF NOT EXISTS meetup_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'day_before', 'hour_before', 'custom'
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetups_creator_id ON meetups(creator_id);
CREATE INDEX IF NOT EXISTS idx_meetups_scheduled_time ON meetups(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_location ON meetups(location);
CREATE INDEX IF NOT EXISTS idx_meetups_type ON meetups(meetup_type);
CREATE INDEX IF NOT EXISTS idx_meetups_tags ON meetups USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_status ON meetup_participants(status);

CREATE INDEX IF NOT EXISTS idx_meetup_history_meetup_id ON meetup_history(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_history_action_by ON meetup_history(action_by);
CREATE INDEX IF NOT EXISTS idx_meetup_history_created_at ON meetup_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meetup_reminders_meetup_id ON meetup_reminders(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reminders_user_id ON meetup_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reminders_reminder_time ON meetup_reminders(reminder_time);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_meetup_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meetups_updated_at
  BEFORE UPDATE ON meetups
  FOR EACH ROW
  EXECUTE FUNCTION update_meetup_timestamps();

CREATE TRIGGER trigger_update_meetup_participants_updated_at
  BEFORE UPDATE ON meetup_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_meetup_timestamps();

-- Create trigger to log meetup history
CREATE OR REPLACE FUNCTION log_meetup_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO meetup_history (meetup_id, action_type, action_by, new_data)
    VALUES (NEW.id, 'created', NEW.creator_id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO meetup_history (meetup_id, action_type, action_by, old_data, new_data)
    VALUES (NEW.id, 'updated', NEW.creator_id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO meetup_history (meetup_id, action_type, action_by, old_data)
    VALUES (OLD.id, 'deleted', OLD.creator_id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_meetup_history
  AFTER INSERT OR UPDATE OR DELETE ON meetups
  FOR EACH ROW
  EXECUTE FUNCTION log_meetup_history();

-- Enable Row Level Security (RLS)
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies: Meetups
CREATE POLICY "Allow public read public meetups" ON meetups
  FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Allow authenticated users to create meetups" ON meetups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Allow creators to update own meetups" ON meetups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Allow creators to delete own meetups" ON meetups
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS policies: Meetup participants
CREATE POLICY "Allow users to view meetup participants" ON meetup_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetups m 
      WHERE m.id = meetup_participants.meetup_id 
      AND (m.is_public = true OR m.creator_id = auth.uid() OR meetup_participants.user_id = auth.uid())
    )
  );

CREATE POLICY "Allow users to join public meetups" ON meetup_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetups m 
      WHERE m.id = meetup_participants.meetup_id 
      AND m.is_public = true
    ) AND auth.uid() = user_id
  );

CREATE POLICY "Allow users to update own participation" ON meetup_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to leave meetups" ON meetup_participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies: Meetup history
CREATE POLICY "Allow users to view meetup history" ON meetup_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetups m 
      WHERE m.id = meetup_history.meetup_id 
      AND (m.is_public = true OR m.creator_id = auth.uid())
    )
  );

-- RLS policies: Meetup reminders
CREATE POLICY "Allow users to view own reminders" ON meetup_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create own reminders" ON meetup_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own reminders" ON meetup_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own reminders" ON meetup_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Create view for meetup statistics
CREATE OR REPLACE VIEW meetup_stats AS
SELECT 
  m.id as meetup_id,
  m.title,
  m.scheduled_time,
  m.status,
  m.creator_id,
  u.name as creator_name,
  COUNT(mp.id) as total_participants,
  COUNT(CASE WHEN mp.status = 'accepted' THEN 1 END) as accepted_participants,
  COUNT(CASE WHEN mp.status = 'attended' THEN 1 END) as attended_participants,
  AVG(CASE WHEN mp.rating IS NOT NULL THEN mp.rating END) as average_rating,
  COUNT(CASE WHEN mp.rating IS NOT NULL THEN 1 END) as total_ratings
FROM meetups m
LEFT JOIN users u ON m.creator_id = u.id
LEFT JOIN meetup_participants mp ON m.id = mp.meetup_id
GROUP BY m.id, m.title, m.scheduled_time, m.status, m.creator_id, u.name;

-- Create function to get user meetup history
CREATE OR REPLACE FUNCTION get_user_meetup_history(user_uuid UUID, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
  meetup_data JSON,
  participation_data JSON,
  stats_data JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT row_to_json(m.*) FROM meetups m WHERE m.id = mp.meetup_id),
    (SELECT row_to_json(mp.*) FROM meetup_participants mp WHERE mp.meetup_id = m.id AND mp.user_id = user_uuid),
    (SELECT row_to_json(ms.*) FROM meetup_stats ms WHERE ms.meetup_id = m.id)
  FROM meetup_participants mp
  JOIN meetups m ON mp.meetup_id = m.id
  WHERE mp.user_id = user_uuid
  ORDER BY m.scheduled_time DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
