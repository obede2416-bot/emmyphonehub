export type Role = 'customer' | 'admin' | 'manager' | 'support';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
  loyalty_points: number;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  country: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  ram: string | null;
  storage: string | null;
  processor: string | null;
  display_size: string | null;
  display_type: string | null;
  refresh_rate: string | null;
  battery: string | null;
  main_camera: string | null;
  front_camera: string | null;
  os: string | null;
  connectivity: string | null;
  charging_speed: string | null;
  colors: string[] | null;
  dimensions: string | null;
  weight: string | null;
  is_5g: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  is_refurbished: boolean;
  meta_title: string | null;
  meta_description: string | null;
  rating_average: number;
  rating_count: number;
  sold_count: number;
  view_count: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  color: string | null;
  storage_variant: string | null;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  is_default: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_reference: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_code: string | null;
  shipping_address: AddressData | null;
  notes: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  color: string | null;
  storage_variant: string | null;
}

export interface AddressData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[] | null;
  helpful_votes: number;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promo';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface FlashSale {
  id: string;
  product_id: string;
  discount_percentage: number;
  sale_price: number;
  quantity_available: number;
  quantity_sold: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product?: Product;
}
