import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle, Package, Star, Truck } from 'lucide-react';
import ReputationCard from '@/components/profile/ReputationCard';

export default function PublicProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const nameParam = urlParams.get('name');

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['public-reviews', email],
    queryFn: () => base44.entities.Review.filter({ reviewee_email: email, type: 'creator_to_runner' }),
    enabled: !!email,
  });

  const { data: runnerOrders = [], isLoading: runnerLoading } = useQuery({
    queryKey: ['public-runner-orders', email],
    queryFn: () => base44.entities.Order.filter({ runner_email: email }),
    enabled: !!email,
  });

  const { data: creatorOrders = [], isLoading: creatorLoading } = useQuery({
    queryKey: ['public-creator-orders', email],
    queryFn: () => base44.entities.Order.filter({ creator_email: email }),
    enabled: !!email,
  });

  const loading = reviewsLoading || runnerLoading || creatorLoading;

  const deliveriesDone = runnerOrders.filter((o) => o.status === 'completed').length;
  const errandsCreated = creatorOrders.length;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const displayName = nameParam || reviews[0]?.reviewee_name || runnerOrders[0]?.runner_name || creatorOrders[0]?.creator_name || email;
  const initials = (displayName || '?').slice(0, 2).toUpperCase();
  const isSelf = user?.email === email;

  if (!email) {
    return <div className="p-4 text-center text-muted-foreground">No profile specified.</div>;
  }

  return (
    <div className="px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card className="p-6 flex flex-col items-center text-center">
        <Avatar className="w-20 h-20 mb-3">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold">{displayName}</h2>
        {isSelf && <Badge variant="outline" className="mt-2">This is you</Badge>}
      </Card>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading stats…</div>
      ) : (
        <>
          <div className="mt-4">
            <ReputationCard completedDeliveries={deliveriesDone} avgRating={avgRating} totalReviews={reviews.length} />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                <span className="text-lg font-bold">{errandsCreated}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Errands Posted</p>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center mb-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                <span className="text-lg font-bold">{deliveriesDone + errandsCreated}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Total Activity</p>
            </Card>
          </div>

          {reviews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Reviews</h3>
              <div className="space-y-2">
                {reviews.slice(0, 8).map((r) => (
                  <Card key={r.id} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{r.reviewer_name || 'Anonymous'}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </span>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}