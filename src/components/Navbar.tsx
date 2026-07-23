import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingCart, User, Menu, X, Sun, Moon, ChevronDown, GitCompare,
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCompare } from '@/lib/compare';
import { cn } from '@/lib/utils';
import { fetchCategories, fetchBrands } from '@/lib/api';
import type { Category, Brand } from '@/lib/types';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showCatMenu, setShowCatMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Deals', path: '/deals' },
    { label: 'Compare', path: '/compare' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'glass shadow-md' : 'bg-white dark:bg-slate-950',
        )}
      >
        <div className="container-app section-padding">
          <div className="flex h-16 items-center gap-3">
            <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu size={24} />
            </button>
            <Logo />

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search smartphones, brands..."
                  className="input pl-10 py-2.5 text-sm"
                />
              </div>
            </form>

            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="btn-ghost btn-sm">
                  {link.label}
                </Link>
              ))}
              <div
                className="relative"
                onMouseEnter={() => setShowCatMenu(true)}
                onMouseLeave={() => setShowCatMenu(false)}
              >
                <button className="btn-ghost btn-sm flex items-center gap-1">
                  Categories <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {showCatMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 top-full mt-1 w-64 card p-2 shadow-xl"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="ml-auto flex items-center gap-1">
              <button onClick={toggleTheme} className="btn-ghost btn-sm" aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <Link to="/compare" className="btn-ghost btn-sm relative" aria-label="Compare">
                <GitCompare size={20} />
                {compareCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                    {compareCount}
                  </span>
                )}
              </Link>

              <Link to="/wishlist" className="btn-ghost btn-sm relative" aria-label="Wishlist">
                <Heart size={20} />
                {wishCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-500 text-[10px] font-bold text-white">
                    {wishCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="btn-ghost btn-sm relative" aria-label="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <Link to={profile?.role === 'admin' || profile?.role === 'manager' ? '/admin' : '/account'} className="btn-ghost btn-sm" aria-label="Account">
                  <User size={20} />
                </Link>
              ) : (
                <Link to="/login" className="btn-primary btn-sm hidden sm:flex">
                  Login
                </Link>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search smartphones..."
                className="input pl-10 py-2.5 text-sm"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
                <Logo />
                <button onClick={() => setMobileOpen(false)} className="text-slate-500">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase text-slate-400">Categories</div>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase text-slate-400">Brands</div>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    to={`/shop?brand=${b.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {b.name}
                  </Link>
                ))}
                <div className="pt-3">
                  {user ? (
                    <Link to="/account" onClick={() => setMobileOpen(false)} className="btn-primary w-full">
                      My Account
                    </Link>
                  ) : (
                    <div className="flex gap-2">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1">
                        Login
                      </Link>
                      <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
