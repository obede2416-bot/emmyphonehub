import { Link } from 'react-router-dom';
import { GitCompare, X, Check, Star } from 'lucide-react';
import { useCompare } from '@/lib/compare';
import { formatPrice, discountPercent } from '@/lib/utils';
import { StarRating } from '@/components/StarRating';

export function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="container-app section-padding py-20 text-center">
        <GitCompare size={64} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold">No products to compare</h1>
        <p className="text-slate-500 mt-2">Add products to compare their specifications side by side.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    );
  }

  const specRows = [
    { label: 'Price', key: (p: any) => formatPrice(p.price) },
    { label: 'Old Price', key: (p: any) => p.compare_price ? formatPrice(p.compare_price) : '-' },
    { label: 'Discount', key: (p: any) => `${discountPercent(p.price, p.compare_price)}%` },
    { label: 'Brand', key: (p: any) => p.brand?.name ?? '-' },
    { label: 'RAM', key: (p: any) => p.ram ?? '-' },
    { label: 'Storage', key: (p: any) => p.storage ?? '-' },
    { label: 'Processor', key: (p: any) => p.processor ?? '-' },
    { label: 'Display Size', key: (p: any) => p.display_size ?? '-' },
    { label: 'Display Type', key: (p: any) => p.display_type ?? '-' },
    { label: 'Refresh Rate', key: (p: any) => p.refresh_rate ?? '-' },
    { label: 'Battery', key: (p: any) => p.battery ?? '-' },
    { label: 'Main Camera', key: (p: any) => p.main_camera ?? '-' },
    { label: 'Front Camera', key: (p: any) => p.front_camera ?? '-' },
    { label: 'OS', key: (p: any) => p.os ?? '-' },
    { label: '5G', key: (p: any) => p.is_5g ? <Check size={16} className="text-accent-500" /> : <X size={16} className="text-slate-300" /> },
    { label: 'Charging Speed', key: (p: any) => p.charging_speed ?? '-' },
    { label: 'Rating', key: (p: any) => <StarRating rating={p.rating_average} showNumber /> },
    { label: 'Reviews', key: (p: any) => p.rating_count },
    { label: 'Stock', key: (p: any) => p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock' },
  ];

  return (
    <div className="container-app section-padding py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Compare Products ({items.length})</h1>
        <button onClick={clear} className="btn-ghost btn-sm">Clear All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-950 p-3 text-left text-sm font-bold text-slate-500 w-32">Specification</th>
              {items.map((p) => (
                <th key={p.id} className="p-3 min-w-[200px]">
                  <div className="relative">
                    <button onClick={() => remove(p.id)} className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-secondary-500">
                      <X size={14} />
                    </button>
                    <Link to={`/product/${p.slug}`} className="block">
                      <div className="aspect-square overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 mb-2">
                        {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="text-sm font-semibold line-clamp-2">{p.name}</div>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specRows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-950 p-3 text-sm font-semibold text-slate-500">
                  {row.label}
                </td>
                {items.map((p) => (
                  <td key={p.id} className="p-3 text-sm text-center">
                    {row.key(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
