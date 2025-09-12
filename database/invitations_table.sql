-- Create invitations table for Coffee Meetup and Work Together features
-- This table stores all user invitations and their status

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_type VARCHAR(20) NOT NULL CHECK (invitation_type IN ('coffee_meetup', 'work_together')),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    meeting_time TIMESTAMP WITH TIME ZONE,
    meeting_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_receiver_id ON invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_type ON invitations(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_invitations_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see invitations they sent or received
CREATE POLICY "Users can view their own invitations" ON invitations
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Users can create invitations
CREATE POLICY "Users can create invitations" ON invitations
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update invitations they received (to accept/decline)
CREATE POLICY "Users can update received invitations" ON invitations
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Users can delete invitations they sent
CREATE POLICY "Users can delete sent invitations" ON invitations
    FOR DELETE USING (auth.uid() = sender_id);

-- Add comments for documentation
COMMENT ON TABLE invitations IS 'Stores user invitations for coffee meetups and work together sessions';
COMMENT ON COLUMN invitations.invitation_type IS 'Type of invitation: coffee_meetup or work_together';
COMMENT ON COLUMN invitations.status IS 'Invitation status: pending, accepted, declined, expired';
COMMENT ON COLUMN invitations.expires_at IS 'When the invitation expires (default 7 days)';
