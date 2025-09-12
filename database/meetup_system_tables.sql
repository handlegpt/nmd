-- Meetup System Tables
-- 聚会系统数据库表

-- 1. Meetups Table - 聚会表
CREATE TABLE IF NOT EXISTS meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'full')),
    meetup_type VARCHAR(20) DEFAULT 'coffee' CHECK (meetup_type IN ('coffee', 'work', 'social', 'other')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Meetup Participants Table - 聚会参与者表
CREATE TABLE IF NOT EXISTS meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent duplicate participants
    UNIQUE(meetup_id, user_id)
);

-- 3. Meetup Activities Table - 聚会活动记录表
CREATE TABLE IF NOT EXISTS meetup_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'joined', 'left', 'cancelled', 'completed', 'reviewed')),
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Meetup Reviews Table - 聚会评论表
CREATE TABLE IF NOT EXISTS meetup_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate reviews from same user for same meetup
    UNIQUE(meetup_id, reviewer_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetups_organizer_id ON meetups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_meeting_time ON meetups(meeting_time);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_meetup_type ON meetups(meetup_type);
CREATE INDEX IF NOT EXISTS idx_meetups_location ON meetups(location);
CREATE INDEX IF NOT EXISTS idx_meetups_created_at ON meetups(created_at);

CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_status ON meetup_participants(status);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_joined_at ON meetup_participants(joined_at);

CREATE INDEX IF NOT EXISTS idx_meetup_activities_meetup_id ON meetup_activities(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_user_id ON meetup_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_type ON meetup_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_created_at ON meetup_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_meetup_reviews_meetup_id ON meetup_reviews(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_reviewer_id ON meetup_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_rating ON meetup_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_created_at ON meetup_reviews(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetups
CREATE POLICY "Users can view all active meetups" ON meetups
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own meetups" ON meetups
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Users can create meetups" ON meetups
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own meetups" ON meetups
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own meetups" ON meetups
    FOR DELETE USING (auth.uid() = organizer_id);

-- RLS Policies for meetup_participants
CREATE POLICY "Users can view participants of meetups they're in" ON meetup_participants
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid())
    );

CREATE POLICY "Users can join meetups" ON meetup_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON meetup_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave meetups" ON meetup_participants
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meetup_activities
CREATE POLICY "Users can view activities of meetups they're in" ON meetup_activities
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM meetup_participants WHERE meetup_id = meetup_activities.meetup_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create activities" ON meetup_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meetup_reviews
CREATE POLICY "Users can view all meetup reviews" ON meetup_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for meetups they participated in" ON meetup_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (SELECT 1 FROM meetup_participants WHERE meetup_id = meetup_reviews.meetup_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update their own reviews" ON meetup_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON meetup_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_meetup_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'joined' THEN
        UPDATE meetups 
        SET current_participants = current_participants + 1,
            status = CASE 
                WHEN current_participants + 1 >= max_participants THEN 'full'
                ELSE status
            END
        WHERE id = NEW.meetup_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'joined' AND NEW.status != 'joined' THEN
            UPDATE meetups 
            SET current_participants = current_participants - 1,
                status = CASE 
                    WHEN current_participants - 1 < max_participants AND status = 'full' THEN 'active'
                    ELSE status
                END
            WHERE id = NEW.meetup_id;
        ELSIF OLD.status != 'joined' AND NEW.status = 'joined' THEN
            UPDATE meetups 
            SET current_participants = current_participants + 1,
                status = CASE 
                    WHEN current_participants + 1 >= max_participants THEN 'full'
                    ELSE status
                END
            WHERE id = NEW.meetup_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'joined' THEN
        UPDATE meetups 
        SET current_participants = current_participants - 1,
            status = CASE 
                WHEN current_participants - 1 < max_participants AND status = 'full' THEN 'active'
                ELSE status
            END
        WHERE id = OLD.meetup_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant count
DROP TRIGGER IF EXISTS update_meetup_participant_count_trigger ON meetup_participants;
CREATE TRIGGER update_meetup_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meetup_participants
    FOR EACH ROW EXECUTE FUNCTION update_meetup_participant_count();

-- Function to create activity when participant joins
CREATE OR REPLACE FUNCTION create_meetup_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'joined' THEN
        INSERT INTO meetup_activities (meetup_id, user_id, activity_type, activity_data)
        VALUES (NEW.meetup_id, NEW.user_id, 'joined', '{}');
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'joined' AND NEW.status = 'joined' THEN
        INSERT INTO meetup_activities (meetup_id, user_id, activity_type, activity_data)
        VALUES (NEW.meetup_id, NEW.user_id, 'joined', '{}');
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'joined' AND NEW.status != 'joined' THEN
        INSERT INTO meetup_activities (meetup_id, user_id, activity_type, activity_data)
        VALUES (NEW.meetup_id, NEW.user_id, 'left', '{}');
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'joined' THEN
        INSERT INTO meetup_activities (meetup_id, user_id, activity_type, activity_data)
        VALUES (OLD.meetup_id, OLD.user_id, 'left', '{}');
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meetup activities
DROP TRIGGER IF EXISTS create_meetup_activity_trigger ON meetup_participants;
CREATE TRIGGER create_meetup_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meetup_participants
    FOR EACH ROW EXECUTE FUNCTION create_meetup_activity();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_meetups_updated_at ON meetups;
CREATE TRIGGER update_meetups_updated_at
    BEFORE UPDATE ON meetups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetup_reviews_updated_at ON meetup_reviews;
CREATE TRIGGER update_meetup_reviews_updated_at
    BEFORE UPDATE ON meetup_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
