-- Create customer_groups table
CREATE TABLE IF NOT EXISTS customer_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cashback_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  min_spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
  color VARCHAR(50) NOT NULL DEFAULT 'blue',
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table for various app settings
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL UNIQUE,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default customer groups
INSERT INTO customer_groups (id, name, cashback_rate, min_spend, color, benefits) VALUES
('new', 'New Customer', 5.00, 0, 'green', ARRAY['Welcome bonus', 'Basic support']),
('regular', 'Regular Customer', 10.00, 500, 'blue', ARRAY['Standard cashback', 'Priority support', 'Monthly offers']),
('vip', 'VIP Customer', 15.00, 2000, 'purple', ARRAY['Premium cashback', 'VIP support', 'Exclusive offers', 'Free delivery'])
ON CONFLICT (id) DO NOTHING;

-- Insert default payment settings
INSERT INTO settings (category, settings) VALUES
('payment', '{
  "cashback_enabled": true,
  "default_cashback_rate": 10,
  "max_cashback_per_transaction": 100,
  "cashback_expiry_days": 365,
  "auto_apply_cashback": true
}'),
('business', '{
  "store_name": "GardenX",
  "currency": "AED",
  "tax_rate": 5,
  "receipt_footer": "Thank you for shopping with GardenX!",
  "timezone": "Asia/Dubai"
}')
ON CONFLICT (category) DO NOTHING;

-- Add customer group reference to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_group_id VARCHAR(50) REFERENCES customer_groups(id) DEFAULT 'new';

-- Update existing customers to have a default group based on their current status
UPDATE customers 
SET customer_group_id = CASE 
  WHEN status = 'VIP' THEN 'vip'
  WHEN status = 'Regular' THEN 'regular'
  ELSE 'new'
END
WHERE customer_group_id IS NULL;
