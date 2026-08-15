import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';

export default function AdminReviews() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 200),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
      <div className="space-y-2">
        {reviews.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{r.reviewer_name} → {r.reviewee_name}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
            </div>
            {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
