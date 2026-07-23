import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { validateCoupon } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Coupon } from '@/lib/types';

export function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = coupon
    ? coupon.type === 'percentage'
      ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount_amount ?? Infinity)
      : coupon.type === 'fixed'
      ? Math.min(coupon.value, subtotal)
      : 0
    : 0;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const tax = subtotal * 0.075;
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const c = await validateCoupon(couponCode);
      if (!c) {
        toast.error('Invalid or expired coupon');
        return;
      }
      if (c.min_order_amount && subtotal < c.min_order_amount) {
        toast.error(`Minimum order of ${formatPrice(c.min_order_amount)} required`);
        return;
      }
      setCoupon(c);
      toast.success('Coupon applied!');
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout', { state: { couponCode: coupon?.code, discount } });
  };

  if (lines.length === 0) {
    return (
      <div className="container-app section-padding py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="text-slate-500 mt-2">Browse our latest smartphones and find your perfect match.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app section-padding py-6">
      <h1 className="font-display text-2xl font-bold mb-6">Shopping Cart ({lines.length})</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {lines.map((line) => (
            <div key={`${line.product.id}-${line.color}-${line.storage_variant}`} className="card p-3 flex gap-3">
              <Link to={`/product/${line.product.slug}`} className="flex-shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                  {line.product.thumbnail_url ? (
                    <img src={line.product.thumbnail_url} alt={line.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><ShoppingBag size={24} className="text-slate-300" /></div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${line.product.slug}`} className="font-semibold text-sm hover:text-primary-600 line-clamp-1">
                  {line.product.name}
                </Link>
                <div className="text-xs text-slate-500 mt-0.5">
                  {line.color && <span>{line.color}</span>}
                  {line.color && line.storage_variant && <span> · </span>}
                  {line.storage_variant && <span>{line.storage_variant}</span>}
                </div>
                <div className="mt-1 text-lg font-bold text-primary-600">{formatPrice(line.product.price)}</div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                    <button onClick={() => updateQuantity(line.product.id, line.quantity - 1, line.color, line.storage_variant)} className="p-1.5 text-slate-500 hover:text-primary-600">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.product.id, line.quantity + 1, line.color, line.storage_variant)} className="p-1.5 text-slate-500 hover:text-primary-600">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(line.product.id, line.color, line.storage_variant)} className="text-slate-400 hover:text-secondary-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500">Subtotal</div>
                <div className="font-bold">{formatPrice(line.product.price * line.quantity)}</div>
              </div>
            </div>
          ))}

          <button onClick={clear} className="text-sm text-slate-500 hover:text-secondary-500 flex items-center gap-1">
            <Trash2 size={14} /> Clear cart
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>

            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input pl-9 py-2.5 text-sm"
                  />
                </div>
                <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn-outline btn-sm">
                  Apply
                </button>
              </div>
              {coupon && (
                <div className="mt-2 text-xs text-accent-600 flex items-center justify-between">
                  <span>Coupon "{coupon.code}" applied</span>
                  <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-secondary-500">Remove</button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax (7.5%)</span>
                <span className="font-semibold">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full mt-5">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <Link to="/shop" className="btn-ghost w-full mt-2 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
