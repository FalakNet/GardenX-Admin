-- Create product denominations table
CREATE TABLE IF NOT EXISTS product_denominations (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add default denominations for existing products
INSERT INTO product_denominations (product_id, weight, unit, price, stock_quantity)
SELECT 
  id, 
  100, 
  'g', 
  price * 0.1, 
  FLOOR(stock_quantity * 0.2)::INTEGER
FROM products
WHERE category = 'Vegetables' OR category = 'Seeds';

INSERT INTO product_denominations (product_id, weight, unit, price, stock_quantity)
SELECT 
  id, 
  250, 
  'g', 
  price * 0.25, 
  FLOOR(stock_quantity * 0.3)::INTEGER
FROM products
WHERE category = 'Vegetables' OR category = 'Seeds';

INSERT INTO product_denominations (product_id, weight, unit, price, stock_quantity)
SELECT 
  id, 
  500, 
  'g', 
  price * 0.5, 
  FLOOR(stock_quantity * 0.3)::INTEGER
FROM products
WHERE category = 'Vegetables' OR category = 'Seeds';

INSERT INTO product_denominations (product_id, weight, unit, price, stock_quantity)
SELECT 
  id, 
  1000, 
  'g', 
  price, 
  FLOOR(stock_quantity * 0.2)::INTEGER
FROM products
WHERE category = 'Vegetables' OR category = 'Seeds';

-- Add column to order_items for denomination_id
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS denomination_id INTEGER REFERENCES product_denominations(id);
