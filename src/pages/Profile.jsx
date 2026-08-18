import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLocation as useGeoLocation } from '@/lib/LocationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { MapPin, Settings, Shield, HelpCircle, FileText, LogOut, CheckCircle, Package, Star } from 'lucide-react';
import LiveMap from '@/components/orders/LiveMap';
import ReputationCard from '@/components/profile/ReputationCard';
import LoginPrompt from '@/components/LoginPrompt';

export default function Profile() {
  const { user, logout } = useAuth();
  const { location, locationInfo, granted, requestLocation } = useGeoLocation();

  useEffect(() => {
    if (!granted) requestLocation();
  }, [granted, requestLocation]);

  const { data: orders = [] } = useQuery({
    queryKey: ['user-orders-stats', user?.email],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ reviewee_email: user?.email, type: 'creator_to_runner' }),
    enabled: !!user,
  });

  const created = orders.filter(o => o.creator_email === user?.email).length;
  const completedDeliveries = orders.filter(o => o.runner_email === user?.email && o.status === 'completed').length;
  const completed = orders.filter(o => (o.creator_email === user?.email || o.runner_email === user?.email) && o.status === 'completed').length;
  const active = orders.filter(o => (o.creator_email === user?.email || o.runner_email === user?.email) && ['accepted', 'in_progress'].includes(o.status)).length;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  const initials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();

  if (!user) return <LoginPrompt title="Login Required" message="Log in to view your profile." />;

  return (
    <div className="px-4 py-4">
      <Card className="p-6 flex flex-col items-center text-center">
        <Avatar className="w-20 h-20 mb-3">
          <AvatarImage src={user?.profile_picture} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold">{user?.full_name || 'User'}</h2>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        {user?.verified && (
          <Badge className="mt-2 bg-emerald-100 text-emerald-700 gap-1">
            <CheckCircle className="w-3 h-3" /> Verified
          </Badge>
        )}
        {locationInfo.city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <MapPin className="w-3 h-3" />
            <span>{locationInfo.city}, {locationInfo.country}</span>
          </div>
        )}
      </Card>

      <div className="mt-4">
        <ReputationCard completedDeliveries={completedDeliveries} avgRating={avgRating} totalReviews={reviews.length} />
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          { label: 'Created', value: created, icon: Package },
          { label: 'Done', value: completed, icon: CheckCircle },
          { label: 'Active', value: active, icon: Package },
          { label: 'Rating', value: avgRating, icon: Star },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {location && (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Live Location</h3>
          <LiveMap center={location} markers={[{ lat: location.lat, lng: location.lng, label: 'You' }]} height="150px" />
        </div>
      )}

      <div className="mt-4 space-y-1">
        <Link to="/settings">
          <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </Card>
        </Link>
        <Link to="/verification">
          <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Verification</span>
          </Card>
        </Link>
        <Link to="/support">
          <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Support</span>
          </Card>
        </Link>
        <Link to="/terms">
          <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Terms & Policy</span>
          </Card>
        </Link>
        <Card
          className="p-3 flex items-center gap-3 hover:bg-destructive/10 transition-colors cursor-pointer"
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Logout</span>
        </Card>
      </div>
    </div>
  );
}