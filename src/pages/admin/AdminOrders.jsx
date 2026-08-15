import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from '@/components/orders/OrderCard';
import { Loader2 } from 'lucide-react';

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const created = orders.filter(o => o.status === 'open' || o.status === 'accepted' || o.status === 'in_progress');
  const done = orders.filter(o => o.status === 'completed');

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Orders ({orders.length})</h2>
      <Tabs defaultValue="active">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="active">Active ({created.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({done.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="space-y-2">{created.map(o => <OrderCard key={o.id} order={o} />)}</div>
        </TabsContent>
        <TabsContent value="done">
          <div className="space-y-2">{done.map(o => <OrderCard key={o.id} order={o} />)}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
