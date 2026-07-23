import { supabase } from './supabase';
import type { Product, Category, Brand, Review, Order, Coupon, FlashSale } from './types';

// ============ Products ============
export async function fetchProducts(opts?: {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  is5g?: boolean;
  limit?: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*)')
    .eq('is_active', true);

  if (opts?.category) query = query.eq('category_id', opts.category);
  if (opts?.brand) query = query.eq('brand_id', opts.brand);
  if (opts?.search) query = query.or(`name.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  if (opts?.minPrice !== undefined) query = query.gte('price', opts.minPrice);
  if (opts?.maxPrice !== undefined) query = query.lte('price', opts.maxPrice);
  if (opts?.is5g) query = query.eq('is_5g', true);
  if (opts?.featured) query = query.eq('is_featured', true);
  if (opts?.bestseller) query = query.eq('is_bestseller', true);
  if (opts?.isNew) query = query.eq('is_new', true);

  switch (opts?.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating_average', { ascending: false });
      break;
    case 'popular':
      query = query.order('sold_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchProductImages(productId: string) {
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function fetchRelatedProducts(productId: string, categoryId: string | null, brandId: string | null): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('is_active', true)
    .neq('id', productId)
    .limit(8);
  if (categoryId) query = query.eq('category_id', categoryId);
  else if (brandId) query = query.eq('brand_id', brandId);
  const { data } = await query;
  return (data as Product[]) ?? [];
}

// ============ Categories ============
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
  return data as Category | null;
}

// ============ Brands ============
export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('brands').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data as Brand[]) ?? [];
}

// ============ Reviews ============
export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  return (data as Review[]) ?? [];
}

export async function addReview(review: {
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert(review);
  if (error) throw error;
}

// ============ Orders ============
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data as Order[]) ?? [];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  return data as Order | null;
}

export async function createOrder(order: {
  user_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: string;
  shipping_address: any;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
    color: string | null;
    storage_variant: string | null;
  }>;
}): Promise<Order> {
  const { items, ...orderData } = order;
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({ ...item, order_id: orderRow.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return orderRow as Order;
}

// ============ Coupons ============
export async function validateCoupon(code: string): Promise<Coupon | null> {
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  return data as Coupon | null;
}

// ============ Flash Sales ============
export async function fetchFlashSales(): Promise<FlashSale[]> {
  const { data } = await supabase
    .from('flash_sales')
    .select('*, product:products(*, brand:brands(*))')
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: true });
  return (data as FlashSale[]) ?? [];
}

// ============ Addresses ============
export async function fetchAddresses(userId: string) {
  const { data } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false });
  return data ?? [];
}

export async function saveAddress(address: any) {
  if (address.id) {
    const { data, error } = await supabase.from('addresses').update(address).eq('id', address.id).select().maybeSingle();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('addresses').insert(address).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: string) {
  await supabase.from('addresses').delete().eq('id', id);
}

// ============ Notifications ============
export async function fetchNotifications(userId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

// ============ Support Tickets ============
export async function fetchTickets(userId: string) {
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createTicket(ticket: { user_id: string; subject: string; message: string; priority?: string }) {
  const { data, error } = await supabase.from('support_tickets').insert(ticket).select().maybeSingle();
  if (error) throw error;
  return data;
}

// ============ Admin ============
export async function adminFetchAllProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*)')
    .order('created_at', { ascending: false });
  return (data as Product[]) ?? [];
}

export async function adminSaveProduct(product: any) {
  if (product.id) {
    const { data, error } = await supabase.from('products').update(product).eq('id', product.id).select().maybeSingle();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('products').insert(product).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function adminFetchAllOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  return (data as Order[]) ?? [];
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  const update: any = { status, updated_at: new Date().toISOString() };
  if (status === 'shipped') update.shipped_at = new Date().toISOString();
  if (status === 'delivered') update.delivered_at = new Date().toISOString();
  const { error } = await supabase.from('orders').update(update).eq('id', orderId);
  if (error) throw error;
}

export async function adminFetchStats() {
  const [products, orders, reviews] = await Promise.all([
    supabase.from('products').select('id, price, stock_quantity, sold_count'),
    supabase.from('orders').select('total_amount, status, created_at'),
    supabase.from('reviews').select('id, rating'),
  ]);

  const totalRevenue = (orders.data ?? []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = (orders.data ?? []).length;
  const totalProducts = (products.data ?? []).length;
  const lowStock = (products.data ?? []).filter((p) => p.stock_quantity <= 10).length;
  const avgRating =
    (reviews.data ?? []).length > 0
      ? (reviews.data ?? []).reduce((sum, r) => sum + r.rating, 0) / (reviews.data ?? []).length
      : 0;

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStock,
    avgRating,
    orders: orders.data ?? [],
    products: products.data ?? [],
  };
}
