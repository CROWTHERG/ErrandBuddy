import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLocation as useGeoLocation } from '@/lib/LocationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, DollarSign, User, CheckCircle, Star, MessageCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getRemainingDays } from '@/lib/orderUtils';
import RatingDialog from '@/components/orders/RatingDialog';
import LiveMap from '@/components/orders/LiveMap';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { location } = useGeoLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [runnerPos, setRunnerPos] = useState(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id }, '-created_date', 1);
      return orders[0];
    },
  });

  const isLiveTracking = user?.email === order?.runner_email && order?.status === 'in_progress';

  useEffect(() => {
    if (!isLiveTracking || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setRunnerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLiveTracking]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!order) return <div className="p-4 text-center text-muted-foreground">Order not found</div>;

  const isCreator = user?.email === order.creator_email;
  const isRunner = user?.email === order.runner_email;
  const canAccept = !isCreator && order.status === 'open';
  const canVerifyPayment = isRunner && order.status === 'in_progress' && !order.payment_verified;
  const canComplete = isRunner && order.status === 'accepted';
  const canRateRunner = isCreator && order.status === 'completed' && !order.creator_rated && order.runner_email;
  const canRateCreator = isRunner && order.status === 'completed' && !order.runner_rated;
  const canChat = (isCreator || isRunner) && order.runner_email && order.status !== 'open';

  const handleAccept = async () => {
    setActionLoading(true);
    await base44.entities.Order.update(order.id, {
      runner_email: user.email,
      runner_name: user.full_name || user.email,
      status: 'accepted',
    });
    toast.success('Order accepted!');
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    setActionLoading(false);
  };

  const handleStartProgress = async () => {
    setActionLoading(true);
    await base44.entities.Order.update(order.id, { status: 'in_progress' });
    toast.success('Order started!');
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    setActionLoading(false);
  };

  const handleVerifyPayment = async () => {
    setActionLoading(true);
    await base44.entities.Order.update(order.id, { payment_verified: true, status: 'completed' });
    toast.success('Payment verified! Order completed.');
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    setActionLoading(false);
  };

  const mapCenter = location || (order.pickup_lat ? { lat: order.pickup_lat, lng: order.pickup_lng } : null);

  return (
    <div className="px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold">{order.title}</h1>
          <Badge variant="outline" className="mt-1">{order.status?.replace('_', ' ')}</Badge>
          {order.payment_verified && <Badge className="ml-2 bg-green-100 text-green-700">Payment Verified</Badge>}
        </div>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{order.description}</p>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium">{order.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-destructive mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="text-sm font-medium">{order.delivery_address}</p>
            </div>
          </div>
        </Card>

        {(() => {
          const hasPickup = order.pickup_lat && order.pickup_lng;
          const hasDelivery = order.delivery_lat && order.delivery_lng;
          const mapMarkers = [];
          if (hasPickup) mapMarkers.push({ lat: order.pickup_lat, lng: order.pickup_lng, label: `Pickup: ${order.pickup_address}`, type: 'pickup' });
          if (hasDelivery) mapMarkers.push({ lat: order.delivery_lat, lng: order.delivery_lng, label: `Delivery: ${order.delivery_address}`, type: 'delivery' });
          if (runnerPos) mapMarkers.push({ lat: runnerPos.lat, lng: runnerPos.lng, label: 'Runner (live)', type: 'you' });
          const route = (hasPickup && hasDelivery) ? [[order.pickup_lat, order.pickup_lng], [order.delivery_lat, order.delivery_lng]] : null;
          const fallback = mapCenter || (hasPickup ? { lat: order.pickup_lat, lng: order.pickup_lng } : null);
          if (!fallback && mapMarkers.length === 0) return null;
          return (
            <LiveMap
              center={fallback}
              markers={mapMarkers}
              route={route}
              live={isLiveTracking}
              height="240px"
            />
          );
        })()}

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-bold text-lg">{order.currency || '$'}{order.amount}</span>
          </div>
          <Badge variant="secondary">{order.payment_method?.replace('_', ' ')}</Badge>
        </Card>

        {order.valid_days && (
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">
                {getRemainingDays(order) > 0
                  ? `${getRemainingDays(order)} day${getRemainingDays(order) !== 1 ? 's' : ''} remaining`
                  : 'Expired'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Valid for {order.valid_days} days</span>
          </Card>
        )}

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Created by:{' '}
              <Link to={`/public-profile?email=${encodeURIComponent(order.creator_email)}&name=${encodeURIComponent(order.creator_name || '')}`} className="text-primary font-semibold hover:underline">
                {order.creator_name}
              </Link>
            </span>
          </div>
          {order.runner_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Runner:{' '}
                <Link to={`/public-profile?email=${encodeURIComponent(order.runner_email)}&name=${encodeURIComponent(order.runner_name || '')}`} className="text-primary font-semibold hover:underline">
                  {order.runner_name}
                </Link>
              </span>
            </div>
          )}
        </Card>

        <div className="space-y-2">
          {canAccept && (
            <Button onClick={handleAccept} disabled={actionLoading} className="w-full h-12 rounded-xl">
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept This Errand'}
            </Button>
          )}
          {canComplete && (
            <Button onClick={handleStartProgress} disabled={actionLoading} className="w-full h-12 rounded-xl">
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Delivery'}
            </Button>
          )}
          {canVerifyPayment && (
            <Button onClick={handleVerifyPayment} disabled={actionLoading} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-5 h-5 mr-2" /> Verify Payment Received
            </Button>
          )}
          {canRateRunner && (
            <Button onClick={() => setRatingOpen(true)} variant="outline" className="w-full h-12 rounded-xl">
              <Star className="w-5 h-5 mr-2" /> Rate Runner
            </Button>
          )}
          {canRateCreator && (
            <Button onClick={() => setRatingOpen(true)} variant="outline" className="w-full h-12 rounded-xl">
              <Star className="w-5 h-5 mr-2" /> Rate Creator
            </Button>
          )}
          {canChat && (
            <Link to={`/chat/${order.id}`} className="block">
              <Button variant="secondary" className="w-full h-12 rounded-xl">
                <MessageCircle className="w-5 h-5 mr-2" /> Chat
              </Button>
            </Link>
          )}
        </div>
      </div>

      {ratingOpen && (
        <RatingDialog
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          order={order}
          reviewerEmail={user.email}
          reviewerName={user.full_name || user.email}
          revieweeEmail={canRateRunner ? order.runner_email : order.creator_email}
          revieweeName={canRateRunner ? order.runner_name : order.creator_name}
          type={canRateRunner ? 'creator_to_runner' : 'runner_to_creator'}
          onDone={() => queryClient.invalidateQueries({ queryKey: ['order', id] })}
        />
      )}
    </div>
  );
}
