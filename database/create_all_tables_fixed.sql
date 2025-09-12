-- Create All Database Tables - Fixed Version
-- 创建所有数据库表 - 修复版本
-- This script ensures users table is properly structured before creating dependent tables

-- ==============================================
-- STEP 1: FIX USERS TABLE STRUCTURE
-- ==============================================

-- Ensure users table exists with all required columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_city VARCHAR(255) DEFAULT 'Unknown Location',
    profession VARCHAR(255) DEFAULT 'Digital Nomad',
    company VARCHAR(255) DEFAULT 'Freelance',
    bio TEXT DEFAULT 'Digital nomad exploring the world!',
    interests TEXT[] DEFAULT '{}',
    coordinates JSONB,
    is_visible_in_nomads BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    travel_preferences JSONB DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}'
);

-- Add missing columns to existing users table
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_city') THEN
        ALTER TABLE users ADD COLUMN current_city VARCHAR(255) DEFAULT 'Unknown Location';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profession') THEN
        ALTER TABLE users ADD COLUMN profession VARCHAR(255) DEFAULT 'Digital Nomad';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
        ALTER TABLE users ADD COLUMN company VARCHAR(255) DEFAULT 'Freelance';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Digital nomad exploring the world!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN
        ALTER TABLE users ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'coordinates') THEN
        ALTER TABLE users ADD COLUMN coordinates JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_visible_in_nomads') THEN
        ALTER TABLE users ADD COLUMN is_visible_in_nomads BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_online') THEN
        ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_available') THEN
        ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_seen') THEN
        ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'travel_preferences') THEN
        ALTER TABLE users ADD COLUMN travel_preferences JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'skills') THEN
        ALTER TABLE users ADD COLUMN skills TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'social_links') THEN
        ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'contact_info') THEN
        ALTER TABLE users ADD COLUMN contact_info JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_current_city ON users(current_city);
CREATE INDEX IF NOT EXISTS idx_users_is_visible ON users(is_visible_in_nomads);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- ==============================================
-- STEP 2: CREATE CITIES AND PLACES TABLES (if not exist)
-- ==============================================

-- Create cities table if not exists
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    timezone VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visa_days INTEGER,
    visa_type VARCHAR(50),
    cost_of_living INTEGER,
    wifi_speed INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create places table if not exists
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2),
    price_level INTEGER,
    amenities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 3: CREATE USER RATINGS AND REVIEWS SYSTEM
-- ==============================================

-- User Ratings Table
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rater_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rated_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('communication', 'reliability', 'friendliness', 'professionalism', 'overall')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rater_id, rated_user_id, category)
);

-- User Reviews Table
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reviewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_user_id)
);

-- Rating Summaries Table
CREATE TABLE IF NOT EXISTS rating_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    overall_rating DECIMAL(3,2) DEFAULT 0.00,
    communication_rating DECIMAL(3,2) DEFAULT 0.00,
    reliability_rating DECIMAL(3,2) DEFAULT 0.00,
    friendliness_rating DECIMAL(3,2) DEFAULT 0.00,
    professionalism_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 4: CREATE MEETUP SYSTEM
-- ==============================================

-- Meetups Table
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

-- Meetup Participants Table
CREATE TABLE IF NOT EXISTS meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(meetup_id, user_id)
);

-- Meetup Activities Table
CREATE TABLE IF NOT EXISTS meetup_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'joined', 'left', 'cancelled', 'completed', 'reviewed')),
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetup Reviews Table
CREATE TABLE IF NOT EXISTS meetup_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meetup_id, reviewer_id)
);

-- ==============================================
-- STEP 5: CREATE REAL-TIME SYSTEM
-- ==============================================

-- User Activity Table
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'login', 'logout', 'profile_update', 'meetup_join', 'meetup_leave',
        'rating_given', 'review_posted', 'city_visit', 'place_checkin',
        'invitation_sent', 'invitation_accepted', 'invitation_declined'
    )),
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Online Users Table
CREATE TABLE IF NOT EXISTS online_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    location_data JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    score INTEGER DEFAULT 0,
    rank_position INTEGER,
    category VARCHAR(50) DEFAULT 'overall' CHECK (category IN ('overall', 'meetups', 'reviews', 'activity')),
    period VARCHAR(20) DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    stats JSONB DEFAULT '{}',
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Events Table
CREATE TABLE IF NOT EXISTS activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'new_meetup', 'meetup_reminder', 'new_rating', 'new_review',
        'invitation_received', 'invitation_accepted', 'friend_online',
        'city_update', 'place_recommendation'
    )),
    event_data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 6: CREATE VOTING SYSTEM
-- ==============================================

-- City Votes Table
CREATE TABLE IF NOT EXISTS city_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'neutral')),
    vote_weight INTEGER DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, user_id)
);

-- Place Votes Table
CREATE TABLE IF NOT EXISTS place_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'neutral')),
    vote_weight INTEGER DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(place_id, user_id)
);

-- Vote Summaries Table
CREATE TABLE IF NOT EXISTS vote_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL,
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('city', 'place')),
    total_votes INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    neutral_votes INTEGER DEFAULT 0,
    weighted_score DECIMAL(10,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(target_id, target_type)
);

-- ==============================================
-- STEP 7: CREATE TOOL DATA TABLES
-- ==============================================

-- Domain Tracker Data Table
CREATE TABLE IF NOT EXISTS domain_tracker_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    domain_name VARCHAR(255) NOT NULL,
    domain_data JSONB DEFAULT '{}',
    tracking_settings JSONB DEFAULT '{}',
    last_checked TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, domain_name)
);

-- City Preferences Table
CREATE TABLE IF NOT EXISTS city_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
    preference_data JSONB DEFAULT '{}',
    visit_dates JSONB DEFAULT '[]',
    ratings JSONB DEFAULT '{}',
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- Travel Planner Data Table
CREATE TABLE IF NOT EXISTS travel_planner_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    trip_data JSONB DEFAULT '{}',
    itinerary JSONB DEFAULT '[]',
    budget_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost Calculator Data Table
CREATE TABLE IF NOT EXISTS cost_calculator_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
    calculation_data JSONB DEFAULT '{}',
    budget_breakdown JSONB DEFAULT '{}',
    custom_costs JSONB DEFAULT '{}',
    currency VARCHAR(3) DEFAULT 'USD',
    calculation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id, calculation_date)
);

-- Visa Counter Data Table
CREATE TABLE IF NOT EXISTS visa_counter_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    visa_type VARCHAR(50),
    entry_date DATE NOT NULL,
    exit_date DATE,
    days_used INTEGER DEFAULT 0,
    days_remaining INTEGER,
    visa_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Tracker Data Table
CREATE TABLE IF NOT EXISTS travel_tracker_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current_location JSONB DEFAULT '{}',
    visited_locations JSONB DEFAULT '[]',
    travel_stats JSONB DEFAULT '{}',
    photos JSONB DEFAULT '[]',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ All database tables created successfully!';
    RAISE NOTICE '📊 Users table structure verified and fixed';
    RAISE NOTICE '🎯 All dependent tables created with proper foreign key relationships';
    RAISE NOTICE '🔒 Row Level Security will be configured in the next step';
END $$;
