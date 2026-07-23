import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-app section-padding py-20 text-center">
        <Heart size={64} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold">Your wishlist is empty</h1>
        <p className="text-slate-500 mt-2">Save items you love and come back to them later.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-app section-padding py-6">
      <h1 className="font-display text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
