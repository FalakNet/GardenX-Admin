-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'New',
  store_credit DECIMAL(10, 2) DEFAULT 0,
  rewards_earned DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  type VARCHAR(50) DEFAULT 'Online',
  cashback_earned DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rewards_transactions table
CREATE TABLE IF NOT EXISTS rewards_transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'earned' or 'redeemed'
  balance_after DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
