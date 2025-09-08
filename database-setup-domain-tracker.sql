-- Domain Tracker Database Setup
-- Complete domain investment tracking system with cost and profit calculations

-- 1. Domains table (main domain records)
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_name VARCHAR(255) UNIQUE NOT NULL,
  registrar VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(10, 2),              -- Initial purchase cost
  renewal_cost DECIMAL(10, 2),               -- Annual renewal cost (standard value)
  total_renewal_paid DECIMAL(10, 2) DEFAULT 0, -- Total historical renewal payments
  next_renewal_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'for_sale', 'sold', 'expired')),
  estimated_value DECIMAL(10, 2),
  tags TEXT[] DEFAULT '{}',
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Domain transactions table (detailed transaction records)
CREATE TABLE IF NOT EXISTS domain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('buy', 'renew', 'sell', 'transfer', 'fee')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Domain alerts table (reminder system)
CREATE TABLE IF NOT EXISTS domain_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('renewal', 'price', 'expiry')),
  trigger_days_before INTEGER,
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Domain settings table (user preferences)
CREATE TABLE IF NOT EXISTS domain_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  default_currency VARCHAR(3) DEFAULT 'USD',
  renewal_reminder_days INTEGER[] DEFAULT '{60, 30, 7, 1}',
  registrar_aliases JSONB DEFAULT '{}',
  custom_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_owner_user_id ON domains(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_next_renewal_date ON domains(next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_domains_registrar ON domains(registrar);
CREATE INDEX IF NOT EXISTS idx_domain_transactions_domain_id ON domain_transactions(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_transactions_type ON domain_transactions(type);
CREATE INDEX IF NOT EXISTS idx_domain_transactions_date ON domain_transactions(date);
CREATE INDEX IF NOT EXISTS idx_domain_alerts_domain_id ON domain_alerts(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_alerts_enabled ON domain_alerts(enabled);

-- Create functions for cost and profit calculations

-- Function to calculate total cost for a domain
CREATE OR REPLACE FUNCTION calculate_domain_total_cost(domain_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  total_cost DECIMAL(10, 2) := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_cost
  FROM domain_transactions
  WHERE domain_id = domain_uuid
    AND type IN ('buy', 'renew', 'fee');
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate ROI for a domain
CREATE OR REPLACE FUNCTION calculate_domain_roi(domain_uuid UUID)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  total_cost DECIMAL(10, 2);
  total_revenue DECIMAL(10, 2);
  roi DECIMAL(5, 2);
BEGIN
  -- Get total cost
  SELECT calculate_domain_total_cost(domain_uuid) INTO total_cost;
  
  -- Get total revenue from sales
  SELECT COALESCE(SUM(amount), 0)
  INTO total_revenue
  FROM domain_transactions
  WHERE domain_id = domain_uuid
    AND type = 'sell';
  
  -- Calculate ROI
  IF total_cost > 0 THEN
    roi := ((total_revenue - total_cost) / total_cost) * 100;
  ELSE
    roi := 0;
  END IF;
  
  RETURN roi;
END;
$$ LANGUAGE plpgsql;

-- Function to get domains expiring soon
CREATE OR REPLACE FUNCTION get_domains_expiring_soon(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  domain_id UUID,
  domain_name VARCHAR(255),
  next_renewal_date DATE,
  days_until_expiry INTEGER,
  renewal_cost DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.domain_name,
    d.next_renewal_date,
    (d.next_renewal_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    d.renewal_cost
  FROM domains d
  WHERE d.next_renewal_date IS NOT NULL
    AND d.next_renewal_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND d.status = 'active'
  ORDER BY d.next_renewal_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_settings_updated_at
  BEFORE UPDATE ON domain_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing users
INSERT INTO domain_settings (user_id, default_currency, renewal_reminder_days)
SELECT id, 'USD', '{60, 30, 7, 1}'
FROM users
WHERE id NOT IN (SELECT user_id FROM domain_settings)
ON CONFLICT (user_id) DO NOTHING;
