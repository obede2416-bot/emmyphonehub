import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from './types';

interface CompareContextValue {
  items: Product[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);
const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const has = (productId: string) => items.some((p) => p.id === productId);

  const toggle = (product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const remove = (productId: string) => setItems((prev) => prev.filter((p) => p.id !== productId));
  const clear = () => setItems([]);

  return (
    <CompareContext.Provider value={{ items, count: items.length, has, toggle, remove, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
