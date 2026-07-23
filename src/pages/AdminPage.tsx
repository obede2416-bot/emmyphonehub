import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings, TrendingUp,
  DollarSign, AlertTriangle, Star, Plus, Edit2, Trash2, X, Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  adminFetchStats, adminFetchAllProducts, adminFetchAllOrders,
  adminSaveProduct, adminDeleteProduct, adminUpdateOrderStatus,
  fetchCategories, fetchBrands,
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Product, Order, Category, Brand } from '@/lib/types';
import { formatPrice, formatDate, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

type Tab = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings';

export function AdminPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'manager')) {
      loadAll();
    }
  }, [user, profile]);

  function loadAll() {
    adminFetchStats().then(setStats);
    adminFetchAllProducts().then(setProducts);
    adminFetchAllOrders().then(setOrders);
    fetchCategories().then(setCategories);
    fetchBrands().then(setBrands);
    supabase.from('profiles').select('*').then(({ data }) => setCustomers(data ?? []));
  }

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;
  if (profile?.role !== 'admin' && profile?.role !== 'manager') {
    return (
      <div className="container-app section-padding py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500 mt-2">You don't have permission to access the admin dashboard.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back Home</Link>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as Tab, label: 'Products', icon: Package },
    { id: 'orders' as Tab, label: 'Orders', icon: ShoppingCart },
    { id: 'customers' as Tab, label: 'Customers', icon: Users },
    { id: 'coupons' as Tab, label: 'Coupons', icon: Tag },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container-app section-padding py-4">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-20 card p-3">
            <div className="px-3 py-2 mb-2">
              <div className="text-xs font-bold uppercase text-slate-400">Admin Panel</div>
              <div className="text-sm font-semibold">{profile?.full_name ?? 'Admin'}</div>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === item.id ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 glass border-t overflow-x-auto no-scrollbar">
          <div className="flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs whitespace-nowrap ${tab === item.id ? 'text-primary-600' : 'text-slate-500'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {tab === 'dashboard' && <Dashboard stats={stats} orders={orders} products={products} />}
          {tab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories}
              brands={brands}
              onEdit={(p: Product) => { setEditingProduct(p); setShowProductForm(true); }}
              onAdd={() => { setEditingProduct(null); setShowProductForm(true); }}
              onDelete={async (id: string) => {
                if (!confirm('Delete this product?')) return;
                await adminDeleteProduct(id);
                setProducts((prev) => prev.filter((p) => p.id !== id));
                toast.success('Product deleted');
              }}
              showForm={showProductForm}
              editing={editingProduct}
              onCloseForm={() => setShowProductForm(false)}
              onSave={async (data: any) => {
                await adminSaveProduct(data);
                loadAll();
                setShowProductForm(false);
                toast.success('Product saved');
              }}
            />
          )}
          {tab === 'orders' && <OrdersTab orders={orders} onUpdate={async (id: string, status: string) => {
            await adminUpdateOrderStatus(id, status);
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as any } : o)));
            toast.success('Order status updated');
          }} />}
          {tab === 'customers' && <CustomersTab customers={customers} />}
          {tab === 'coupons' && <CouponsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, orders, products }: { stats: any; orders: Order[]; products: Product[] }) {
  if (!stats) return <div className="skeleton h-96 rounded-2xl" />;

  const recentOrders = orders.slice(0, 5);
  const topProducts = [...products].sort((a, b) => b.sold_count - a.sold_count).slice(0, 5);

  // Sales chart data (last 7 days)
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === date.toDateString());
    return { name: date.toLocaleDateString('en', { weekday: 'short' }), sales: dayOrders.reduce((s, o) => s + o.total_amount, 0) };
  });

  const orderStatusData = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => ({
    name: status,
    value: orders.filter((o) => o.status === status).length,
  }));
  const colors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/20' },
          { label: 'Total Orders', value: formatNumber(stats.totalOrders), icon: ShoppingCart, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Products', value: formatNumber(stats.totalProducts), icon: Package, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20' },
          { label: 'Low Stock', value: formatNumber(stats.lowStock), icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Sales (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {orderStatusData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <h3 className="font-bold mb-3">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2">Order</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-2 font-semibold">{o.order_number}</td>
                  <td className="py-2 text-slate-500">{formatDate(o.created_at)}</td>
                  <td className="py-2 font-bold">{formatPrice(o.total_amount)}</td>
                  <td className="py-2"><span className="badge bg-primary-100 text-primary-700 capitalize">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top products */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Star size={18} className="text-secondary-500" /> Top Selling Products</h3>
        <div className="space-y-2">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-300 w-6">{i + 1}</span>
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800">
                {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                <div className="text-xs text-slate-500">{p.sold_count} sold</div>
              </div>
              <div className="font-bold">{formatPrice(p.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ products, categories, brands, onEdit, onAdd, onDelete, showForm, editing, onCloseForm, onSave }: any) {
  const [search, setSearch] = useState('');
  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
        <button onClick={onAdd} className="btn-primary btn-sm"><Plus size={16} /> Add Product</button>
      </div>

      <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4" />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-xs text-slate-500">
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: Product) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800 flex-shrink-0">
                        {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="font-semibold line-clamp-1">{p.name}</div>
                    </div>
                  </td>
                  <td className="p-3 font-bold">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={p.stock_quantity <= 10 ? 'text-secondary-600 font-semibold' : ''}>{p.stock_quantity}</span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${p.is_active ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(p)} className="text-slate-400 hover:text-primary-600 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(p.id)} className="text-slate-400 hover:text-secondary-500 p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ProductForm product={editing} categories={categories} brands={brands} onClose={onCloseForm} onSave={onSave} />}
    </div>
  );
}

function ProductForm({ product, categories, brands, onClose, onSave }: any) {
  const [form, setForm] = useState<any>(product ?? {
    name: '', slug: '', price: 0, compare_price: null, stock_quantity: 0,
    is_active: true, is_featured: false, is_new: true,
  });

  const handleSave = () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    const data = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Name *</label>
            <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price *</label>
              <input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">Compare Price</label>
              <input type="number" value={form.compare_price ?? ''} onChange={(e) => setForm({ ...form, compare_price: e.target.value ? Number(e.target.value) : null })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brand</label>
              <select value={form.brand_id ?? ''} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="input">
                <option value="">Select brand</option>
                {brands.map((b: Brand) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">Select category</option>
                {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" value={form.stock_quantity ?? 0} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">SKU</label>
              <input value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">RAM</label>
              <input value={form.ram ?? ''} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="input" placeholder="8GB" />
            </div>
            <div>
              <label className="label">Storage</label>
              <input value={form.storage ?? ''} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="input" placeholder="128GB" />
            </div>
            <div>
              <label className="label">Battery</label>
              <input value={form.battery ?? ''} onChange={(e) => setForm({ ...form, battery: e.target.value })} className="input" placeholder="5000mAh" />
            </div>
          </div>
          <div>
            <label className="label">Thumbnail URL</label>
            <input value={form.thumbnail_url ?? ''} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input" />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary-600" /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-primary-600" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="accent-primary-600" /> New</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_5g} onChange={(e) => setForm({ ...form, is_5g: e.target.checked })} className="accent-primary-600" /> 5G</label>
          </div>
          <button onClick={handleSave} className="btn-primary w-full"><Save size={18} /> Save Product</button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders, onUpdate }: { orders: Order[]; onUpdate: (id: string, status: string) => void }) {
  const statuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Orders ({orders.length})</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-xs text-slate-500">
                <th className="p-3">Order #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-semibold">{o.order_number}</td>
                  <td className="p-3 text-slate-500">{formatDate(o.created_at)}</td>
                  <td className="p-3 font-bold">{formatPrice(o.total_amount)}</td>
                  <td className="p-3"><span className="badge bg-slate-100 capitalize">{o.payment_status}</span></td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => onUpdate(o.id, e.target.value)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersTab({ customers }: { customers: any[] }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Customers ({customers.length})</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-xs text-slate-500">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Loyalty Points</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-semibold">{c.full_name || 'Unknown'}</td>
                  <td className="p-3"><span className="badge bg-primary-100 text-primary-700 capitalize">{c.role}</span></td>
                  <td className="p-3">{c.loyalty_points ?? 0}</td>
                  <td className="p-3 text-slate-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: 10, is_active: true });

  useEffect(() => {
    supabase.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCoupons(data ?? []));
  }, []);

  const handleSave = async () => {
    if (!form.code) { toast.error('Code is required'); return; }
    await supabase.from('coupons').insert({ ...form, code: form.code.toUpperCase() });
    setShowForm(false);
    setForm({ code: '', type: 'percentage', value: 10, is_active: true });
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data ?? []);
    toast.success('Coupon created');
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Coupons ({coupons.length})</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus size={16} /> Add Coupon</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">{c.code}</span>
              <span className={`badge ${c.is_active ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {c.type === 'percentage' ? `${c.value}% off` : c.type === 'fixed' ? `${formatPrice(c.value)} off` : 'Free shipping'}
            </div>
            <div className="text-xs text-slate-400 mt-1">Used: {c.used_count}/{c.usage_limit ?? '∞'}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">Add Coupon</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input" placeholder="SAVE20" />
              </div>
              <div>
                <label className="label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="input" />
              </div>
              <button onClick={handleSave} className="btn-primary w-full"><Save size={18} /> Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Settings</h1>
      <div className="card p-6">
        <h3 className="font-bold mb-3">Store Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Store Name</label>
            <input defaultValue="PhoneHub" className="input" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input"><option>USD ($)</option><option>NGN (₦)</option><option>EUR (€)</option></select>
          </div>
          <div>
            <label className="label">Tax Rate (%)</label>
            <input type="number" defaultValue="7.5" className="input" />
          </div>
          <button className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
