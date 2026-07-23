import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart';

export function BottomNav() {
  const location = useLocation();
  const { count } = useCart();

  const links = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3x3, label: 'Categories', path: '/categories' },
    { icon: Search, label: 'Search', path: '/shop' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: count },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-200/50 dark:border-slate-800/50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors',
                active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <div className="relative">
                <link.icon size={22} />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
