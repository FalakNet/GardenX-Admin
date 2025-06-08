export interface Product {
  id: number
  name: string
  description?: string
  category: string
  price: number
  unit: string
  stock_quantity: number
  image_url?: string
  denominations?: ProductDenomination[]
  created_at: string
  updated_at: string
}

export interface ProductDenomination {
  id?: number
  product_id?: number
  weight: number
  unit: string
  price: number
  stock_quantity: number
}

export interface Customer {
  id: number
  customer_id: string
  name: string
  email?: string
  phone?: string
  status: "New" | "Regular" | "VIP"
  store_credit: number
  rewards_earned: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  order_id: string
  customer_id?: number | null
  customer?: Customer
  total_amount: number
  tax_amount: number
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
  type: "Online" | "POS"
  cashback_earned: number
  store_credit_used?: number | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  total_price: number
  denomination_id?: number | null
  created_at: string
}

export interface RewardsTransaction {
  id: number
  customer_id: number
  order_id?: number
  amount: number
  type: "earned" | "redeemed"
  balance_after: number
  created_at: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  recentOrders: Order[]
}

// Payment related types
export type PaymentMethod = "cash" | "card" | "ziina"

export interface PaymentTransaction {
  id: string
  order_id: number
  method: PaymentMethod
  amount: number
  status: "pending" | "completed" | "failed" | "cancelled"
  created_at: string
}

export interface PaymentCompletionData {
  method: PaymentMethod
  amount: number
  amountReceived?: number
  transactionId?: string
}

// Type aliases for backward compatibility
export type OrderType = Order
export type OrderItemType = OrderItem
