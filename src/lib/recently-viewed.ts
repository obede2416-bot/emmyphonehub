import type { Product } from './types';

const KEY = 'phonehub-recently-viewed';

export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRecentlyViewed(productId: string) {
  const existing = getRecentlyViewed();
  const filtered = existing.filter((id) => id !== productId);
  filtered.unshift(productId);
  localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 10)));
}

export function getRecentlyViewedProducts(): Promise<Product[]> {
  const ids = getRecentlyViewed();
  if (ids.length === 0) return Promise.resolve([]);
  return import('./supabase').then(({ supabase }) =>
    supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*)')
      .in('id', ids)
      .is('is_active', true)
      .then(({ data }) => {
        if (!data) return [];
        const map = new Map(data.map((p) => [p.id, p]));
        return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
      }),
  );
}
