import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Truck, ShieldCheck, Headphones, Sparkles, TrendingUp } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { fetchProducts, fetchCategories, fetchBrands, fetchFlashSales } from '@/lib/api';
import type { Product, Category, Brand, FlashSale } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts({ featured: true, limit: 8 }),
      fetchProducts({ bestseller: true, limit: 8 }),
      fetchProducts({ isNew: true, limit: 8 }),
      fetchCategories(),
      fetchBrands(),
      fetchFlashSales(),
    ])
      .then(([f, b, n, c, br, fs]) => {
        setFeatured(f);
        setBestsellers(b);
        setNewArrivals(n);
        setCategories(c);
        setBrands(br);
        setFlashSales(fs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{ width: Math.random() * 6 + 2, height: Math.random() * 6 + 2 }}
              initial={{ x: Math.random() * 1200, y: 800 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: Math.random() * 8 + 6, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
        </div>

        <div className="container-app section-padding relative">
          <div className="grid items-center gap-8 py-12 md:py-20 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
                <Sparkles size={14} /> #1 Phone Store Platform
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Find Your Perfect Smartphone Today
              </h1>
              <p className="mt-4 text-lg text-white/90 max-w-md">
                Latest smartphones from Apple, Samsung, Google, Xiaomi, Tecno, Infinix, Oppo, Vivo and more.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="btn btn-lg bg-white text-primary-700 hover:bg-slate-100">
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link to="/deals" className="btn btn-lg bg-secondary-500 text-white hover:bg-secondary-600">
                  <Zap size={20} /> View Deals
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="relative z-20"
                >
                  <img
                    src="https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Latest smartphone"
                    className="h-96 w-auto rounded-3xl shadow-2xl"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -left-12 top-20 z-10"
                >
                  <img
                    src="https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Smartphone"
                    className="h-64 w-auto rounded-2xl shadow-xl opacity-90"
                  />
                </motion.div>
                <div className="absolute -right-4 -top-4 z-30 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur">
                  <div className="text-2xl font-bold text-primary-600">4.9★</div>
                  <div className="text-xs text-slate-500">50k+ Reviews</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-slate-100 dark:border-slate-800">
        <div className="container-app section-padding py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: ShieldCheck, title: '2-Year Warranty', desc: 'On all phones' },
              { icon: Zap, title: 'Fast Delivery', desc: 'Same-day in Lagos' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600">
                  <b.icon size={22} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{b.title}</div>
                  <div className="text-xs text-slate-500">{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app section-padding py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Shop by Category</h2>
          <Link to="/categories" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {categories.slice(0, 12).map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/shop?category=${cat.slug}`}
                className="card card-hover flex flex-col items-center gap-2 p-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 text-2xl">
                  {cat.icon || '📱'}
                </div>
                <span className="text-xs font-medium">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <section className="container-app section-padding py-6">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-secondary-500 to-secondary-600 px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Zap size={20} className="fill-white" />
                <h2 className="font-display text-lg font-bold">Flash Sales</h2>
              </div>
              <Link to="/deals" className="text-sm underline">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 lg:grid-cols-6">
              {flashSales.slice(0, 6).map((fs) => (
                <Link key={fs.id} to={`/product/${fs.product?.slug}`} className="group">
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                    {fs.product?.thumbnail_url && (
                      <img src={fs.product.thumbnail_url} alt={fs.product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold line-clamp-1">{fs.product?.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-secondary-600">{formatPrice(fs.sale_price)}</span>
                    <span className="text-xs text-slate-400 line-through">{formatPrice(fs.product?.price ?? 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-app section-padding py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Featured Products</h2>
          <Link to="/shop?sort=rating" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Brands */}
      <section className="container-app section-padding py-8">
        <h2 className="mb-6 font-display text-2xl font-bold">Top Brands</h2>
        <div className="flex flex-wrap gap-3">
          {brands.map((brand, i) => (
            <motion.div key={brand.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
              <Link
                to={`/shop?brand=${brand.slug}`}
                className="card card-hover flex items-center gap-3 px-5 py-3"
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="h-8 w-8 rounded object-contain" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
                    {brand.name[0]}
                  </div>
                )}
                <span className="font-semibold">{brand.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container-app section-padding py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-accent-500" /> Bestsellers
          </h2>
          <Link to="/shop?sort=popular" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
            : bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="container-app section-padding py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 md:p-12 text-center text-white">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Get Exclusive Deals</h2>
          <p className="mt-2 text-white/80">Subscribe to our newsletter for the latest phone launches and special offers.</p>
          <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="flex-1 rounded-xl border-0 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white" />
            <button className="btn btn-lg bg-secondary-500 text-white hover:bg-secondary-600">Subscribe</button>
          </form>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-app section-padding py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">New Arrivals</h2>
          <Link to="/shop?sort=newest" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}
