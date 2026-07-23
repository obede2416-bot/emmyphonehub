import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container-app section-padding py-20 text-center">
      <div className="text-8xl font-display font-extrabold gradient-text">404</div>
      <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
      <p className="text-slate-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        <Home size={18} /> Back Home
      </Link>
    </div>
  );
}
