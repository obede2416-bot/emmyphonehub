import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchUserOrders } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-primary-100 text-primary-700',
  processing: 'bg-primary-100 text-primary-700',
  packed: 'bg-primary-100 text-primary-700',
  shipped: 'bg-accent-100 text-accent-700',
  delivered: 'bg-accent-100 text-accent-700',
  cancelled: 'bg-secondary-100 text-secondary-700',
  refunded: 'bg-secondary-100 text-secondary-700',
};

export function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrders(user.id).then(setOrders).finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return <Navigate to="/login?redirect=/orders" replace />;

  return (
    <div className="container-app section-padding py-6">
      <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>

      {loadingOrders ? (
        [...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl mb-3" />)
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300" />
          <p className="text-lg font-semibold mt-3">No orders yet</p>
          <p className="text-slate-500 text-sm">Start shopping to see your orders here.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/order/${order.id}`} className="card card-hover p-4 block">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600">
                    <Package size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{order.order_number}</div>
                    <div className="text-xs text-slate-500">{formatDate(order.created_at)} · {order.items?.length ?? 0} items</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="font-bold">{formatPrice(order.total_amount)}</div>
                    <span className={`badge ${statusColors[order.status] ?? 'bg-slate-100'} capitalize`}>{order.status}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
