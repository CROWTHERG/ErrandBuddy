import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLocation as useGeoLocation } from '@/lib/LocationContext';
import OrderCard from '@/components/orders/OrderCard';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [search, setSearch] = useState('');
  const { locationInfo } = useGeoLocation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'open'],
    queryFn: () => base44.entities.Order.filter({ status: 'open' }, '-created_date', 50),
  });

  const filtered = orders.filter(o => {
    const matchesSearch = !search || 
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !locationInfo.city || 
      o.city?.toLowerCase() === locationInfo.city?.toLowerCase() || !o.city;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        {locationInfo.city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 text-primary" />
            <span>{locationInfo.city}, {locationInfo.country}</span>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search errands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-muted/50"
          />
        </div>
      </motion.div>

      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
        Available Errands
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No errands available in your area yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <OrderCard order={order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
