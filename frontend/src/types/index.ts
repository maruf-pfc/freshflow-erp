/**
 * FreshFlow ERP — Core Domain TypeScript Interfaces
 * Strictly mirrors Django backend data models and API response payloads.
 */

export type UserRole =
  | "ADMIN"
  | "WAREHOUSE_MANAGER"
  | "SALES_AGENT"
  | "RESTAURANT_CLIENT";

export type RestaurantTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type BatchStatus = "AVAILABLE" | "FLASH_SALE" | "EXPIRED" | "DEPLETED";

export type OrderStatus =
  | "PENDING"
  | "ALLOCATED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User & {
    restaurant_id?: number;
    tier?: RestaurantTier;
  };
}

export interface PerishableItem {
  id: number;
  name: string;
  category:
    | "DAIRY"
    | "MEAT_POULTRY"
    | "SEAFOOD"
    | "PRODUCE"
    | "FROZEN"
    | "BEVERAGES";
  required_temp_celsius: number;
  temp_tolerance_celsius: number;
  standard_shelf_life_days: number;
  unit_of_measure: string;
  created_at: string;
}

export interface StockBatch {
  id: number;
  batch_number: string;
  item: number;
  item_name?: string;
  item_category?: string;
  harvest_pack_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  purchase_cost: number;
  base_selling_price: number;
  status: BatchStatus;
  storage_bin: string;
  remaining_days?: number;
  effective_price?: number;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: number;
  business_name: string;
  trade_license_no: string;
  user: number;
  tier: RestaurantTier;
  total_spent_last_3_months: number;
  credit_limit: number;
  created_at: string;
}

export interface OrderItem {
  id?: number;
  item: number;
  item_name?: string;
  batch?: number;
  batch_number?: string;
  quantity_ordered: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  restaurant: number;
  restaurant_name?: string;
  status: OrderStatus;
  subtotal_amount: number;
  tier_discount_percent: number;
  discount_amount: number;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface WastageLog {
  id: number;
  batch: number;
  batch_number?: string;
  quantity_lost: number;
  financial_loss: number;
  reason:
    | "EXPIRED"
    | "COLD_CHAIN_BREACH"
    | "PHYSICAL_DAMAGE"
    | "QUALITY_REJECT";
  logged_by: number;
  created_at: string;
}

export interface DashboardKPIs {
  active_cold_batches: number;
  near_expiry_items: number;
  total_revenue: number;
  spoilage_loss: number;
}
