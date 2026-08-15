import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Bell, MessageCircle } from 'lucide-react';

const STATUS_LABELS = {
  open: 'open',
  accepted: 'accepted',
  in_progress: 'in progress',
  completed: 'completed',
  cancelled: 'cancelled',
};

export default function NotificationListener() {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const fire = (title, body, icon) => {
      toast(title, { description: body, icon });
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch (e) {
          /* ignore */
        }
      }
    };

    const orderUnsub = base44.entities.Order.subscribe((event) => {
      if (event.type !== 'update') return;
      const o = event.data;
      const u = userRef.current;
      if (!u || !o) return;
      if (o.creator_email !== u.email && o.runner_email !== u.email) return;
      fire('Errand status updated', `${o.title} is now ${STATUS_LABELS[o.status] || o.status}`, <Bell className="w-4 h-4" />);
    });

    const chatUnsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type !== 'create') return;
      const m = event.data;
      const u = userRef.current;
      if (!u || !m) return;
      if (m.sender_email === u.email) return;
      fire('New message', `${m.sender_name || 'Someone'}: ${m.message?.slice(0, 80) || ''}`, <MessageCircle className="w-4 h-4" />);
    });

    return () => {
      orderUnsub();
      chatUnsub();
    };
  }, [user]);

  return null;
}
