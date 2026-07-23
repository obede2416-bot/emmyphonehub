import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';
import type { Product } from './types';

interface WishlistContextValue {
  items: Product[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const GUEST_KEY = 'phonehub-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [guestIds, setGuestIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      supabase
        .from('wishlist_items')
        .select('product:products(*)')
        .eq('user_id', user.id)
        .then(({ data }) => {
          setItems((data?.map((w: any) => w.product as Product) ?? []).filter(Boolean));
        });
    } else {
      localStorage.setItem(GUEST_KEY, JSON.stringify(guestIds));
      if (guestIds.length === 0) {
        setItems([]);
        return;
      }
      supabase
        .from('products')
        .select('*')
        .in('id', guestIds)
        .then(({ data }) => setItems((data as Product[]) ?? []));
    }
  }, [user, guestIds]);

  const has = (productId: string) => items.some((p) => p.id === productId);

  const toggle = async (product: Product) => {
    if (user) {
      if (has(product.id)) {
        await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
        setItems((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        setItems((prev) => [...prev, product]);
      }
    } else {
      if (guestIds.includes(product.id)) {
        setGuestIds((prev) => prev.filter((id) => id !== product.id));
        setItems((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        setGuestIds((prev) => [...prev, product.id]);
        setItems((prev) => [...prev, product]);
      }
    }
  };

  const remove = async (productId: string) => {
    if (user) {
      await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', productId);
    } else {
      setGuestIds((prev) => prev.filter((id) => id !== productId));
    }
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ items, count: items.length, has, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
