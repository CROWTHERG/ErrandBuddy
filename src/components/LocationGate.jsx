import { useLocation } from '@/lib/LocationContext';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Package } from 'lucide-react';

export default function LocationGate({ children }) {
  const { granted, loading, requestLocation } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Detecting your location…</p>
      </div>
    );
  }

  if (!granted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <Package className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Errand Buddy</h1>
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4 mt-2">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Location Access Required</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Errand Buddy uses your location to show errands near you, set your local currency, and enable live tracking. Please share your location to continue.
        </p>
        <Button onClick={requestLocation} className="w-full max-w-xs h-12 rounded-xl">
          <MapPin className="w-5 h-5 mr-1" /> Share My Location
        </Button>
        <p className="text-xs text-muted-foreground mt-4 max-w-xs">
          Tip: If you denied permission, enable location for this site in your browser settings, then tap the button again.
        </p>
      </div>
    );
  }

  return children;
}
