-- =====================================================
-- Nomad Agent 数据库架构设计
-- 数字游民签证和城市数据表结构
-- =====================================================

-- 1. 数字游民签证表
CREATE TABLE nomad_visas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(3) NOT NULL,                    -- 国家代码 (ISO 3166-1 alpha-3)
  country_name VARCHAR(100) NOT NULL,             -- 国家名称
  visa_name VARCHAR(100) NOT NULL,                -- 签证名称
  visa_type VARCHAR(50) NOT NULL,                 -- 签证类型 (digital_nomad, freelancer, etc.)
  duration_months INTEGER NOT NULL,               -- 有效期（月）
  cost_usd DECIMAL(10,2) NOT NULL,                -- 申请费用 (USD)
  income_requirement_usd DECIMAL(10,2),           -- 收入要求 (USD/月)
  application_time_days INTEGER,                  -- 申请时间 (天)
  requirements TEXT,                              -- 申请要求
  benefits TEXT,                                  -- 签证福利
  tax_implications TEXT,                          -- 税务影响
  renewal_possible BOOLEAN DEFAULT false,         -- 是否可续签
  max_renewals INTEGER DEFAULT 0,                 -- 最大续签次数
  is_active BOOLEAN DEFAULT true,                 -- 是否有效
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT unique_country_visa UNIQUE (country, visa_name)
);

-- 2. 城市主数据表
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,              -- URL友好的标识符
  name VARCHAR(100) NOT NULL,                     -- 城市名称
  country VARCHAR(3) NOT NULL,                    -- 国家代码
  country_name VARCHAR(100) NOT NULL,             -- 国家名称
  latitude DECIMAL(10, 8),                        -- 纬度
  longitude DECIMAL(11, 8),                       -- 经度
  timezone VARCHAR(50),                           -- 时区
  population INTEGER,                             -- 人口
  language VARCHAR(100),                          -- 主要语言
  currency VARCHAR(3),                            -- 货币代码
  climate_tag VARCHAR(50),                        -- 气候标签 (tropical, temperate, etc.)
  safety_score DECIMAL(3,1),                      -- 安全评分 (1-10)
  wifi_speed_mbps DECIMAL(5,1),                   -- 平均网速 (Mbps)
  cost_min_usd INTEGER,                           -- 最低生活成本 (USD/月)
  cost_max_usd INTEGER,                           -- 最高生活成本 (USD/月)
  nomad_score DECIMAL(3,1),                       -- 数字游民评分 (1-10)
  community_score DECIMAL(3,1),                   -- 社区活跃度评分 (1-10)
  coffee_score DECIMAL(3,1),                      -- 咖啡文化评分 (1-10)
  coworking_score DECIMAL(3,1),                   -- 联合办公评分 (1-10)
  is_active BOOLEAN DEFAULT true,                 -- 是否有效
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_cities_country (country),
  INDEX idx_cities_slug (slug),
  INDEX idx_cities_cost (cost_min_usd, cost_max_usd),
  INDEX idx_cities_nomad_score (nomad_score)
);

-- 3. 城市生活成本详细表
CREATE TABLE city_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,                 -- 成本类型 (accommodation, food, transport, etc.)
  monthly_estimate_usd DECIMAL(10,2),             -- 月估算 (USD)
  daily_estimate_usd DECIMAL(10,2),               -- 日估算 (USD)
  source VARCHAR(100),                            -- 数据来源
  last_updated DATE,                              -- 最后更新日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT unique_city_cost_type UNIQUE (city_id, cost_type)
);

-- 4. 用户规划表
CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,                    -- 规划标题
  origin_country VARCHAR(3),                      -- 出发国家
  nationality VARCHAR(3),                         -- 用户国籍
  budget_usd INTEGER,                             -- 月预算 (USD)
  duration_months INTEGER,                        -- 计划时长 (月)
  start_date DATE,                                -- 开始日期
  end_date DATE,                                  -- 结束日期
  party_size INTEGER DEFAULT 1,                   -- 人数
  preferences JSONB,                              -- 用户偏好 (JSON)
  summary JSONB,                                  -- AI生成的总结 (JSON)
  status VARCHAR(50) DEFAULT 'draft',             -- 状态 (draft, active, completed)
  is_public BOOLEAN DEFAULT false,                -- 是否公开
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_travel_plans_user_id (user_id),
  INDEX idx_travel_plans_status (status),
  INDEX idx_travel_plans_public (is_public)
);

-- 5. 规划路线段表
CREATE TABLE plan_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,                -- 顺序
  city_id INTEGER REFERENCES cities(id),          -- 城市ID
  arrive_date DATE,                               -- 到达日期
  depart_date DATE,                               -- 离开日期
  duration_days INTEGER,                          -- 停留天数
  estimated_cost_usd DECIMAL(10,2),               -- 估算成本 (USD)
  visa_required BOOLEAN DEFAULT false,            -- 是否需要签证
  visa_type VARCHAR(100),                         -- 签证类型
  visa_cost_usd DECIMAL(10,2),                    -- 签证费用 (USD)
  notes TEXT,                                     -- 备注
  metadata JSONB,                                 -- 元数据 (JSON)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_plan_legs_plan_id (plan_id),
  INDEX idx_plan_legs_sequence (plan_id, sequence_order)
);

-- 6. 规划日程表
CREATE TABLE plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  leg_id UUID REFERENCES plan_legs(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,                     -- 第几天
  date DATE NOT NULL,                             -- 日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_plan_days_plan_id (plan_id),
  INDEX idx_plan_days_leg_id (leg_id)
);

-- 7. 规划日程项目表
CREATE TABLE plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES plan_days(id) ON DELETE CASCADE,
  time_slot VARCHAR(20),                          -- 时间段 (morning, afternoon, evening)
  place_name VARCHAR(200),                        -- 地点名称
  place_id VARCHAR(100),                          -- 外部POI ID
  latitude DECIMAL(10, 8),                        -- 纬度
  longitude DECIMAL(11, 8),                       -- 经度
  category VARCHAR(50),                           -- 类别 (cafe, coworking, museum, etc.)
  estimated_cost_usd DECIMAL(10,2),               -- 估算费用 (USD)
  source VARCHAR(50),                             -- 数据来源 (google_places, manual, model)
  metadata JSONB,                                 -- 元数据 (JSON)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_plan_items_day_id (day_id),
  INDEX idx_plan_items_category (category)
);

-- 8. 用户偏好表
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nationality VARCHAR(3),                         -- 国籍
  budget_usd INTEGER,                             -- 月预算 (USD)
  languages TEXT[],                               -- 语言能力
  interests TEXT[],                               -- 兴趣标签
  travel_style VARCHAR(50),                       -- 旅行风格
  accommodation_preference VARCHAR(50),           -- 住宿偏好
  food_preference VARCHAR(50),                    -- 饮食偏好
  climate_preference VARCHAR(50),                 -- 气候偏好
  visa_preference VARCHAR(50),                    -- 签证偏好
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 用户规划申请记录表
CREATE TABLE user_nomad_visa_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visa_id UUID REFERENCES nomad_visas(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES travel_plans(id) ON DELETE SET NULL,
  application_status VARCHAR(50) DEFAULT 'pending', -- 申请状态
  application_date DATE,                          -- 申请日期
  expected_approval_date DATE,                    -- 预期批准日期
  actual_approval_date DATE,                      -- 实际批准日期
  notes TEXT,                                     -- 备注
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_visa_applications_user_id (user_id),
  INDEX idx_visa_applications_status (application_status)
);

-- 10. 数据源表
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(100) NOT NULL,              -- 数据源名称
  source_type VARCHAR(50) NOT NULL,               -- 数据源类型 (api, manual, scraped)
  endpoint_url TEXT,                              -- API端点
  update_frequency VARCHAR(50),                   -- 更新频率
  last_updated TIMESTAMP WITH TIME ZONE,          -- 最后更新时间
  is_active BOOLEAN DEFAULT true,                 -- 是否活跃
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_data_sources_type (source_type),
  INDEX idx_data_sources_active (is_active)
);

-- =====================================================
-- 创建视图和函数
-- =====================================================

-- 城市综合信息视图
CREATE VIEW city_overview AS
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

-- 规划详情视图
CREATE VIEW plan_details AS
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
-- 创建触发器
-- =====================================================

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间戳触发器
CREATE TRIGGER update_nomad_visas_updated_at BEFORE UPDATE ON nomad_visas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON travel_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nomad_visa_applications_updated_at BEFORE UPDATE ON user_nomad_visa_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 创建RLS策略
-- =====================================================

-- 启用RLS
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nomad_visa_applications ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own travel plans" ON travel_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own travel plans" ON travel_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own travel plans" ON travel_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own travel plans" ON travel_plans FOR DELETE USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view own plan days" ON plan_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_days.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own plan days" ON plan_days FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_days.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own plan days" ON plan_days FOR UPDATE USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_days.plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own plan days" ON plan_days FOR DELETE USING (
  EXISTS (SELECT 1 FROM travel_plans WHERE id = plan_days.plan_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own plan items" ON plan_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM travel_plans tp 
          JOIN plan_legs pl ON tp.id = pl.plan_id 
          JOIN plan_days pd ON pl.id = pd.leg_id 
          WHERE pd.id = plan_items.day_id AND tp.user_id = auth.uid())
);
CREATE POLICY "Users can insert own plan items" ON plan_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM travel_plans tp 
          JOIN plan_legs pl ON tp.id = pl.plan_id 
          JOIN plan_days pd ON pl.id = pd.leg_id 
          WHERE pd.id = plan_items.day_id AND tp.user_id = auth.uid())
);
CREATE POLICY "Users can update own plan items" ON plan_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM travel_plans tp 
          JOIN plan_legs pl ON tp.id = pl.plan_id 
          JOIN plan_days pd ON pl.id = pd.leg_id 
          WHERE pd.id = plan_items.day_id AND tp.user_id = auth.uid())
);
CREATE POLICY "Users can delete own plan items" ON plan_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM travel_plans tp 
          JOIN plan_legs pl ON tp.id = pl.plan_id 
          JOIN plan_days pd ON pl.id = pd.leg_id 
          WHERE pd.id = plan_items.day_id AND tp.user_id = auth.uid())
);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own visa applications" ON user_nomad_visa_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visa applications" ON user_nomad_visa_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visa applications" ON user_nomad_visa_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visa applications" ON user_nomad_visa_applications FOR DELETE USING (auth.uid() = user_id);

-- 公开数据可以匿名访问
CREATE POLICY "Anyone can view nomad visas" ON nomad_visas FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view cities" ON cities FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view city costs" ON city_costs FOR SELECT USING (true);
CREATE POLICY "Anyone can view public travel plans" ON travel_plans FOR SELECT USING (is_public = true);

-- =====================================================
-- 插入示例数据
-- =====================================================

-- 插入数字游民签证数据
INSERT INTO nomad_visas (country, country_name, visa_name, visa_type, duration_months, cost_usd, income_requirement_usd, application_time_days, requirements, benefits, tax_implications, renewal_possible, max_renewals) VALUES
('EST', '爱沙尼亚', 'Digital Nomad Visa', 'digital_nomad', 12, 100, 3500, 30, 'Remote work contract, health insurance, accommodation proof', 'Schengen area access, can renew once', 'Non-tax resident', true, 1),
('PRT', '葡萄牙', 'D7 Visa (Digital Nomad)', 'digital_nomad', 12, 83, 760, 60, 'Passive income proof, health insurance, accommodation', 'Schengen access, can renew, 5-year path to residency', 'NHR tax benefits available', true, 4),
('DEU', '德国', 'Freelancer Visa', 'freelancer', 12, 75, 2500, 45, 'Freelance work proof, health insurance, German address', 'EU freedom of movement, can renew, path to residency', 'German tax resident', true, 4),
('ESP', '西班牙', 'Non-Lucrative Visa', 'digital_nomad', 12, 80, 2500, 30, 'Financial means proof, health insurance, accommodation', 'Schengen access, can renew, path to residency', 'Beckham Law tax benefits', true, 4),
('THA', '泰国', 'Long Term Resident Visa', 'digital_nomad', 60, 2000, 80000, 90, 'High income proof, health insurance, background check', 'Long-term stay, can renew, path to permanent residency', 'Non-tax resident', true, 1),
('MEX', '墨西哥', 'Temporary Resident Visa', 'digital_nomad', 12, 36, 2500, 15, 'Financial means proof, health insurance', 'Can renew, path to permanent residency', 'Non-tax resident', true, 3),
('CZE', '捷克', 'Freelancer Visa', 'freelancer', 12, 50, 1500, 30, 'Freelance work proof, health insurance, accommodation', 'EU access, can renew', 'Czech tax resident', true, 4),
('HUN', '匈牙利', 'White Card', 'digital_nomad', 12, 60, 2000, 30, 'Remote work proof, health insurance, accommodation', 'Schengen access, can renew', 'Hungarian tax resident', true, 4);

-- 插入城市数据
INSERT INTO cities (slug, name, country, country_name, latitude, longitude, timezone, population, language, currency, climate_tag, safety_score, wifi_speed_mbps, cost_min_usd, cost_max_usd, nomad_score, community_score, coffee_score, coworking_score) VALUES
('tallinn', '塔林', 'EST', '爱沙尼亚', 59.4370, 24.7536, 'Europe/Tallinn', 437000, 'Estonian, English', 'EUR', 'temperate', 8.5, 85.2, 1200, 2000, 8.2, 7.8, 8.0, 8.5),
('lisbon', '里斯本', 'PRT', '葡萄牙', 38.7223, -9.1393, 'Europe/Lisbon', 547000, 'Portuguese, English', 'EUR', 'mediterranean', 8.0, 65.8, 1000, 1800, 8.5, 8.2, 9.0, 8.0),
('berlin', '柏林', 'DEU', '德国', 52.5200, 13.4050, 'Europe/Berlin', 3670000, 'German, English', 'EUR', 'temperate', 7.5, 78.5, 1500, 2500, 8.8, 9.0, 8.5, 9.2),
('madrid', '马德里', 'ESP', '西班牙', 40.4168, -3.7038, 'Europe/Madrid', 3220000, 'Spanish, English', 'EUR', 'mediterranean', 8.2, 72.3, 1200, 2200, 8.0, 7.5, 8.8, 7.8),
('bangkok', '曼谷', 'THA', '泰国', 13.7563, 100.5018, 'Asia/Bangkok', 10539000, 'Thai, English', 'THB', 'tropical', 7.0, 45.2, 800, 1500, 7.5, 6.8, 7.2, 6.5),
('mexico-city', '墨西哥城', 'MEX', '墨西哥', 19.4326, -99.1332, 'America/Mexico_City', 9200000, 'Spanish, English', 'MXN', 'subtropical', 6.5, 38.7, 600, 1200, 7.0, 6.5, 7.8, 6.2),
('prague', '布拉格', 'CZE', '捷克', 50.0755, 14.4378, 'Europe/Prague', 1300000, 'Czech, English', 'CZK', 'temperate', 8.8, 68.9, 1000, 1800, 8.0, 7.2, 8.5, 7.8),
('budapest', '布达佩斯', 'HUN', '匈牙利', 47.4979, 19.0402, 'Europe/Budapest', 1750000, 'Hungarian, English', 'HUF', 'temperate', 8.0, 62.4, 800, 1500, 7.8, 6.8, 8.2, 7.5);

-- 插入城市成本数据
INSERT INTO city_costs (city_id, cost_type, monthly_estimate_usd, daily_estimate_usd, source, last_updated) VALUES
-- 塔林
(1, 'accommodation', 800, 27, 'Numbeo', '2024-09-01'),
(1, 'food', 400, 13, 'Numbeo', '2024-09-01'),
(1, 'transport', 100, 3, 'Numbeo', '2024-09-01'),
(1, 'coworking', 200, 7, 'NomadList', '2024-09-01'),
-- 里斯本
(2, 'accommodation', 700, 23, 'Numbeo', '2024-09-01'),
(2, 'food', 350, 12, 'Numbeo', '2024-09-01'),
(2, 'transport', 80, 3, 'Numbeo', '2024-09-01'),
(2, 'coworking', 150, 5, 'NomadList', '2024-09-01'),
-- 柏林
(3, 'accommodation', 1200, 40, 'Numbeo', '2024-09-01'),
(3, 'food', 500, 17, 'Numbeo', '2024-09-01'),
(3, 'transport', 120, 4, 'Numbeo', '2024-09-01'),
(3, 'coworking', 250, 8, 'NomadList', '2024-09-01'),
-- 马德里
(4, 'accommodation', 900, 30, 'Numbeo', '2024-09-01'),
(4, 'food', 400, 13, 'Numbeo', '2024-09-01'),
(4, 'transport', 100, 3, 'Numbeo', '2024-09-01'),
(4, 'coworking', 180, 6, 'NomadList', '2024-09-01'),
-- 曼谷
(5, 'accommodation', 500, 17, 'Numbeo', '2024-09-01'),
(5, 'food', 250, 8, 'Numbeo', '2024-09-01'),
(5, 'transport', 50, 2, 'Numbeo', '2024-09-01'),
(5, 'coworking', 100, 3, 'NomadList', '2024-09-01'),
-- 墨西哥城
(6, 'accommodation', 400, 13, 'Numbeo', '2024-09-01'),
(6, 'food', 200, 7, 'Numbeo', '2024-09-01'),
(6, 'transport', 40, 1, 'Numbeo', '2024-09-01'),
(6, 'coworking', 80, 3, 'NomadList', '2024-09-01'),
-- 布拉格
(7, 'accommodation', 600, 20, 'Numbeo', '2024-09-01'),
(7, 'food', 300, 10, 'Numbeo', '2024-09-01'),
(7, 'transport', 60, 2, 'Numbeo', '2024-09-01'),
(7, 'coworking', 120, 4, 'NomadList', '2024-09-01'),
-- 布达佩斯
(8, 'accommodation', 500, 17, 'Numbeo', '2024-09-01'),
(8, 'food', 250, 8, 'Numbeo', '2024-09-01'),
(8, 'transport', 50, 2, 'Numbeo', '2024-09-01'),
(8, 'coworking', 100, 3, 'NomadList', '2024-09-01');

-- 插入数据源信息
INSERT INTO data_sources (source_name, source_type, endpoint_url, update_frequency, last_updated, is_active) VALUES
('Numbeo', 'api', 'https://www.numbeo.com/api/', 'monthly', '2024-09-01', true),
('NomadList', 'api', 'https://nomadlist.com/api/', 'weekly', '2024-09-01', true),
('Exchange Rates API', 'api', 'https://api.exchangerate-api.com/', 'daily', '2024-09-01', true),
('Google Places API', 'api', 'https://maps.googleapis.com/maps/api/', 'real-time', '2024-09-01', true),
('Visa Information', 'manual', NULL, 'monthly', '2024-09-01', true);

-- =====================================================
-- 创建索引优化
-- =====================================================

-- 为常用查询创建复合索引
CREATE INDEX idx_cities_cost_nomad_score ON cities (cost_min_usd, nomad_score) WHERE is_active = true;
CREATE INDEX idx_nomad_visas_country_active ON nomad_visas (country, is_active) WHERE is_active = true;
CREATE INDEX idx_travel_plans_user_status ON travel_plans (user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX idx_plan_legs_plan_sequence ON plan_legs (plan_id, sequence_order);

-- =====================================================
-- 完成
-- =====================================================

-- 显示创建的表
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
