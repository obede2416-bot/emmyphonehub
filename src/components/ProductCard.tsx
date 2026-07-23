import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, GitCompare, Eye, ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn, formatPrice, discountPercent } from '@/lib/utils';
import { StarRating } from './StarRating';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCompare } from '@/lib/compare';
import toast from 'react-hot-toast';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { has: hasWish, toggle: toggleWish } = useWishlist();
  const { has: hasCompare, toggle: toggleCompare } = useCompare();

  const discount = discountPercent(product.price, product.compare_price);
  const inWishlist = hasWish(product.id);
  const inCompare = hasCompare(product.id);

  const handleAddCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product, 1, product.colors?.[0] ?? null, product.storage ?? undefined);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product, 1, product.colors?.[0] ?? null, product.storage ?? undefined);
    window.location.href = '/cart';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="card card-hover group relative flex flex-col overflow-hidden"
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ShoppingCart size={48} />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge bg-secondary-500 text-white">-{discount}%</span>
          )}
          {product.is_new && <span className="badge bg-accent-500 text-white">New</span>}
          {product.is_bestseller && <span className="badge bg-primary-600 text-white">Bestseller</span>}
          {product.is_5g && <span className="badge bg-slate-800 text-white">5G</span>}
        </div>
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-slate-900">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {product.brand?.name ?? 'Generic'}
          </span>
          <StarRating rating={product.rating_average} showNumber />
        </div>

        <Link to={`/product/${product.slug}`} className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600">
          {product.name}
        </Link>

        <div className="mb-2 flex flex-wrap gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          {product.ram && <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{product.ram} RAM</span>}
          {product.storage && <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{product.storage}</span>}
          {product.battery && <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{product.battery}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</div>
            {product.compare_price && product.compare_price > product.price && (
              <div className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-1.5">
          <button onClick={handleAddCart} disabled={product.stock_quantity === 0} className="btn-primary btn-sm flex-1">
            <ShoppingCart size={15} /> Add
          </button>
          <button
            onClick={() => {
              toggleWish(product);
              toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
            }}
            className={cn(
              'btn btn-sm border border-slate-200 dark:border-slate-700',
              inWishlist ? 'text-secondary-500' : 'text-slate-500',
            )}
            aria-label="Wishlist"
          >
            <Heart size={16} className={inWishlist ? 'fill-secondary-500' : ''} />
          </button>
          <button
            onClick={() => {
              toggleCompare(product);
              toast.success(inCompare ? 'Removed from compare' : 'Added to compare');
            }}
            className={cn(
              'btn btn-sm border border-slate-200 dark:border-slate-700',
              inCompare ? 'text-primary-600' : 'text-slate-500',
            )}
            aria-label="Compare"
          >
            <GitCompare size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={product.stock_quantity === 0}
        className="absolute inset-x-3 bottom-0 translate-y-full bg-secondary-500 py-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Zap size={15} className="mr-1 inline" /> Buy Now
      </button>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-6 w-1/2 rounded" />
        <div className="skeleton h-8 w-full rounded" />
      </div>
    </div>
  );
}
