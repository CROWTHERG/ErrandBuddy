import { MapPin, Clock, DollarSign, CheckCircle2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getRemainingDays } from '@/lib/orderUtils';

const statusConfig = {
  open: { label: 'Open', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  accepted: { label: 'Accepted', class: 'bg-sky-100 text-sky-700 border-sky-200' },
  in_progress: { label: 'In Progress', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700 border-red-200' },
};

export default function OrderCard({ order }) {
  const status = statusConfig[order.status] || statusConfig.open;
  const remaining = getRemainingDays(order);

  return (
    <Link to={`/order/${order.id}`}>
      <Card className="p-4 hover:shadow-md transition-all border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">{order.title}</h3>
              <p className="text-xs text-muted-foreground">{order.creator_name || 'Anonymous'}</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] ${status.class}`}>{status.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{order.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {order.city || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {order.currency || '$'}{order.amount}
          </span>
          {remaining !== null && remaining > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-3 h-3" />
              {remaining}d left
            </span>
          )}
          {remaining === 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <Clock className="w-3 h-3" />
              Expired
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {order.created_date ? format(new Date(order.created_date), 'MMM d') : ''}
          </span>
        </div>
      </Card>
    </Link>
  );
}
