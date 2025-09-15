-- =====================================================
-- 众包生活成本数据表
-- =====================================================

-- 创建众包成本数据表
CREATE TABLE IF NOT EXISTS crowdsourced_cost_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  accommodation DECIMAL(10,2) NOT NULL,
  food DECIMAL(10,2) NOT NULL,
  transport DECIMAL(10,2) NOT NULL,
  coworking DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_nationality VARCHAR(3), -- 用户国籍
  stay_duration VARCHAR(50), -- 居住时长
  accommodation_type VARCHAR(50), -- 住宿类型
  lifestyle_level VARCHAR(20) DEFAULT 'medium', -- 生活方式等级
  notes TEXT, -- 备注
  is_verified BOOLEAN DEFAULT false, -- 是否已验证
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_accommodation CHECK (accommodation >= 0),
  CONSTRAINT valid_food CHECK (food >= 0),
  CONSTRAINT valid_transport CHECK (transport >= 0),
  CONSTRAINT valid_coworking CHECK (coworking >= 0),
  CONSTRAINT valid_total CHECK (total >= 0),
  CONSTRAINT valid_lifestyle_level CHECK (lifestyle_level IN ('budget', 'medium', 'luxury'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_crowdsourced_cost_data_city_country 
ON crowdsourced_cost_data(city, country);

CREATE INDEX IF NOT EXISTS idx_crowdsourced_cost_data_verified 
ON crowdsourced_cost_data(is_verified);

CREATE INDEX IF NOT EXISTS idx_crowdsourced_cost_data_created_at 
ON crowdsourced_cost_data(created_at);

-- 创建视图：聚合的众包成本数据
CREATE OR REPLACE VIEW aggregated_cost_data AS
SELECT 
  city,
  country,
  COUNT(*) as data_points,
  AVG(accommodation) as avg_accommodation,
  MIN(accommodation) as min_accommodation,
  MAX(accommodation) as max_accommodation,
  STDDEV(accommodation) as stddev_accommodation,
  AVG(food) as avg_food,
  MIN(food) as min_food,
  MAX(food) as max_food,
  STDDEV(food) as stddev_food,
  AVG(transport) as avg_transport,
  MIN(transport) as min_transport,
  MAX(transport) as max_transport,
  STDDEV(transport) as stddev_transport,
  AVG(coworking) as avg_coworking,
  MIN(coworking) as min_coworking,
  MAX(coworking) as max_coworking,
  STDDEV(coworking) as stddev_coworking,
  AVG(total) as avg_total,
  MIN(total) as min_total,
  MAX(total) as max_total,
  STDDEV(total) as stddev_total,
  -- 计算可信度
  CASE 
    WHEN COUNT(*) >= 10 THEN 0.9
    WHEN COUNT(*) >= 5 THEN 0.7
    WHEN COUNT(*) >= 3 THEN 0.5
    ELSE 0.3
  END as confidence_score,
  MAX(created_at) as last_updated
FROM crowdsourced_cost_data
WHERE is_verified = true
GROUP BY city, country;

-- 创建触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_crowdsourced_cost_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crowdsourced_cost_data_updated_at
  BEFORE UPDATE ON crowdsourced_cost_data
  FOR EACH ROW
  EXECUTE FUNCTION update_crowdsourced_cost_data_updated_at();

-- 插入示例数据
INSERT INTO crowdsourced_cost_data (
  city, country, accommodation, food, transport, coworking, total,
  user_nationality, stay_duration, accommodation_type, lifestyle_level, notes, is_verified
) VALUES
-- Bangkok, Thailand
('Bangkok', 'Thailand', 600, 300, 80, 150, 1130, 'US', '3 months', 'apartment', 'medium', 'Great value for money', true),
('Bangkok', 'Thailand', 800, 400, 100, 200, 1500, 'GB', '6 months', 'apartment', 'medium', 'Slightly more expensive area', true),
('Bangkok', 'Thailand', 400, 200, 60, 100, 760, 'DE', '2 months', 'hostel', 'budget', 'Budget-friendly options available', true),

-- Lisbon, Portugal
('Lisbon', 'Portugal', 900, 400, 60, 180, 1540, 'US', '4 months', 'apartment', 'medium', 'Beautiful city, good infrastructure', true),
('Lisbon', 'Portugal', 1200, 500, 80, 250, 2030, 'CA', '6 months', 'apartment', 'luxury', 'Premium location', true),
('Lisbon', 'Portugal', 700, 350, 50, 150, 1250, 'AU', '3 months', 'apartment', 'medium', 'Good balance of cost and quality', true),

-- Berlin, Germany
('Berlin', 'Germany', 1000, 450, 80, 200, 1730, 'US', '6 months', 'apartment', 'medium', 'Great startup scene', true),
('Berlin', 'Germany', 800, 350, 60, 150, 1360, 'GB', '4 months', 'apartment', 'medium', 'Affordable for Europe', true),
('Berlin', 'Germany', 1200, 600, 100, 300, 2200, 'CA', '12 months', 'apartment', 'luxury', 'Premium lifestyle', true),

-- Chiang Mai, Thailand
('Chiang Mai', 'Thailand', 400, 250, 50, 120, 820, 'US', '6 months', 'apartment', 'budget', 'Very affordable', true),
('Chiang Mai', 'Thailand', 600, 350, 70, 150, 1170, 'GB', '3 months', 'apartment', 'medium', 'Good value', true),
('Chiang Mai', 'Thailand', 300, 200, 40, 100, 640, 'DE', '2 months', 'hostel', 'budget', 'Ultra budget friendly', true),

-- Mexico City, Mexico
('Mexico City', 'Mexico', 700, 350, 60, 150, 1260, 'US', '4 months', 'apartment', 'medium', 'Great food scene', true),
('Mexico City', 'Mexico', 500, 250, 40, 120, 910, 'CA', '3 months', 'apartment', 'budget', 'Affordable and vibrant', true),
('Mexico City', 'Mexico', 900, 450, 80, 200, 1630, 'AU', '6 months', 'apartment', 'medium', 'Good infrastructure', true);

-- 创建RLS策略
ALTER TABLE crowdsourced_cost_data ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取已验证的数据
CREATE POLICY "Allow read access to verified data" ON crowdsourced_cost_data
  FOR SELECT USING (is_verified = true);

-- 允许认证用户插入数据
CREATE POLICY "Allow authenticated users to insert data" ON crowdsourced_cost_data
  FOR INSERT WITH CHECK (true);

-- 允许用户更新自己的数据
CREATE POLICY "Allow users to update own data" ON crowdsourced_cost_data
  FOR UPDATE USING (auth.uid() = user_id);

-- 允许管理员验证数据
CREATE POLICY "Allow admins to verify data" ON crowdsourced_cost_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
