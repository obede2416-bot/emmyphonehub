import { useEffect, useState } from 'react';
import { Zap, Clock } from 'lucide-react';
import { fetchFlashSales, fetchProducts } from '@/lib/api';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import type { FlashSale, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export function DealsPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFlashSales(), fetchProducts({ limit: 20 })])
      .then(([fs, p]) => {
        setFlashSales(fs);
        setDeals(p.filter((prod) => prod.compare_price && prod.compare_price > prod.price));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-app section-padding py-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-secondary-500 to-secondary-600 p-6 text-white">
        <div className="flex items-center gap-2">
          <Zap size={28} className="fill-white" />
          <h1 className="font-display text-2xl font-bold">Hot Deals & Flash Sales</h1>
        </div>
        <p className="mt-1 text-white/80">Save big on top smartphones. Limited time only!</p>
      </div>

      {flashSales.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-secondary-500" /> Flash Sales
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {flashSales.map((fs) => (
              <a key={fs.id} href={`/product/${fs.product?.slug}`} className="card card-hover p-3">
                <div className="aspect-square overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                  {fs.product?.thumbnail_url && <img src={fs.product.thumbnail_url} alt={fs.product.name} className="h-full w-full object-cover" />}
                </div>
                <div className="mt-2 text-sm font-semibold line-clamp-1">{fs.product?.name}</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-secondary-600">{formatPrice(fs.sale_price)}</span>
                  <span className="text-xs text-slate-400 line-through">{formatPrice(fs.product?.price ?? 0)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-secondary-500" style={{ width: `${(fs.quantity_sold / (fs.quantity_sold + fs.quantity_available)) * 100}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{fs.quantity_available} left</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-display text-xl font-bold mb-4">All Deals</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : deals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500">No deals available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
