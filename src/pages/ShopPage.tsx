import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/api';
import type { Product, Category, Brand } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const brandSlug = searchParams.get('brand') ?? '';
  const sort = (searchParams.get('sort') as any) ?? 'newest';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const is5g = searchParams.get('is5g') === 'true';

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let categoryId: string | undefined;
    let brandId: string | undefined;
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) categoryId = cat.id;
    }
    if (brandSlug) {
      const brand = brands.find((b) => b.slug === brandSlug);
      if (brand) brandId = brand.id;
    }
    fetchProducts({
      search: search || undefined,
      category: categoryId,
      brand: brandId,
      minPrice,
      maxPrice,
      is5g,
      sort,
      limit: 100,
    })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, categorySlug, brandSlug, sort, minPrice, maxPrice, is5g, categories, brands]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categorySlug) count++;
    if (brandSlug) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (is5g) count++;
    return count;
  }, [categorySlug, brandSlug, minPrice, maxPrice, is5g]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', null)}
            className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm', !categorySlug ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm', categorySlug === cat.slug ? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Brand</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => updateParam('brand', null)}
            className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm', !brandSlug ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateParam('brand', b.slug)}
              className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm', brandSlug === b.slug ? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" defaultValue={minPrice} onBlur={(e) => updateParam('minPrice', e.target.value)} className="input py-2 text-sm" />
          <span className="text-slate-400">-</span>
          <input type="number" placeholder="Max" defaultValue={maxPrice} onBlur={(e) => updateParam('maxPrice', e.target.value)} className="input py-2 text-sm" />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Features</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={is5g} onChange={(e) => updateParam('is5g', e.target.checked ? 'true' : null)} className="h-4 w-4 rounded accent-primary-600" />
          <span className="text-sm">5G Only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={() => setSearchParams({})} className="btn-outline w-full btn-sm">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="container-app section-padding py-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {search ? `Results for "${search}"` : categorySlug ? categorySlug : brandSlug ? brandSlug : 'All Products'}
        </h1>
        <p className="text-sm text-slate-500">{loading ? 'Loading...' : `${products.length} products found`}</p>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 card p-5">
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <button onClick={() => setShowFilters(true)} className="btn-outline btn-sm lg:hidden">
              <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden sm:block">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-lg font-semibold text-slate-500">No products found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white dark:bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={24} /></button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
}
