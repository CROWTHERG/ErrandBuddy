import { Card } from '@/components/ui/card';
import { Star, Truck, ShieldCheck } from 'lucide-react';

export default function ReputationCard({ completedDeliveries, avgRating, totalReviews }) {
  const rating = parseFloat(avgRating);
  const hasRating = !isNaN(rating) && totalReviews > 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Reputation & Trust</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-primary" />
            <span className="text-2xl font-bold">{completedDeliveries}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Completed Deliveries</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-2xl font-bold">{hasRating ? rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-2.5 h-2.5 ${hasRating && n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}
