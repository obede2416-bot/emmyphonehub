import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, GitCompare, Share2, ShoppingCart, Truck, ShieldCheck, RefreshCw,
  ChevronLeft, Minus, Plus, Star, Check,
} from 'lucide-react';
import { fetchProductBySlug, fetchProductImages, fetchRelatedProducts, fetchReviews } from '@/lib/api';
import { addRecentlyViewed, getRecentlyViewedProducts } from '@/lib/recently-viewed';
import type { Product, ProductImage, Review } from '@/lib/types';
import { StarRating } from '@/components/StarRating';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCompare } from '@/lib/compare';
import { useAuth } from '@/lib/auth';
import { cn, formatPrice, discountPercent, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { has: hasWish, toggle: toggleWish } = useWishlist();
  const { has: hasCompare, toggle: toggleCompare } = useCompare();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews'>('specs');
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then(async (p) => {
        if (!p) return;
        setProduct(p);
        addRecentlyViewed(p.id);
        setSelectedColor(p.colors?.[0] ?? null);
        const [imgs, rel, rev, rv] = await Promise.all([
          fetchProductImages(p.id),
          fetchRelatedProducts(p.id, p.category_id, p.brand_id),
          fetchReviews(p.id),
          getRecentlyViewedProducts(),
        ]);
        setImages(imgs as ProductImage[]);
        setRelated(rel);
        setReviews(rev);
        setRecentlyViewed(rv.filter((r) => r.id !== p.id).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-app section-padding py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-32 w-full rounded" />
            <div className="skeleton h-12 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app section-padding py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compare_price);
  const allImages = [
    ...(product.thumbnail_url ? [{ id: 'thumb', url: product.thumbnail_url, alt_text: product.name }] : []),
    ...images,
  ];

  const handleAddCart = async () => {
    await addItem(product, quantity, selectedColor, product.storage ?? undefined);
    toast.success(`${product.name} added to cart`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleReview = async () => {
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title,
        body: newReview.body,
      });
      toast.success('Review submitted!');
      setNewReview({ rating: 5, title: '', body: '' });
      const rev = await fetchReviews(product.id);
      setReviews(rev);
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    }
  };

  const specs = [
    { label: 'Brand', value: product.brand?.name },
    { label: 'RAM', value: product.ram },
    { label: 'Storage', value: product.storage },
    { label: 'Processor', value: product.processor },
    { label: 'Display Size', value: product.display_size },
    { label: 'Display Type', value: product.display_type },
    { label: 'Refresh Rate', value: product.refresh_rate },
    { label: 'Battery', value: product.battery },
    { label: 'Main Camera', value: product.main_camera },
    { label: 'Front Camera', value: product.front_camera },
    { label: 'Operating System', value: product.os },
    { label: 'Connectivity', value: product.connectivity },
    { label: 'Charging Speed', value: product.charging_speed },
    { label: '5G Support', value: product.is_5g ? 'Yes' : 'No' },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Weight', value: product.weight },
  ].filter((s) => s.value);

  return (
    <div className="container-app section-padding py-6">
      <button onClick={() => window.history.back()} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
            <div className="aspect-square bg-slate-50 dark:bg-slate-800">
              {allImages[activeImage] && (
                <img src={allImages[activeImage].url} alt={allImages[activeImage].alt_text ?? product.name} className="h-full w-full object-cover" />
              )}
            </div>
          </motion.div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn('flex-shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2', activeImage === i ? 'border-primary-600' : 'border-transparent')}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold uppercase text-primary-600">{product.brand?.name}</span>
            {product.is_new && <span className="badge bg-accent-500 text-white">New</span>}
            {product.is_5g && <span className="badge bg-slate-800 text-white">5G</span>}
          </div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating_average} showNumber />
            <span className="text-sm text-slate-500">({product.rating_count} reviews)</span>
            <span className="text-sm text-slate-500">|</span>
            <span className="text-sm text-slate-500">{product.sold_count} sold</span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatPrice(product.compare_price)}</span>
                <span className="badge bg-secondary-500 text-white">-{discount}%</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.stock_quantity > 0 ? (
              <span className="flex items-center gap-1 text-accent-600 font-semibold">
                <Check size={16} /> In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="text-secondary-600 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Quick specs */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: 'RAM', value: product.ram },
              { label: 'Storage', value: product.storage },
              { label: 'Battery', value: product.battery },
              { label: 'Display', value: product.display_size },
              { label: 'Camera', value: product.main_camera },
              { label: 'Processor', value: product.processor },
            ].filter((s) => s.value).map((s, i) => (
              <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 text-center">
                <div className="text-xs text-slate-500">{s.label}</div>
                <div className="text-sm font-semibold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-4">
              <h4 className="label">Color: {selectedColor}</h4>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'rounded-xl border-2 px-3 py-1.5 text-sm font-medium',
                      selectedColor === color ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30' : 'border-slate-200 dark:border-slate-700',
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-slate-500 hover:text-primary-600">
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-3 text-slate-500 hover:text-primary-600">
                <Plus size={18} />
              </button>
            </div>
            <button onClick={handleAddCart} disabled={product.stock_quantity === 0} className="btn-primary flex-1">
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { toggleWish(product); toast.success(hasWish(product.id) ? 'Removed from wishlist' : 'Added to wishlist'); }}
              className={cn('btn-outline flex-1', hasWish(product.id) && 'text-secondary-500 border-secondary-300')}
            >
              <Heart size={18} className={hasWish(product.id) ? 'fill-secondary-500' : ''} /> Wishlist
            </button>
            <button
              onClick={() => { toggleCompare(product); toast.success(hasCompare(product.id) ? 'Removed from compare' : 'Added to compare'); }}
              className={cn('btn-outline flex-1', hasCompare(product.id) && 'text-primary-600 border-primary-300')}
            >
              <GitCompare size={18} /> Compare
            </button>
            <button onClick={handleShare} className="btn-outline">
              <Share2 size={18} />
            </button>
          </div>

          {/* Trust */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            {[
              { icon: Truck, text: 'Free Shipping' },
              { icon: ShieldCheck, text: '2-Year Warranty' },
              { icon: RefreshCw, text: '30-Day Returns' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <t.icon size={20} className="text-primary-600" />
                <span className="text-xs text-slate-600 dark:text-slate-400">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
          {(['specs', 'description', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors',
                activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'specs' && (
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {specs.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2 text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description ?? product.short_description}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {/* Write review */}
              <div className="card p-4 mb-6">
                <h4 className="font-bold mb-3">Write a Review</h4>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setNewReview((p) => ({ ...p, rating: r }))}>
                      <Star size={24} className={r <= newReview.rating ? 'text-secondary-400 fill-secondary-400' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Review title"
                  value={newReview.title}
                  onChange={(e) => setNewReview((p) => ({ ...p, title: e.target.value }))}
                  className="input mb-2"
                />
                <textarea
                  placeholder="Share your experience..."
                  value={newReview.body}
                  onChange={(e) => setNewReview((p) => ({ ...p, body: e.target.value }))}
                  rows={3}
                  className="input mb-3"
                />
                <button onClick={handleReview} className="btn-primary btn-sm">Submit Review</button>
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={rev.rating} />
                        <span className="text-xs text-slate-400">{formatDate(rev.created_at)}</span>
                      </div>
                      {rev.title && <h5 className="font-semibold">{rev.title}</h5>}
                      {rev.body && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{rev.body}</p>}
                      {rev.is_verified_purchase && (
                        <span className="badge bg-accent-100 text-accent-700 mt-2">
                          <Check size={12} /> Verified Purchase
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {related.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {recentlyViewed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
