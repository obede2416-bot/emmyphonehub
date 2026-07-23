import { Link } from 'react-router-dom';
import { Smartphone, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', icon: 14, text: 'text-lg' },
    md: { box: 'w-9 h-9', icon: 18, text: 'text-xl' },
    lg: { box: 'w-12 h-12', icon: 24, text: 'text-2xl' },
  };
  const s = sizes[size];
  return (
    <Link to="/" className={cn('flex items-center gap-2 font-display font-extrabold', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-md',
          s.box,
        )}
      >
        <Smartphone size={s.icon} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <ShoppingBag size={s.icon - 4} className="absolute right-0 bottom-0 translate-x-1 translate-y-1 opacity-90" />
      </div>
      <span className={cn('gradient-text', s.text)}>PhoneHub</span>
    </Link>
  );
}
