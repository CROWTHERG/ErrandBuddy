import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from '@/components/orders/OrderCard';
import { Loader2 } from 'lucide-react';
import { isOrderExpired } from '@/lib/orderUtils';

export default function Orders() {
  const { user } = useAuth();

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
    enabled: !!user,
  });

  const created = allOrders.filter(o => o.creator_email === user?.email && !isOrderExpired(o));
  const picked = allOrders.filter(o => o.runner_email === user?.email && o.status === 'completed' && !isOrderExpired(o));
  const doing = allOrders.filter(o => o.runner_email === user?.email && (o.status === 'accepted' || o.status === 'in_progress') && !isOrderExpired(o));
  const history = allOrders.filter(o => (o.creator_email === user?.email || o.runner_email === user?.email) && isOrderExpired(o));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      <Tabs defaultValue="created" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="created" className="text-xs">Created ({created.length})</TabsTrigger>
          <TabsTrigger value="picked" className="text-xs">Picked ({picked.length})</TabsTrigger>
          <TabsTrigger value="doing" className="text-xs">Doing ({doing.length})</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          {created.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No orders created yet.</p>
          ) : (
            <div className="space-y-3">
              {created.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="picked">
          {picked.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No completed pickups yet.</p>
          ) : (
            <div className="space-y-3">
              {picked.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doing">
          {doing.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No active orders.</p>
          ) : (
            <div className="space-y-3">
              {doing.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No expired orders.</p>
          ) : (
            <div className="space-y-3">
              {history.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
