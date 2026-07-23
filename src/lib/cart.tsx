import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';
import type { Product, CartItem } from './types';

interface CartLine {
  product: Product;
  quantity: number;
  color: string | null;
  storage_variant: string | null;
  cartItemId?: string;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, color?: string | null, storage?: string | null) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, color?: string | null, storage?: string | null) => Promise<void>;
  removeItem: (productId: string, color?: string | null, storage?: string | null) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_KEY = 'phonehub-cart';

interface GuestLine {
  productId: string;
  quantity: number;
  color: string | null;
  storage_variant: string | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [guestCart, setGuestCart] = useState<GuestLine[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      loadUserCart(user.id);
    } else {
      loadGuestCart();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(guestCart));
      loadGuestCart();
    }
  }, [guestCart, user]);

  async function loadUserCart(userId: string) {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    if (data) {
      setLines(
        data.map((item) => ({
          product: item.product as Product,
          quantity: item.quantity,
          color: item.color,
          storage_variant: item.storage_variant,
          cartItemId: item.id,
        })),
      );
    }
  }

  function loadGuestCart() {
    if (guestCart.length === 0) {
      setLines([]);
      return;
    }
    const ids = guestCart.map((g) => g.productId);
    supabase
      .from('products')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        if (!data) return;
        const productMap = new Map(data.map((p) => [p.id, p]));
        setLines(
          guestCart
            .map((g) => {
              const product = productMap.get(g.productId);
              if (!product) return null;
              return {
                product,
                quantity: g.quantity,
                color: g.color,
                storage_variant: g.storage_variant,
              };
            })
            .filter(Boolean) as CartLine[],
        );
      });
  }

  const addItem: CartContextValue['addItem'] = async (product, quantity = 1, color, storage) => {
    if (user) {
      const { data } = await supabase
        .from('cart_items')
        .upsert(
          {
            user_id: user.id,
            product_id: product.id,
            quantity,
            color: color ?? null,
            storage_variant: storage ?? null,
          },
          { onConflict: 'user_id,product_id,color,storage_variant' },
        )
        .select()
        .maybeSingle();
      if (data) await loadUserCart(user.id);
    } else {
      setGuestCart((prev) => {
        const idx = prev.findIndex(
          (g) => g.productId === product.id && g.color === (color ?? null) && g.storage_variant === (storage ?? null),
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
          return next;
        }
        return [...prev, { productId: product.id, quantity, color: color ?? null, storage_variant: storage ?? null }];
      });
    }
  };

  const updateQuantity: CartContextValue['updateQuantity'] = async (productId, quantity, color, storage) => {
    if (quantity < 1) return;
    if (user) {
      let query = supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', productId);
      if (color) query = query.eq('color', color);
      if (storage) query = query.eq('storage_variant', storage);
      await query;
      await loadUserCart(user.id);
    } else {
      setGuestCart((prev) =>
        prev.map((g) =>
          g.productId === productId && g.color === (color ?? null) && g.storage_variant === (storage ?? null)
            ? { ...g, quantity }
            : g,
        ),
      );
    }
  };

  const removeItem: CartContextValue['removeItem'] = async (productId, color, storage) => {
    if (user) {
      let query = supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId);
      if (color) query = query.eq('color', color);
      if (storage) query = query.eq('storage_variant', storage);
      await query;
      await loadUserCart(user.id);
    } else {
      setGuestCart((prev) =>
        prev.filter(
          (g) => !(g.productId === productId && g.color === (color ?? null) && g.storage_variant === (storage ?? null)),
        ),
      );
    }
  };

  const clear = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      await loadUserCart(user.id);
    } else {
      setGuestCart([]);
    }
  };

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, count, subtotal, addItem, updateQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
