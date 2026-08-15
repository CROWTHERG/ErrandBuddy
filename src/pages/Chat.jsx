import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Chat() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', orderId],
    queryFn: () => base44.entities.ChatMessage.filter({ order_id: orderId }, 'created_date', 200),
    refetchInterval: 3000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherParty = order?.creator_email === user?.email ? order?.runner_name : order?.creator_name;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await base44.entities.ChatMessage.create({
      order_id: orderId,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      message: message.trim(),
    });
    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['chat', orderId] });
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="font-semibold text-sm">{otherParty || 'Chat'}</p>
          <p className="text-xs text-muted-foreground">Order: {order?.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_email === user?.email;
          return (
            <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2',
                isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
              )}>
                {!isMine && <p className="text-[10px] font-medium mb-0.5 opacity-70">{msg.sender_name}</p>}
                <p className="text-sm">{msg.message}</p>
                <p className={cn('text-[10px] mt-1', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                  {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border bg-card flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="rounded-full"
        />
        <Button onClick={handleSend} disabled={sending} size="icon" className="rounded-full shrink-0">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
