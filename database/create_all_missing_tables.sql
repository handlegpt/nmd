-- Create All Missing Database Tables
-- 创建所有缺失的数据库表
-- This script creates all the missing tables for complete data migration from localStorage to database

-- ==============================================
-- 1. USER RATINGS AND REVIEWS SYSTEM
-- ==============================================

-- User Ratings Table - 用户评分表
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

-- User Reviews Table - 用户评论表
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

-- Rating Summaries Table - 评分摘要表
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
-- 2. MEETUP SYSTEM
-- ==============================================

-- Meetups Table - 聚会表
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

-- Meetup Participants Table - 聚会参与者表
CREATE TABLE IF NOT EXISTS meetup_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(meetup_id, user_id)
);

-- Meetup Activities Table - 聚会活动记录表
CREATE TABLE IF NOT EXISTS meetup_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'joined', 'left', 'cancelled', 'completed', 'reviewed')),
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetup Reviews Table - 聚会评论表
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
-- 3. REAL-TIME SYSTEM
-- ==============================================

-- User Activity Table - 用户活动表
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

-- Online Users Table - 在线用户表
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

-- Leaderboard Table - 排行榜表
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

-- Activity Events Table - 活动事件表
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
-- 4. VOTING SYSTEM
-- ==============================================

-- City Votes Table - 城市投票表
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

-- Place Votes Table - 地点投票表
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

-- Vote Summaries Table - 投票摘要表
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
-- 5. TOOL DATA TABLES
-- ==============================================

-- Domain Tracker Data Table - 域名追踪数据表
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

-- City Preferences Table - 城市偏好数据表
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

-- Travel Planner Data Table - 旅行规划数据表
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

-- Cost Calculator Data Table - 生活成本计算器数据表
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

-- Visa Counter Data Table - 签证天数计数器数据表
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

-- Travel Tracker Data Table - 旅行追踪数据表
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
-- CREATE ALL INDEXES
-- ==============================================

-- User Ratings Indexes
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_id ON user_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_category ON user_ratings(category);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON user_ratings(created_at);

-- User Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewed_user_id ON user_reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at);

-- Rating Summaries Indexes
CREATE INDEX IF NOT EXISTS idx_rating_summaries_user_id ON rating_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_summaries_overall_rating ON rating_summaries(overall_rating);

-- Meetups Indexes
CREATE INDEX IF NOT EXISTS idx_meetups_organizer_id ON meetups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_meeting_time ON meetups(meeting_time);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_meetup_type ON meetups(meetup_type);
CREATE INDEX IF NOT EXISTS idx_meetups_location ON meetups(location);
CREATE INDEX IF NOT EXISTS idx_meetups_created_at ON meetups(created_at);

-- Meetup Participants Indexes
CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_user_id ON meetup_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_status ON meetup_participants(status);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_joined_at ON meetup_participants(joined_at);

-- Meetup Activities Indexes
CREATE INDEX IF NOT EXISTS idx_meetup_activities_meetup_id ON meetup_activities(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_user_id ON meetup_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_type ON meetup_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_meetup_activities_created_at ON meetup_activities(created_at);

-- Meetup Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_meetup_id ON meetup_reviews(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_reviewer_id ON meetup_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_rating ON meetup_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_meetup_reviews_created_at ON meetup_reviews(created_at);

-- User Activity Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_type ON user_activity(user_id, activity_type);

-- Online Users Indexes
CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_status ON online_users(status);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_online_users_updated_at ON online_users(updated_at);

-- Leaderboard Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard(category, period);

-- Activity Events Indexes
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_is_read ON activity_events(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_events_expires_at ON activity_events(expires_at);

-- City Votes Indexes
CREATE INDEX IF NOT EXISTS idx_city_votes_city_id ON city_votes(city_id);
CREATE INDEX IF NOT EXISTS idx_city_votes_user_id ON city_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_city_votes_type ON city_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_city_votes_created_at ON city_votes(created_at);

-- Place Votes Indexes
CREATE INDEX IF NOT EXISTS idx_place_votes_place_id ON place_votes(place_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_user_id ON place_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_type ON place_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_place_votes_created_at ON place_votes(created_at);

-- Vote Summaries Indexes
CREATE INDEX IF NOT EXISTS idx_vote_summaries_target ON vote_summaries(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_type ON vote_summaries(target_type);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_score ON vote_summaries(weighted_score DESC);
CREATE INDEX IF NOT EXISTS idx_vote_summaries_rating ON vote_summaries(average_rating DESC);

-- Tool Data Indexes
CREATE INDEX IF NOT EXISTS idx_domain_tracker_user_id ON domain_tracker_data(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_tracker_domain ON domain_tracker_data(domain_name);
CREATE INDEX IF NOT EXISTS idx_domain_tracker_status ON domain_tracker_data(status);
CREATE INDEX IF NOT EXISTS idx_domain_tracker_created_at ON domain_tracker_data(created_at);

CREATE INDEX IF NOT EXISTS idx_city_preferences_user_id ON city_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_city_preferences_city_id ON city_preferences(city_id);
CREATE INDEX IF NOT EXISTS idx_city_preferences_favorite ON city_preferences(is_favorite);
CREATE INDEX IF NOT EXISTS idx_city_preferences_created_at ON city_preferences(created_at);

CREATE INDEX IF NOT EXISTS idx_travel_planner_user_id ON travel_planner_data(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_planner_status ON travel_planner_data(status);
CREATE INDEX IF NOT EXISTS idx_travel_planner_dates ON travel_planner_data(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_travel_planner_created_at ON travel_planner_data(created_at);

CREATE INDEX IF NOT EXISTS idx_cost_calculator_user_id ON cost_calculator_data(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_calculator_city_id ON cost_calculator_data(city_id);
CREATE INDEX IF NOT EXISTS idx_cost_calculator_date ON cost_calculator_data(calculation_date);
CREATE INDEX IF NOT EXISTS idx_cost_calculator_created_at ON cost_calculator_data(created_at);

CREATE INDEX IF NOT EXISTS idx_visa_counter_user_id ON visa_counter_data(user_id);
CREATE INDEX IF NOT EXISTS idx_visa_counter_country ON visa_counter_data(country_code);
CREATE INDEX IF NOT EXISTS idx_visa_counter_status ON visa_counter_data(status);
CREATE INDEX IF NOT EXISTS idx_visa_counter_dates ON visa_counter_data(entry_date, exit_date);

CREATE INDEX IF NOT EXISTS idx_travel_tracker_user_id ON travel_tracker_data(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_tracker_status ON travel_tracker_data(status);
CREATE INDEX IF NOT EXISTS idx_travel_tracker_dates ON travel_tracker_data(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_travel_tracker_created_at ON travel_tracker_data(created_at);

-- ==============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================

ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_tracker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_planner_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_calculator_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_counter_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_tracker_data ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- CREATE RLS POLICIES
-- ==============================================

-- User Ratings Policies
CREATE POLICY "Users can view all ratings" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings for others" ON user_ratings FOR INSERT WITH CHECK (auth.uid() = rater_id AND auth.uid() != rated_user_id);
CREATE POLICY "Users can update their own ratings" ON user_ratings FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Users can delete their own ratings" ON user_ratings FOR DELETE USING (auth.uid() = rater_id);

-- User Reviews Policies
CREATE POLICY "Users can view all public reviews" ON user_reviews FOR SELECT USING (is_public = true OR auth.uid() = reviewer_id OR auth.uid() = reviewed_user_id);
CREATE POLICY "Users can create reviews for others" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != reviewed_user_id);
CREATE POLICY "Users can update their own reviews" ON user_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON user_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Rating Summaries Policies
CREATE POLICY "Users can view all rating summaries" ON rating_summaries FOR SELECT USING (true);
CREATE POLICY "System can manage rating summaries" ON rating_summaries FOR ALL USING (true);

-- Meetups Policies
CREATE POLICY "Users can view all active meetups" ON meetups FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view their own meetups" ON meetups FOR SELECT USING (auth.uid() = organizer_id);
CREATE POLICY "Users can create meetups" ON meetups FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update their own meetups" ON meetups FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete their own meetups" ON meetups FOR DELETE USING (auth.uid() = organizer_id);

-- Meetup Participants Policies
CREATE POLICY "Users can view participants of meetups they're in" ON meetup_participants FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid())
);
CREATE POLICY "Users can join meetups" ON meetup_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own participation" ON meetup_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave meetups" ON meetup_participants FOR DELETE USING (auth.uid() = user_id);

-- Meetup Activities Policies
CREATE POLICY "Users can view activities of meetups they're in" ON meetup_activities FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM meetup_participants WHERE meetup_id = meetup_activities.meetup_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create activities" ON meetup_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meetup Reviews Policies
CREATE POLICY "Users can view all meetup reviews" ON meetup_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for meetups they participated in" ON meetup_reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (SELECT 1 FROM meetup_participants WHERE meetup_id = meetup_reviews.meetup_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own reviews" ON meetup_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON meetup_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- User Activity Policies
CREATE POLICY "Users can view their own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Online Users Policies
CREATE POLICY "Users can view all online users" ON online_users FOR SELECT USING (true);
CREATE POLICY "Users can update their own online status" ON online_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own online status" ON online_users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own online status" ON online_users FOR DELETE USING (auth.uid() = user_id);

-- Leaderboard Policies
CREATE POLICY "Users can view all leaderboard entries" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "System can manage leaderboard" ON leaderboard FOR ALL USING (true);

-- Activity Events Policies
CREATE POLICY "Users can view their own events" ON activity_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON activity_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create events" ON activity_events FOR INSERT WITH CHECK (true);

-- City Votes Policies
CREATE POLICY "Users can view all city votes" ON city_votes FOR SELECT USING (true);
CREATE POLICY "Users can create city votes" ON city_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city votes" ON city_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city votes" ON city_votes FOR DELETE USING (auth.uid() = user_id);

-- Place Votes Policies
CREATE POLICY "Users can view all place votes" ON place_votes FOR SELECT USING (true);
CREATE POLICY "Users can create place votes" ON place_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own place votes" ON place_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own place votes" ON place_votes FOR DELETE USING (auth.uid() = user_id);

-- Vote Summaries Policies
CREATE POLICY "Users can view all vote summaries" ON vote_summaries FOR SELECT USING (true);
CREATE POLICY "System can manage vote summaries" ON vote_summaries FOR ALL USING (true);

-- Tool Data Policies (all follow same pattern - users can only access their own data)
CREATE POLICY "Users can view their own domain tracker data" ON domain_tracker_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own domain tracker data" ON domain_tracker_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own domain tracker data" ON domain_tracker_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own domain tracker data" ON domain_tracker_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own city preferences" ON city_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own city preferences" ON city_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own city preferences" ON city_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own city preferences" ON city_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own travel planner data" ON travel_planner_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own travel planner data" ON travel_planner_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own travel planner data" ON travel_planner_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own travel planner data" ON travel_planner_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own cost calculator data" ON cost_calculator_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cost calculator data" ON cost_calculator_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cost calculator data" ON cost_calculator_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cost calculator data" ON cost_calculator_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own visa counter data" ON visa_counter_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own visa counter data" ON visa_counter_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visa counter data" ON visa_counter_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visa counter data" ON visa_counter_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own travel tracker data" ON travel_tracker_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own travel tracker data" ON travel_tracker_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own travel tracker data" ON travel_tracker_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own travel tracker data" ON travel_tracker_data FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- CREATE TRIGGERS
-- ==============================================

-- Updated_at triggers for all tables with updated_at column
DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON user_reviews;
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rating_summaries_updated_at ON rating_summaries;
CREATE TRIGGER update_rating_summaries_updated_at BEFORE UPDATE ON rating_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetups_updated_at ON meetups;
CREATE TRIGGER update_meetups_updated_at BEFORE UPDATE ON meetups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetup_reviews_updated_at ON meetup_reviews;
CREATE TRIGGER update_meetup_reviews_updated_at BEFORE UPDATE ON meetup_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_online_users_updated_at ON online_users;
CREATE TRIGGER update_online_users_updated_at BEFORE UPDATE ON online_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_city_votes_updated_at ON city_votes;
CREATE TRIGGER update_city_votes_updated_at BEFORE UPDATE ON city_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_votes_updated_at ON place_votes;
CREATE TRIGGER update_place_votes_updated_at BEFORE UPDATE ON place_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vote_summaries_updated_at ON vote_summaries;
CREATE TRIGGER update_vote_summaries_updated_at BEFORE UPDATE ON vote_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_domain_tracker_updated_at ON domain_tracker_data;
CREATE TRIGGER update_domain_tracker_updated_at BEFORE UPDATE ON domain_tracker_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_city_preferences_updated_at ON city_preferences;
CREATE TRIGGER update_city_preferences_updated_at BEFORE UPDATE ON city_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_planner_updated_at ON travel_planner_data;
CREATE TRIGGER update_travel_planner_updated_at BEFORE UPDATE ON travel_planner_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_calculator_updated_at ON cost_calculator_data;
CREATE TRIGGER update_cost_calculator_updated_at BEFORE UPDATE ON cost_calculator_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visa_counter_updated_at ON visa_counter_data;
CREATE TRIGGER update_visa_counter_updated_at BEFORE UPDATE ON visa_counter_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_tracker_updated_at ON travel_tracker_data;
CREATE TRIGGER update_travel_tracker_updated_at BEFORE UPDATE ON travel_tracker_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ All missing database tables created successfully!';
    RAISE NOTICE '📊 Created tables:';
    RAISE NOTICE '   - User Ratings System (user_ratings, user_reviews, rating_summaries)';
    RAISE NOTICE '   - Meetup System (meetups, meetup_participants, meetup_activities, meetup_reviews)';
    RAISE NOTICE '   - Real-time System (user_activity, online_users, leaderboard, activity_events)';
    RAISE NOTICE '   - Voting System (city_votes, place_votes, vote_summaries)';
    RAISE NOTICE '   - Tool Data (domain_tracker_data, city_preferences, travel_planner_data, cost_calculator_data, visa_counter_data, travel_tracker_data)';
    RAISE NOTICE '🔒 All tables have Row Level Security (RLS) enabled with appropriate policies';
    RAISE NOTICE '📈 All performance indexes created';
    RAISE NOTICE '⚡ All triggers and functions created';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Update service layer code to use database instead of localStorage';
    RAISE NOTICE '   2. Create API endpoints for new tables';
    RAISE NOTICE '   3. Test data migration from localStorage to database';
    RAISE NOTICE '   4. Remove localStorage dependencies from production code';
END $$;
