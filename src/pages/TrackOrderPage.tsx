import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { fetchOrderById } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', orderNumber.toUpperCase())
        .maybeSingle();
      if (data) {
        setOrder(data as Order);
      } else {
        setOrder(null);
        toast.error('Order not found');
      }
    } catch {
      toast.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: Clock, label: 'Pending', status: 'pending' },
    { icon: Package, label: 'Processing', status: 'processing' },
    { icon: Truck, label: 'Shipped', status: 'shipped' },
    { icon: CheckCircle2, label: 'Delivered', status: 'delivered' },
  ];

  const currentStep = order ? steps.findIndex((s) => s.status === order.status) : -1;

  return (
    <div className="container-app section-padding py-8">
      <h1 className="font-display text-2xl font-bold mb-6 text-center">Track Your Order</h1>

      <div className="mx-auto max-w-md">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number (e.g. ORD-ABC12345)"
              className="input pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary">Track</button>
        </div>
      </div>

      {searched && order && (
        <div className="mx-auto max-w-2xl mt-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-500">Order Number</div>
                <div className="text-lg font-bold">{order.order_number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total</div>
                <div className="text-lg font-bold">{formatPrice(order.total_amount)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between my-8">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1 relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute top-5 left-1/2 h-0.5 w-full ${i < currentStep ? 'bg-accent-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${i <= currentStep ? 'bg-accent-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <step.icon size={20} />
                  </div>
                  <span className={`text-xs mt-1 ${i <= currentStep ? 'font-semibold text-accent-600' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            {order.tracking_number && (
              <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3 text-sm">
                <span className="text-slate-500">Tracking Number: </span>
                <span className="font-bold">{order.tracking_number}</span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800">
                    {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {order.status === 'cancelled' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 p-3 text-secondary-700">
                <XCircle size={20} /> This order has been cancelled.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
