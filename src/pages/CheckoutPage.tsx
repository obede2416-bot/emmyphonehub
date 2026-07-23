import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCard, Wallet, Building2, Smartphone, Check, Lock } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { fetchAddresses, createOrder } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Address } from '@/lib/types';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { couponCode?: string; discount?: number } | null;
  const couponCode = state?.couponCode;
  const discount = state?.discount ?? 0;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    if (lines.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses(user.id).then((data) => {
      setAddresses(data as Address[]);
      const def = (data as Address[]).find((a) => a.is_default);
      setSelectedAddress(def?.id ?? data[0]?.id ?? '');
    });
  }, [user, lines.length]);

  const shipping = deliveryMethod === 'express' ? 14.99 : subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.075;
  const total = subtotal - discount + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setPlacing(true);
    try {
      const addr = addresses.find((a) => a.id === selectedAddress);
      if (!addr) throw new Error('Invalid address');

      const order = await createOrder({
        user_id: user.id,
        subtotal,
        discount_amount: discount,
        shipping_amount: shipping,
        tax_amount: tax,
        total_amount: total,
        coupon_code: couponCode,
        payment_method: paymentMethod,
        shipping_address: {
          full_name: addr.full_name,
          phone: addr.phone,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2,
          city: addr.city,
          state: addr.state,
          country: addr.country,
          postal_code: addr.postal_code,
        },
        notes,
        items: lines.map((l) => ({
          product_id: l.product.id,
          product_name: l.product.name,
          product_image: l.product.thumbnail_url,
          quantity: l.quantity,
          price: l.product.price,
          color: l.color,
          storage_variant: l.storage_variant,
        })),
      });

      // Insert notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Order Placed Successfully',
        message: `Your order ${order.order_number} has been placed and is being processed.`,
        type: 'order',
        action_url: `/order/${order.id}`,
      });

      await clear();
      toast.success('Order placed successfully!');
      navigate(`/order/${order.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!user || lines.length === 0) return null;

  const paymentMethods = [
    { id: 'stripe', name: 'Stripe', desc: 'Credit / Debit Card', icon: CreditCard },
    { id: 'flutterwave', name: 'Flutterwave', desc: 'Card, Bank, USSD', icon: Wallet },
    { id: 'paystack', name: 'Paystack', desc: 'Card, Bank Transfer, Mobile Money', icon: Smartphone },
    { id: 'bank_transfer', name: 'Bank Transfer', desc: 'Direct bank transfer', icon: Building2 },
  ];

  return (
    <div className="container-app section-padding py-6">
      <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="card p-5">
            <h3 className="font-bold mb-3">Shipping Address</h3>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 mb-3">No addresses saved yet.</p>
                <Link to="/addresses" className="btn-primary btn-sm">Add Address</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-primary-600" />
                    <div className="text-sm">
                      <div className="font-semibold">{addr.full_name} <span className="text-slate-400 font-normal">· {addr.label}</span></div>
                      <div className="text-slate-500">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</div>
                      <div className="text-slate-500">{addr.city}, {addr.state}, {addr.country}</div>
                      <div className="text-slate-500">{addr.phone}</div>
                    </div>
                  </label>
                ))}
                <Link to="/addresses" className="text-sm text-primary-600 hover:underline">+ Add new address</Link>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="card p-5">
            <h3 className="font-bold mb-3">Delivery Method</h3>
            <div className="space-y-2">
              {[
                { id: 'standard', name: 'Standard Delivery', desc: '3-5 business days', price: subtotal > 50 ? 'Free' : '$5.99' },
                { id: 'express', name: 'Express Delivery', desc: '1-2 business days', price: '$14.99' },
              ].map((d) => (
                <label
                  key={d.id}
                  className={`flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer ${deliveryMethod === d.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="delivery" checked={deliveryMethod === d.id} onChange={() => setDeliveryMethod(d.id)} className="accent-primary-600" />
                    <div>
                      <div className="font-semibold text-sm">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.desc}</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{d.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Lock size={16} /> Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer ${paymentMethod === m.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-primary-600" />
                  <m.icon size={20} className="text-primary-600" />
                  <div>
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h3 className="font-bold mb-3">Order Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for delivery..."
              rows={3}
              className="input"
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {lines.map((l) => (
                <div key={`${l.product.id}-${l.color}`} className="flex gap-2 text-sm">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800">
                    {l.product.thumbnail_url && <img src={l.product.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{l.product.name}</div>
                    <div className="text-slate-500">Qty: {l.quantity}</div>
                  </div>
                  <div className="font-semibold">{formatPrice(l.product.price * l.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-accent-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Total</span><span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full mt-5">
              {placing ? 'Placing Order...' : <>Place Order <Check size={18} /></>}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
              <Lock size={12} /> Secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
