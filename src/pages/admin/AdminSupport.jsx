import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

function TicketCard({ ticket, onReply }) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply) return;
    setLoading(true);
    await base44.entities.SupportTicket.update(ticket.id, { admin_reply: reply, status: 'done' });
    toast.success('Reply sent!');
    setLoading(false);
    setReply('');
    onReply();
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{ticket.subject}</p>
          <p className="text-xs text-muted-foreground">{ticket.user_name} • {ticket.created_date ? format(new Date(ticket.created_date), 'MMM d, yyyy') : ''}</p>
        </div>
        <Badge variant="outline" className={ticket.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
          {ticket.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{ticket.message}</p>
      {ticket.admin_reply && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-primary">Your reply:</p>
          <p className="text-xs mt-1">{ticket.admin_reply}</p>
        </div>
      )}
      {ticket.status === 'pending' && (
        <div className="flex gap-2">
          <Textarea placeholder="Type reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[60px]" />
          <Button onClick={handleReply} disabled={loading} size="icon" className="shrink-0 self-end">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 200),
  });

  const pending = tickets.filter(t => t.status === 'pending');
  const done = tickets.filter(t => t.status === 'done');
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Support</h2>
      <Tabs defaultValue="pending">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({done.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="space-y-3">
            {pending.length === 0 ? <p className="text-center py-8 text-muted-foreground text-sm">No pending tickets</p> : pending.map(t => <TicketCard key={t.id} ticket={t} onReply={refresh} />)}
          </div>
        </TabsContent>
        <TabsContent value="done">
          <div className="space-y-3">
            {done.length === 0 ? <p className="text-center py-8 text-muted-foreground text-sm">No resolved tickets</p> : done.map(t => <TicketCard key={t.id} ticket={t} onReply={refresh} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
