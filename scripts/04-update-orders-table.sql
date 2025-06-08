-- Add store_credit_used column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_credit_used DECIMAL(10, 2) DEFAULT 0;
