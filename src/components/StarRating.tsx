import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ rating, size = 14, showNumber = false, className }: { rating: number; size?: number; showNumber?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= Math.round(rating) ? 'text-secondary-400 fill-secondary-400' : 'text-slate-300 dark:text-slate-600',
            )}
          />
        ))}
      </div>
      {showNumber && <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{rating.toFixed(1)}</span>}
    </div>
  );
}
