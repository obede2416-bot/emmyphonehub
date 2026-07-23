import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { CartProvider } from './lib/cart';
import { WishlistProvider } from './lib/wishlist';
import { CompareProvider } from './lib/compare';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { AddressesPage } from './pages/AddressesPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { SupportPage } from './pages/SupportPage';
import { DealsPage } from './pages/DealsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:id" element={<OrderConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
          </div>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
