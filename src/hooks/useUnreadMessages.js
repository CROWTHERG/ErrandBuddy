import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useUnreadMessages() {
  const { user } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ['unread-orders', user?.email],
    queryFn: () => base44.entities.Order.list('-updated_date', 100),
    enabled: !!user,
  });

  const myOrderIds = new Set(
    orders
      .filter(o => (o.creator_email === user?.email || o.runner_email === user?.email) && o.runner_email)
      .map(o => o.id)
  );

  const { data: unreadMsgs = [] } = useQuery({
    queryKey: ['unread-msgs', user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ read: false }, '-created_date', 200),
    enabled: !!user,
    refetchInterval: 10000,
  });

  const unreadCount = unreadMsgs.filter(
    m => m.sender_email !== user?.email && myOrderIds.has(m.order_id)
  ).length;

  return unreadCount;
}
