import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import LoginPrompt from '@/components/LoginPrompt';

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['chat-orders', user?.email],
    queryFn: () => base44.entities.Order.list('-updated_date', 100),
    enabled: !!user,
  });

  const chatOrders = orders.filter(o =>
    (o.creator_email === user?.email || o.runner_email === user?.email) &&
    o.runner_email && o.status !== 'open'
  );

  if (!user) return <LoginPrompt title="Login Required" message="Log in to view your chats." />;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Chats</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : chatOrders.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground text-sm">No active chats yet.</p>
      ) : (
        <div className="space-y-2">
          {chatOrders.map(o => {
            const otherName = o.creator_email === user?.email ? o.runner_name : o.creator_name;
            return (
              <Link key={o.id} to={`/chat/${o.id}`}>
                <Card className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{otherName}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.title}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {o.updated_date ? format(new Date(o.updated_date), 'MMM d') : ''}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
