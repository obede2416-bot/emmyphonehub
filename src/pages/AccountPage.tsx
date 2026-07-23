import { Link, Navigate } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, Bell, LifeBuoy, Settings, LogOut, Heart, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';
import { Logo } from '@/components/Logo';
import toast from 'react-hot-toast';

export function AccountPage() {
  const { user, profile, signOut, loading } = useAuth();
  const { count: wishCount } = useWishlist();
  const { count: cartCount } = useCart();

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return <Navigate to="/login?redirect=/account" replace />;

  const links = [
    { icon: Package, label: 'My Orders', desc: 'Track and manage your orders', path: '/orders' },
    { icon: Heart, label: 'Wishlist', desc: `${wishCount} saved items`, path: '/wishlist' },
    { icon: MapPin, label: 'Addresses', desc: 'Manage shipping addresses', path: '/addresses' },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Saved cards and wallets', path: '/account' },
    { icon: Bell, label: 'Notifications', desc: 'Manage your alerts', path: '/account' },
    { icon: LifeBuoy, label: 'Support Tickets', desc: 'Get help with your orders', path: '/support' },
    { icon: Settings, label: 'Settings', desc: 'Account preferences', path: '/account' },
  ];

  return (
    <div className="container-app section-padding py-6">
      <div className="card p-6 mb-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur">
            {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{profile?.full_name ?? 'User'}</h1>
            <p className="text-white/80 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-white/20 text-white capitalize">{profile?.role ?? 'customer'}</span>
              {profile?.loyalty_points !== undefined && (
                <span className="badge bg-secondary-500 text-white"><Star size={10} /> {profile.loyalty_points} points</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <Link key={i} to={link.path} className="card card-hover p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600">
              <link.icon size={22} />
            </div>
            <div>
              <div className="font-semibold">{link.label}</div>
              <div className="text-xs text-slate-500">{link.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={async () => { await signOut(); toast.success('Signed out'); }}
          className="btn-outline w-full text-secondary-600 border-secondary-300"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {(profile?.role === 'admin' || profile?.role === 'manager') && (
        <div className="mt-6">
          <Link to="/admin" className="btn-primary w-full">
            Go to Admin Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
