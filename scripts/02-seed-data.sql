-- Seed products
INSERT INTO products (name, description, category, price, unit, stock_quantity, image_url) VALUES
('Organic Kale', 'Fresh organic kale from our garden', 'Vegetables', 15.99, 'kg', 50, '/placeholder.svg?height=200&width=200'),
('Heirloom Tomatoes', 'Colorful heirloom tomatoes', 'Vegetables', 18.99, 'kg', 40, '/placeholder.svg?height=200&width=200'),
('Rainbow Carrots', 'Colorful organic carrots', 'Vegetables', 12.99, 'kg', 60, '/placeholder.svg?height=200&width=200'),
('Fresh Basil', 'Aromatic fresh basil', 'Vegetables', 10.99, 'bunch', 30, '/placeholder.svg?height=200&width=200'),
('Bell Peppers', 'Colorful bell peppers', 'Vegetables', 14.99, 'each', 45, '/placeholder.svg?height=200&width=200'),
('Butterhead Lettuce', 'Crisp butterhead lettuce', 'Vegetables', 11.99, 'head', 35, '/placeholder.svg?height=200&width=200'),
('Cherry Tomatoes', 'Sweet cherry tomatoes', 'Vegetables', 14.99, '250g', 55, '/placeholder.svg?height=200&width=200'),
('Purple Potatoes', 'Unique purple potatoes', 'Vegetables', 16.99, 'kg', 40, '/placeholder.svg?height=200&width=200')
ON CONFLICT (id) DO NOTHING;

-- Seed customers
INSERT INTO customers (customer_id, name, email, phone, status, store_credit, rewards_earned) VALUES
('CUST-001', 'Ahmed Al Mansouri', 'ahmed@example.com', '+971 50 123 4567', 'VIP', 124.58, 124.58),
('CUST-002', 'Fatima Al Hashimi', 'fatima@example.com', '+971 55 987 6543', 'Regular', 87.65, 87.65),
('CUST-003', 'Mohammed Al Qasimi', 'mohammed@example.com', '+971 52 456 7890', 'VIP', 234.53, 234.53),
('CUST-004', 'Aisha Al Zaabi', 'aisha@example.com', '+971 54 321 0987', 'New', 43.20, 43.20),
('CUST-005', 'Omar Al Suwaidi', 'omar@example.com', '+971 56 789 0123', 'Regular', 108.73, 108.73),
('CUST-006', 'Layla Al Nuaimi', 'layla@example.com', '+971 50 234 5678', 'New', 56.78, 56.78),
('CUST-007', 'Khalid Al Mazrouei', 'khalid@example.com', '+971 55 876 5432', 'VIP', 153.26, 153.26)
ON CONFLICT (customer_id) DO NOTHING;

-- Seed orders
DO $$
DECLARE
  customer_id_1 INTEGER;
  customer_id_2 INTEGER;
  customer_id_3 INTEGER;
  customer_id_4 INTEGER;
  order_id_1 INTEGER;
  order_id_2 INTEGER;
  order_id_3 INTEGER;
  order_id_4 INTEGER;
BEGIN
  SELECT id INTO customer_id_1 FROM customers WHERE customer_id = 'CUST-001' LIMIT 1;
  SELECT id INTO customer_id_2 FROM customers WHERE customer_id = 'CUST-002' LIMIT 1;
  SELECT id INTO customer_id_3 FROM customers WHERE customer_id = 'CUST-003' LIMIT 1;
  SELECT id INTO customer_id_4 FROM customers WHERE customer_id = 'CUST-004' LIMIT 1;
  
  -- Insert orders
  INSERT INTO orders (order_id, customer_id, total_amount, tax_amount, status, type, cashback_earned)
  VALUES ('GH-2023-1234', customer_id_1, 462.99, 22.05, 'Delivered', 'Online', 46.30)
  RETURNING id INTO order_id_1;
  
  INSERT INTO orders (order_id, customer_id, total_amount, tax_amount, status, type, cashback_earned)
  VALUES ('GH-2023-1233', customer_id_2, 289.50, 13.79, 'Processing', 'Online', 28.95)
  RETURNING id INTO order_id_2;
  
  INSERT INTO orders (order_id, customer_id, total_amount, tax_amount, status, type, cashback_earned)
  VALUES ('GH-2023-1232', customer_id_3, 166.25, 7.92, 'Shipped', 'Online', 16.63)
  RETURNING id INTO order_id_3;
  
  INSERT INTO orders (order_id, customer_id, total_amount, tax_amount, status, type, cashback_earned)
  VALUES ('GH-2023-1231', customer_id_4, 341.75, 16.27, 'Pending', 'Online', 34.18)
  RETURNING id INTO order_id_4;
  
  -- Insert order items (simplified)
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
  VALUES 
    (order_id_1, 1, 5, 15.99, 79.95),
    (order_id_1, 2, 3, 18.99, 56.97),
    (order_id_2, 3, 4, 12.99, 51.96),
    (order_id_2, 4, 2, 10.99, 21.98),
    (order_id_3, 5, 3, 14.99, 44.97),
    (order_id_3, 6, 1, 11.99, 11.99),
    (order_id_4, 7, 5, 14.99, 74.95),
    (order_id_4, 8, 2, 16.99, 33.98);
    
  -- Insert rewards transactions
  INSERT INTO rewards_transactions (customer_id, order_id, amount, type, balance_after)
  VALUES
    (customer_id_1, order_id_1, 46.30, 'earned', 124.58),
    (customer_id_2, order_id_2, 28.95, 'earned', 87.65),
    (customer_id_3, order_id_3, 16.63, 'earned', 234.53),
    (customer_id_4, order_id_4, 34.18, 'earned', 43.20);
END $$;
