-- Tool Data Tables
-- 工具数据数据库表

-- 1. Domain Tracker Data Table - 域名追踪数据表
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
    
    -- Prevent duplicate domains for same user
    UNIQUE(user_id, domain_name)
);

-- 2. City Preferences Table - 城市偏好数据表
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
    
    -- Prevent duplicate city preferences for same user
    UNIQUE(user_id, city_id)
);

-- 3. Travel Planner Data Table - 旅行规划数据表
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

-- 4. Cost of Living Calculator Data Table - 生活成本计算器数据表
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
    
    -- Allow multiple calculations per user per city
    UNIQUE(user_id, city_id, calculation_date)
);

-- 5. Visa Day Counter Data Table - 签证天数计数器数据表
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

-- 6. Travel Tracker Data Table - 旅行追踪数据表
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

-- Add indexes for performance
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

-- Enable Row Level Security (RLS)
ALTER TABLE domain_tracker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_planner_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_calculator_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_counter_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_tracker_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domain_tracker_data
CREATE POLICY "Users can view their own domain tracker data" ON domain_tracker_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domain tracker data" ON domain_tracker_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domain tracker data" ON domain_tracker_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domain tracker data" ON domain_tracker_data
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for city_preferences
CREATE POLICY "Users can view their own city preferences" ON city_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own city preferences" ON city_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own city preferences" ON city_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own city preferences" ON city_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for travel_planner_data
CREATE POLICY "Users can view their own travel planner data" ON travel_planner_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel planner data" ON travel_planner_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel planner data" ON travel_planner_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel planner data" ON travel_planner_data
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cost_calculator_data
CREATE POLICY "Users can view their own cost calculator data" ON cost_calculator_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cost calculator data" ON cost_calculator_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cost calculator data" ON cost_calculator_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cost calculator data" ON cost_calculator_data
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for visa_counter_data
CREATE POLICY "Users can view their own visa counter data" ON visa_counter_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visa counter data" ON visa_counter_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visa counter data" ON visa_counter_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visa counter data" ON visa_counter_data
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for travel_tracker_data
CREATE POLICY "Users can view their own travel tracker data" ON travel_tracker_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel tracker data" ON travel_tracker_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel tracker data" ON travel_tracker_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel tracker data" ON travel_tracker_data
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_domain_tracker_updated_at ON domain_tracker_data;
CREATE TRIGGER update_domain_tracker_updated_at
    BEFORE UPDATE ON domain_tracker_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_city_preferences_updated_at ON city_preferences;
CREATE TRIGGER update_city_preferences_updated_at
    BEFORE UPDATE ON city_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_planner_updated_at ON travel_planner_data;
CREATE TRIGGER update_travel_planner_updated_at
    BEFORE UPDATE ON travel_planner_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_calculator_updated_at ON cost_calculator_data;
CREATE TRIGGER update_cost_calculator_updated_at
    BEFORE UPDATE ON cost_calculator_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visa_counter_updated_at ON visa_counter_data;
CREATE TRIGGER update_visa_counter_updated_at
    BEFORE UPDATE ON visa_counter_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_tracker_updated_at ON travel_tracker_data;
CREATE TRIGGER update_travel_tracker_updated_at
    BEFORE UPDATE ON travel_tracker_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
