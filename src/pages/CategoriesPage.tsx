import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchProducts } from '@/lib/api';
import type { Category, Product } from '@/lib/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategories().then(async (cats) => {
      setCategories(cats);
      const all = await fetchProducts({ limit: 200 });
      const c: Record<string, number> = {};
      cats.forEach((cat) => {
        c[cat.id] = all.filter((p) => p.category_id === cat.id).length;
      });
      setCounts(c);
    });
  }, []);

  return (
    <div className="container-app section-padding py-6">
      <h1 className="font-display text-2xl font-bold mb-6">All Categories</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/shop?category=${cat.slug}`} className="card card-hover p-5 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 text-3xl">
                {cat.icon || '📱'}
              </div>
              <div className="mt-2 font-semibold">{cat.name}</div>
              <div className="text-xs text-slate-500">{counts[cat.id] ?? 0} products</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
