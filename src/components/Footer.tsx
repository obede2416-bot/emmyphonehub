import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="container-app section-padding py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Your one-stop shop for the latest smartphones, tablets, and accessories from top brands worldwide.
            </p>
            <div className="mt-4 flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/shop" className="hover:text-primary-600">All Products</Link></li>
              <li><Link to="/shop?category=smartphones" className="hover:text-primary-600">Smartphones</Link></li>
              <li><Link to="/deals" className="hover:text-primary-600">Deals</Link></li>
              <li><Link to="/shop?filter=refurbished" className="hover:text-primary-600">Refurbished</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/support" className="hover:text-primary-600">Help Center</Link></li>
              <li><Link to="/track-order" className="hover:text-primary-600">Track Order</Link></li>
              <li><Link to="/support" className="hover:text-primary-600">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><Mail size={14} /> support@phonehub.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +234 800 PHONEHUB</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 md:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} PhoneHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Smartphone size={14} className="text-primary-600" />
            <span>Secure payments powered by Stripe, Flutterwave & Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
