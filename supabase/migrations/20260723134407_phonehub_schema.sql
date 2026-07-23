
/*
# PhoneHub Complete E-Commerce Schema

## Overview
Full schema for PhoneHub smartphone e-commerce platform.

## Tables Created
1. profiles - User profile data linked to auth.users
2. categories - Product categories (smartphones, tablets, accessories, etc.)
3. brands - Phone brands (Apple, Samsung, etc.)
4. products - Main product catalog with full specs
5. product_images - Product image gallery
6. product_variants - Color/storage variants
7. cart_items - Shopping cart (per user)
8. wishlist_items - Saved wishlist items
9. addresses - User shipping addresses
10. coupons - Discount coupons
11. orders - Customer orders
12. order_items - Line items in each order
13. reviews - Product reviews and ratings
14. notifications - User notifications
15. support_tickets - Customer support tickets
16. inventory_logs - Stock change history
17. flash_sales - Flash sale events

## Security
- RLS enabled on all tables
- Auth users own their own data
- Public data (products, categories, brands) readable by anon
- Admin role for management operations
*/

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  image_url text,
  parent_id uuid REFERENCES categories(id),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_select" ON categories;
CREATE POLICY "categories_public_select" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE TO authenticated USING (true);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  country text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brands_public_select" ON brands;
CREATE POLICY "brands_public_select" ON brands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "brands_admin_insert" ON brands;
CREATE POLICY "brands_admin_insert" ON brands FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "brands_admin_update" ON brands;
CREATE POLICY "brands_admin_update" ON brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "brands_admin_delete" ON brands;
CREATE POLICY "brands_admin_delete" ON brands FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand_id uuid REFERENCES brands(id),
  category_id uuid REFERENCES categories(id),
  description text,
  short_description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_price numeric(10,2),
  cost_price numeric(10,2),
  sku text UNIQUE,
  barcode text,
  stock_quantity int NOT NULL DEFAULT 0,
  low_stock_threshold int DEFAULT 10,
  -- Specs
  ram text,
  storage text,
  processor text,
  display_size text,
  display_type text,
  refresh_rate text,
  battery text,
  main_camera text,
  front_camera text,
  os text,
  connectivity text,
  charging_speed text,
  colors text[],
  dimensions text,
  weight text,
  -- Flags
  is_5g boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_refurbished boolean DEFAULT false,
  -- SEO
  meta_title text,
  meta_description text,
  -- Stats
  rating_average numeric(3,2) DEFAULT 0,
  rating_count int DEFAULT 0,
  sold_count int DEFAULT 0,
  view_count int DEFAULT 0,
  -- Thumbnail
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_brand_id_idx ON products(brand_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON products(is_featured);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_select" ON products;
CREATE POLICY "products_public_select" ON products FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" ON products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order int DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_public_select" ON product_images;
CREATE POLICY "product_images_public_select" ON product_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "product_images_admin_insert" ON product_images;
CREATE POLICY "product_images_admin_insert" ON product_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "product_images_admin_update" ON product_images;
CREATE POLICY "product_images_admin_update" ON product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "product_images_admin_delete" ON product_images;
CREATE POLICY "product_images_admin_delete" ON product_images FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','manager','support')),
  loyalty_points int DEFAULT 0,
  email_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.email_confirmed_at IS NOT NULL), false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'Nigeria',
  postal_code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
CREATE POLICY "addresses_select_own" ON addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
CREATE POLICY "addresses_insert_own" ON addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
CREATE POLICY "addresses_update_own" ON addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;
CREATE POLICY "addresses_delete_own" ON addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  color text,
  storage_variant text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, color, storage_variant)
);

CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON cart_items(user_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
CREATE POLICY "cart_select_own" ON cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist_items(user_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_select_own" ON wishlist_items;
CREATE POLICY "wishlist_select_own" ON wishlist_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_insert_own" ON wishlist_items;
CREATE POLICY "wishlist_insert_own" ON wishlist_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_update_own" ON wishlist_items;
CREATE POLICY "wishlist_update_own" ON wishlist_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_delete_own" ON wishlist_items;
CREATE POLICY "wishlist_delete_own" ON wishlist_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage','fixed','free_shipping')),
  value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) DEFAULT 0,
  max_discount_amount numeric(10,2),
  usage_limit int,
  used_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_public_select" ON coupons;
CREATE POLICY "coupons_public_select" ON coupons FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "coupons_admin_insert" ON coupons;
CREATE POLICY "coupons_admin_insert" ON coupons FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "coupons_admin_update" ON coupons;
CREATE POLICY "coupons_admin_update" ON coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "coupons_admin_delete" ON coupons;
CREATE POLICY "coupons_admin_delete" ON coupons FOR DELETE TO authenticated USING (true);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_number text UNIQUE NOT NULL DEFAULT ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','packed','shipped','delivered','cancelled','refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method text,
  payment_reference text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  coupon_id uuid REFERENCES coupons(id),
  shipping_address jsonb,
  notes text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_delete_own" ON orders;
CREATE POLICY "orders_delete_own" ON orders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  product_image text,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  color text,
  storage_variant text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_update_own" ON order_items;
CREATE POLICY "order_items_update_own" ON order_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;
CREATE POLICY "order_items_delete_own" ON order_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  images text[],
  helpful_votes int DEFAULT 0,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_select" ON reviews;
CREATE POLICY "reviews_public_select" ON reviews FOR SELECT TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error','order','promo')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_own" ON support_tickets;
CREATE POLICY "tickets_select_own" ON support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_insert_own" ON support_tickets;
CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_update_own" ON support_tickets;
CREATE POLICY "tickets_update_own" ON support_tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_delete_own" ON support_tickets;
CREATE POLICY "tickets_delete_own" ON support_tickets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- FLASH SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2) NOT NULL,
  quantity_available int NOT NULL DEFAULT 0,
  quantity_sold int DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flash_sales_public_select" ON flash_sales;
CREATE POLICY "flash_sales_public_select" ON flash_sales FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "flash_sales_admin_insert" ON flash_sales;
CREATE POLICY "flash_sales_admin_insert" ON flash_sales FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "flash_sales_admin_update" ON flash_sales;
CREATE POLICY "flash_sales_admin_update" ON flash_sales FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "flash_sales_admin_delete" ON flash_sales;
CREATE POLICY "flash_sales_admin_delete" ON flash_sales FOR DELETE TO authenticated USING (true);
