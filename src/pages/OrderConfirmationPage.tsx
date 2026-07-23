import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Home, Download } from 'lucide-react';
import { fetchOrderById } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOrderById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!order) return <div className="container-app section-padding py-20 text-center"><p>Order not found</p><Link to="/shop" className="btn-primary mt-4 inline-flex">Back to Shop</Link></div>;

  const steps = [
    { icon: CheckCircle2, label: 'Confirmed', done: true },
    { icon: Package, label: 'Processing', done: ['processing', 'packed', 'shipped', 'delivered'].includes(order.status) },
    { icon: Truck, label: 'Shipped', done: ['shipped', 'delivered'].includes(order.status) },
    { icon: Home, label: 'Delivered', done: order.status === 'delivered' },
  ];

  return (
    <div className="container-app section-padding py-8">
      <div className="text-center mb-8">
        <CheckCircle2 size={64} className="mx-auto text-accent-500" />
        <h1 className="font-display text-2xl font-bold mt-3">Order Confirmed!</h1>
        <p className="text-slate-500">Thank you for your purchase. Your order is being processed.</p>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-500">Order Number</div>
            <div className="text-lg font-bold">{order.order_number}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Order Date</div>
            <div className="font-semibold">{formatDate(order.created_at)}</div>
          </div>
        </div>

        {/* Tracking */}
        <div className="flex items-center justify-between mt-8 mb-4">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step.done ? 'bg-accent-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <step.icon size={20} />
              </div>
              <span className={`text-xs mt-1 ${step.done ? 'font-semibold text-accent-600' : 'text-slate-400'}`}>{step.label}</span>
              {i < steps.length - 1 && <div className={`hidden sm:block h-0.5 flex-1 mx-2 ${step.done ? 'bg-accent-500' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ position: 'absolute', right: '-50%', top: '20px', zIndex: -1 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-6">
        <h3 className="font-bold mb-3">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                {item.product_image && <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.product_name}</div>
                <div className="text-xs text-slate-500">Qty: {item.quantity}{item.color ? ` · ${item.color}` : ''}</div>
              </div>
              <div className="font-bold">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-bold mb-3">Shipping Address</h3>
          {order.shipping_address && (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <div className="font-semibold">{order.shipping_address.full_name}</div>
              <div>{order.shipping_address.address_line1}</div>
              {order.shipping_address.address_line2 && <div>{order.shipping_address.address_line2}</div>}
              <div>{order.shipping_address.city}, {order.shipping_address.state}</div>
              <div>{order.shipping_address.country}</div>
              <div>{order.shipping_address.phone}</div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between text-accent-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{formatPrice(order.shipping_amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatPrice(order.tax_amount)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Total</span><span className="text-primary-600">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Payment</span><span className="font-semibold capitalize">{order.payment_method}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span><span className="font-semibold capitalize text-accent-600">{order.payment_status}</span></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => window.print()} className="btn-outline flex-1"><Download size={18} /> Download Invoice</button>
        <Link to="/shop" className="btn-primary flex-1">Continue Shopping</Link>
      </div>
    </div>
  );
}
