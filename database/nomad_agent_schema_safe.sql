-- =====================================================
-- Nomad Agent Database Schema - Safe Migration
-- Checks for existing tables before creating
-- =====================================================

-- 1. Digital Nomad Visa Table (only if not exists)
CREATE TABLE IF NOT EXISTS nomad_visas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(3) NOT NULL,                    -- Country code (ISO 3166-1 alpha-3)
  country_name VARCHAR(100) NOT NULL,             -- Country name
  visa_name VARCHAR(100) NOT NULL,                -- Visa name
  visa_type VARCHAR(50) NOT NULL,                 -- Visa type (digital_nomad, freelancer, etc.)
  duration_months INTEGER NOT NULL,               -- Duration in months
  cost_usd DECIMAL(10,2) NOT NULL,                -- Application fee in USD
  income_requirement_usd DECIMAL(10,2),           -- Income requirement USD/month
  application_time_days INTEGER,                  -- Application time in days
  requirements TEXT,                              -- Application requirements
  benefits TEXT,                                  -- Visa benefits
  tax_implications TEXT,                          -- Tax implications
  renewal_possible BOOLEAN DEFAULT false,         -- Whether renewable
  max_renewals INTEGER DEFAULT 0,                 -- Maximum renewals
  is_active BOOLEAN DEFAULT true,                 -- Whether active
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_country_visa UNIQUE (country, visa_name)
);

-- 2. Cities Main Data Table (only if not exists)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,              -- URL-friendly identifier
  name VARCHAR(100) NOT NULL,                     -- City name
  country VARCHAR(3) NOT NULL,                    -- Country code
  country_name VARCHAR(100) NOT NULL,             -- Country name
  latitude DECIMAL(10, 8),                        -- Latitude
  longitude DECIMAL(11, 8),                       -- Longitude
  timezone VARCHAR(50),                           -- Timezone
  population INTEGER,                             -- Population
  language VARCHAR(100),                          -- Primary language
  currency VARCHAR(3),                            -- Currency code
  climate_tag VARCHAR(50),                        -- Climate tag (tropical, temperate, etc.)
  safety_score DECIMAL(3,1),                      -- Safety score (1-10)
  wifi_speed_mbps DECIMAL(5,1),                   -- Average internet speed (Mbps)
  cost_min_usd INTEGER,                           -- Minimum cost of living (USD/month)
  cost_max_usd INTEGER,                           -- Maximum cost of living (USD/month)
  nomad_score DECIMAL(3,1),                       -- Digital nomad score (1-10)
  community_score DECIMAL(3,1),                   -- Community activity score (1-10)
  coffee_score DECIMAL(3,1),                      -- Coffee culture score (1-10)
  coworking_score DECIMAL(3,1),                   -- Coworking score (1-10)
  is_active BOOLEAN DEFAULT true,                 -- Whether active
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. City Cost of Living Details Table (only if not exists)
CREATE TABLE IF NOT EXISTS city_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,                 -- Cost type (accommodation, food, transport, etc.)
  monthly_estimate_usd DECIMAL(10,2),             -- Monthly estimate (USD)
  daily_estimate_usd DECIMAL(10,2),               -- Daily estimate (USD)
  source VARCHAR(100),                            -- Data source
  last_updated DATE,                              -- Last update date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_city_cost_type UNIQUE (city_id, cost_type)
);

-- 4. User Travel Plans Table (only if not exists)
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,                    -- Plan title
  origin_country VARCHAR(3),                      -- Origin country
  nationality VARCHAR(3),                         -- User nationality
  budget_usd INTEGER,                             -- Monthly budget (USD)
  duration_months INTEGER,                        -- Plan duration (months)
  start_date DATE,                                -- Start date
  end_date DATE,                                  -- End date
  party_size INTEGER DEFAULT 1,                   -- Number of people
  preferences JSONB,                              -- User preferences (JSON)
  summary JSONB,                                  -- AI-generated summary (JSON)
  status VARCHAR(50) DEFAULT 'draft',             -- Status (draft, active, completed)
  is_public BOOLEAN DEFAULT false,                -- Whether public
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Plan Route Legs Table (only if not exists)
CREATE TABLE IF NOT EXISTS plan_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,                -- Sequence order
  city_id INTEGER REFERENCES cities(id),          -- City ID
  arrive_date DATE,                               -- Arrival date
  depart_date DATE,                               -- Departure date
  duration_days INTEGER,                          -- Stay duration in days
  estimated_cost_usd DECIMAL(10,2),               -- Estimated cost (USD)
  visa_required BOOLEAN DEFAULT false,            -- Whether visa required
  visa_type VARCHAR(100),                         -- Visa type
  visa_cost_usd DECIMAL(10,2),                    -- Visa cost (USD)
  notes TEXT,                                     -- Notes
  metadata JSONB,                                 -- Metadata (JSON)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Plan Daily Schedule Table (only if not exists)
CREATE TABLE IF NOT EXISTS plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  leg_id UUID REFERENCES plan_legs(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,                     -- Day number
  date DATE NOT NULL,                             -- Date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Plan Daily Items Table (only if not exists)
CREATE TABLE IF NOT EXISTS plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES plan_days(id) ON DELETE CASCADE,
  time_slot VARCHAR(20),                          -- Time slot (morning, afternoon, evening)
  place_name VARCHAR(200),                        -- Place name
  place_id VARCHAR(100),                          -- External POI ID
  latitude DECIMAL(10, 8),                        -- Latitude
  longitude DECIMAL(11, 8),                       -- Longitude
  category VARCHAR(50),                           -- Category (cafe, coworking, museum, etc.)
  estimated_cost_usd DECIMAL(10,2),               -- Estimated cost (USD)
  source VARCHAR(50),                             -- Data source (google_places, manual, model)
  metadata JSONB,                                 -- Metadata (JSON)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Preferences Table (only if not exists)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nationality VARCHAR(3),                         -- Nationality
  budget_usd INTEGER,                             -- Monthly budget (USD)
  languages TEXT[],                               -- Language abilities
  interests TEXT[],                               -- Interest tags
  travel_style VARCHAR(50),                       -- Travel style
  accommodation_preference VARCHAR(50),           -- Accommodation preference
  food_preference VARCHAR(50),                    -- Food preference
  climate_preference VARCHAR(50),                 -- Climate preference
  visa_preference VARCHAR(50),                    -- Visa preference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Nomad Visa Applications Table (only if not exists)
CREATE TABLE IF NOT EXISTS user_nomad_visa_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visa_id UUID REFERENCES nomad_visas(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES travel_plans(id) ON DELETE SET NULL,
  application_status VARCHAR(50) DEFAULT 'pending', -- Application status
  application_date DATE,                          -- Application date
  expected_approval_date DATE,                    -- Expected approval date
  actual_approval_date DATE,                      -- Actual approval date
  notes TEXT,                                     -- Notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Data Sources Table (only if not exists)
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(100) NOT NULL,              -- Data source name
  source_type VARCHAR(50) NOT NULL,               -- Data source type (api, manual, scraped)
  endpoint_url TEXT,                              -- API endpoint
  update_frequency VARCHAR(50),                   -- Update frequency
  last_updated TIMESTAMP WITH TIME ZONE,          -- Last update time
  is_active BOOLEAN DEFAULT true,                 -- Whether active
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create Views (only if not exists)
-- =====================================================

-- City Overview View
CREATE OR REPLACE VIEW city_overview AS
SELECT 
  c.*,
  cc_accommodation.monthly_estimate_usd as accommodation_cost,
  cc_food.monthly_estimate_usd as food_cost,
  cc_transport.monthly_estimate_usd as transport_cost,
  cc_coworking.monthly_estimate_usd as coworking_cost,
  nv.visa_name as nomad_visa_name,
  nv.duration_months as nomad_visa_duration,
  nv.cost_usd as nomad_visa_cost
FROM cities c
LEFT JOIN city_costs cc_accommodation ON c.id = cc_accommodation.city_id AND cc_accommodation.cost_type = 'accommodation'
LEFT JOIN city_costs cc_food ON c.id = cc_food.city_id AND cc_food.cost_type = 'food'
LEFT JOIN city_costs cc_transport ON c.id = cc_transport.city_id AND cc_transport.cost_type = 'transport'
LEFT JOIN city_costs cc_coworking ON c.id = cc_coworking.city_id AND cc_coworking.cost_type = 'coworking'
LEFT JOIN nomad_visas nv ON c.country = nv.country AND nv.is_active = true
WHERE c.is_active = true;

-- Plan Details View
CREATE OR REPLACE VIEW plan_details AS
SELECT 
  tp.*,
  pl.sequence_order,
  pl.arrive_date,
  pl.depart_date,
  pl.duration_days,
  pl.estimated_cost_usd,
  pl.visa_required,
  pl.visa_type,
  pl.visa_cost_usd,
  c.name as city_name,
  c.country as city_country,
  c.latitude,
  c.longitude
FROM travel_plans tp
LEFT JOIN plan_legs pl ON tp.id = pl.plan_id
LEFT JOIN cities c ON pl.city_id = c.id
ORDER BY tp.id, pl.sequence_order;

-- =====================================================
-- Create Functions and Triggers (only if not exists)
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update timestamp triggers (drop first if exists)
DROP TRIGGER IF EXISTS update_nomad_visas_updated_at ON nomad_visas;
CREATE TRIGGER update_nomad_visas_updated_at BEFORE UPDATE ON nomad_visas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_plans_updated_at ON travel_plans;
CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON travel_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_nomad_visa_applications_updated_at ON user_nomad_visa_applications;
CREATE TRIGGER update_user_nomad_visa_applications_updated_at BEFORE UPDATE ON user_nomad_visa_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Create Indexes (only if not exists)
-- =====================================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities (country);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities (slug);
CREATE INDEX IF NOT EXISTS idx_cities_cost ON cities (cost_min_usd, cost_max_usd);
CREATE INDEX IF NOT EXISTS idx_cities_nomad_score ON cities (nomad_score);

CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans (user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans (status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_public ON travel_plans (is_public);

CREATE INDEX IF NOT EXISTS idx_plan_legs_plan_id ON plan_legs (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_legs_sequence ON plan_legs (plan_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan_id ON plan_days (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_days_leg_id ON plan_days (leg_id);

CREATE INDEX IF NOT EXISTS idx_plan_items_day_id ON plan_items (day_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_category ON plan_items (category);

CREATE INDEX IF NOT EXISTS idx_visa_applications_user_id ON user_nomad_visa_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_visa_applications_status ON user_nomad_visa_applications (application_status);

CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources (source_type);
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources (is_active);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cities_cost_nomad_score ON cities (cost_min_usd, nomad_score) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nomad_visas_country_active ON nomad_visas (country, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_status ON travel_plans (user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plan_legs_plan_sequence ON plan_legs (plan_id, sequence_order);

-- =====================================================
-- Enable RLS and Create Policies (safe)
-- =====================================================

-- Enable RLS
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nomad_visa_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can insert own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can update own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can delete own travel plans" ON travel_plans;

-- Users can only access their own data
CREATE POLICY "Users can view own travel plans" ON travel_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own travel plans" ON travel_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own travel plans" ON travel_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own travel plans" ON travel_plans FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
DROP POLICY IF EXISTS "Users can view own plan legs" ON plan_legs;
DROP POLICY IF EXISTS "Users can insert own plan legs" ON plan_legs;
DROP POLICY IF EXISTS "Users can update own plan legs" ON plan_legs;
DROP POLICY IF EXISTS "Users can delete own plan legs" ON plan_legs;

CREATE POLICY "Users can view own plan legs" ON plan_legs FOR SELECT USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_legs.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own plan legs" ON plan_legs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_legs.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own plan legs" ON plan_legs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_legs.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own plan legs" ON plan_legs FOR DELETE USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_legs.plan_id AND user_id = auth.uid())
);

-- Public data can be accessed anonymously
DROP POLICY IF EXISTS "Anyone can view nomad visas" ON nomad_visas;
DROP POLICY IF EXISTS "Anyone can view cities" ON cities;
DROP POLICY IF EXISTS "Anyone can view city costs" ON city_costs;
DROP POLICY IF EXISTS "Anyone can view public travel plans" ON travel_plans;

CREATE POLICY "Anyone can view nomad visas" ON nomad_visas FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view cities" ON cities FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view city costs" ON city_costs FOR SELECT USING (true);
CREATE POLICY "Anyone can view public travel plans" ON travel_plans FOR SELECT USING (is_public = true);

-- =====================================================
-- Insert Sample Data (only if tables are empty)
-- =====================================================

-- Insert digital nomad visa data (only if not exists)
INSERT INTO nomad_visas (country, country_name, visa_name, visa_type, duration_months, cost_usd, income_requirement_usd, application_time_days, requirements, benefits, tax_implications, renewal_possible, max_renewals) 
SELECT * FROM (VALUES
('EST', 'Estonia', 'Digital Nomad Visa', 'digital_nomad', 12, 100, 3500, 30, 'Remote work contract, health insurance, accommodation proof', 'Schengen area access, can renew once', 'Non-tax resident', true, 1),
('PRT', 'Portugal', 'D7 Visa (Digital Nomad)', 'digital_nomad', 12, 83, 760, 60, 'Passive income proof, health insurance, accommodation', 'Schengen access, can renew, 5-year path to residency', 'NHR tax benefits available', true, 4),
('DEU', 'Germany', 'Freelancer Visa', 'freelancer', 12, 75, 2500, 45, 'Freelance work proof, health insurance, German address', 'EU freedom of movement, can renew, path to residency', 'German tax resident', true, 4),
('ESP', 'Spain', 'Non-Lucrative Visa', 'digital_nomad', 12, 80, 2500, 30, 'Financial means proof, health insurance, accommodation', 'Schengen access, can renew, path to residency', 'Beckham Law tax benefits', true, 4),
('THA', 'Thailand', 'Long Term Resident Visa', 'digital_nomad', 60, 2000, 80000, 90, 'High income proof, health insurance, background check', 'Long-term stay, can renew, path to permanent residency', 'Non-tax resident', true, 1),
('MEX', 'Mexico', 'Temporary Resident Visa', 'digital_nomad', 12, 36, 2500, 15, 'Financial means proof, health insurance', 'Can renew, path to permanent residency', 'Non-tax resident', true, 3),
('CZE', 'Czech Republic', 'Freelancer Visa', 'freelancer', 12, 50, 1500, 30, 'Freelance work proof, health insurance, accommodation', 'EU access, can renew', 'Czech tax resident', true, 4),
('HUN', 'Hungary', 'White Card', 'digital_nomad', 12, 60, 2000, 30, 'Remote work proof, health insurance, accommodation', 'Schengen access, can renew', 'Hungarian tax resident', true, 4)
) AS v(country, country_name, visa_name, visa_type, duration_months, cost_usd, income_requirement_usd, application_time_days, requirements, benefits, tax_implications, renewal_possible, max_renewals)
WHERE NOT EXISTS (SELECT 1 FROM nomad_visas WHERE nomad_visas.country = v.country AND nomad_visas.visa_name = v.visa_name);

-- Insert city data (only if not exists)
INSERT INTO cities (slug, name, country, country_name, latitude, longitude, timezone, population, language, currency, climate_tag, safety_score, wifi_speed_mbps, cost_min_usd, cost_max_usd, nomad_score, community_score, coffee_score, coworking_score) 
SELECT * FROM (VALUES
('tallinn', 'Tallinn', 'EST', 'Estonia', 59.4370, 24.7536, 'Europe/Tallinn', 437000, 'Estonian, English', 'EUR', 'temperate', 8.5, 85.2, 1200, 2000, 8.2, 7.8, 8.0, 8.5),
('lisbon', 'Lisbon', 'PRT', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon', 547000, 'Portuguese, English', 'EUR', 'mediterranean', 8.0, 65.8, 1000, 1800, 8.5, 8.2, 9.0, 8.0),
('berlin', 'Berlin', 'DEU', 'Germany', 52.5200, 13.4050, 'Europe/Berlin', 3670000, 'German, English', 'EUR', 'temperate', 7.5, 78.5, 1500, 2500, 8.8, 9.0, 8.5, 9.2),
('madrid', 'Madrid', 'ESP', 'Spain', 40.4168, -3.7038, 'Europe/Madrid', 3220000, 'Spanish, English', 'EUR', 'mediterranean', 8.2, 72.3, 1200, 2200, 8.0, 7.5, 8.8, 7.8),
('bangkok', 'Bangkok', 'THA', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok', 10539000, 'Thai, English', 'THB', 'tropical', 7.0, 45.2, 800, 1500, 7.5, 6.8, 7.2, 6.5),
('mexico-city', 'Mexico City', 'MEX', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City', 9200000, 'Spanish, English', 'MXN', 'subtropical', 6.5, 38.7, 600, 1200, 7.0, 6.5, 7.8, 6.2),
('prague', 'Prague', 'CZE', 'Czech Republic', 50.0755, 14.4378, 'Europe/Prague', 1300000, 'Czech, English', 'CZK', 'temperate', 8.8, 68.9, 1000, 1800, 8.0, 7.2, 8.5, 7.8),
('budapest', 'Budapest', 'HUN', 'Hungary', 47.4979, 19.0402, 'Europe/Budapest', 1750000, 'Hungarian, English', 'HUF', 'temperate', 8.0, 62.4, 800, 1500, 7.8, 6.8, 8.2, 7.5)
) AS v(slug, name, country, country_name, latitude, longitude, timezone, population, language, currency, climate_tag, safety_score, wifi_speed_mbps, cost_min_usd, cost_max_usd, nomad_score, community_score, coffee_score, coworking_score)
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE cities.slug = v.slug);

-- Insert data source information (only if not exists)
INSERT INTO data_sources (source_name, source_type, endpoint_url, update_frequency, last_updated, is_active) 
SELECT * FROM (VALUES
('Numbeo', 'api', 'https://www.numbeo.com/api/', 'monthly', '2024-09-01', true),
('NomadList', 'api', 'https://nomadlist.com/api/', 'weekly', '2024-09-01', true),
('Exchange Rates API', 'api', 'https://api.exchangerate-api.com/', 'daily', '2024-09-01', true),
('Google Places API', 'api', 'https://maps.googleapis.com/maps/api/', 'real-time', '2024-09-01', true),
('Visa Information', 'manual', NULL, 'monthly', '2024-09-01', true)
) AS v(source_name, source_type, endpoint_url, update_frequency, last_updated, is_active)
WHERE NOT EXISTS (SELECT 1 FROM data_sources WHERE data_sources.source_name = v.source_name);

-- =====================================================
-- Verification Query
-- =====================================================

-- Show created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'nomad_visas', 'cities', 'city_costs', 'travel_plans', 
    'plan_legs', 'plan_days', 'plan_items', 'user_preferences',
    'user_nomad_visa_applications', 'data_sources'
  )
ORDER BY tablename;
